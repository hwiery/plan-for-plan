
import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { PromptTemplates, fillTemplate } from '@/lib/prompts';
import { requireAuth } from '@/lib/auth-utils';
import { apiUsageService } from '@/services/database';

const rateLimit = new Map();
const MAX_REQUESTS = 5; // Max requests per minute
const WINDOW_SIZE = 60 * 1000; // 1 minute

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Simple Rate Limiting
    const userIp = req.headers.get('x-forwarded-for') || 'unknown';
    const lastRequestTime = rateLimit.get(userIp) || 0;
    const currentTime = Date.now();

    if (currentTime - lastRequestTime < WINDOW_SIZE / MAX_REQUESTS) {
        return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    rateLimit.set(userIp, currentTime);

    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ message: 'Idea is required' }, { status: 400 });
    }

    const prompt = fillTemplate(PromptTemplates.ideaAnalysis, { idea });
    const analysisText = await generateText(prompt);

    // Track API usage
    const tokens = (prompt.length + (analysisText?.length || 0)) / 4; // Simple estimation
    await apiUsageService.track({
        userId: user.id,
        endpoint: '/api/ideas/analyze',
        tokens: Math.ceil(tokens),
        cost: 0, // Cost calculation can be added later
    });

    // Basic parsing, assuming the output is well-structured.
    // A more robust solution would involve more sophisticated parsing and validation.
    const lines = (analysisText || '').split('\n').filter(line => line.trim() !== '');
    const analysis = {
      category: 'Unknown',
      feasibility: 'Unknown',
      similarServices: [] as string[],
    };

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key.includes('Category')) {
        analysis.category = value;
      } else if (key.includes('Feasibility')) {
        analysis.feasibility = value;
      } else if (key.includes('Similar Services')) {
        // This assumes similar services are listed in the same line.
        // A better approach would be to handle multi-line lists.
        analysis.similarServices = value.split(',').map(s => s.trim());
      }
    });

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Idea analysis error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during idea analysis' }, { status: 500 });
  }
}
