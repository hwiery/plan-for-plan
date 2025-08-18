
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { projectService, interviewService, prdService, apiUsageService } from '@/services/database';
import { generateText } from '@/lib/gemini';
import { PromptTemplates, fillTemplate } from '@/lib/prompts';

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

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    const project = await projectService.findById(projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const session = await interviewService.findByProjectId(projectId);
    if (!session || !session.completedAt) {
      return NextResponse.json({ message: 'Interview not completed' }, { status: 400 });
    }

    const questions = Array.isArray(session.questions) ? session.questions : [];
    const answers = Array.isArray(session.answers) ? session.answers : [];
    
    // Build comprehensive context for the new detailed templates
    const qa_history = questions.map((q: unknown, i: number) => {
        const question = typeof q === 'object' && q && 'text' in q ? (q as { text: string }).text : String(q);
        return `Q: ${question}\nA: ${answers[i] || ''}`;
    }).join('\n\n');

    const contextData = {
        context: `
Project Idea: ${project.initialIdea}

Interview Questions & Answers:
${qa_history}

Project Requirements Summary:
Based on the interview responses, this project needs to be implemented with the following considerations:
- User needs and pain points identified through Q&A
- Technical requirements derived from user responses  
- Business logic and workflow requirements
- Integration and scalability considerations
        `.trim()
    };

    const prdContent: Record<string, string> = {};
    let totalTokens = 0;

    for (const key in PromptTemplates.prdGeneration) {
        const template = PromptTemplates.prdGeneration[key as keyof typeof PromptTemplates.prdGeneration];
        const prompt = fillTemplate(template, contextData);
        const generatedContent = await generateText(prompt);
        prdContent[key] = generatedContent || '';
        totalTokens += (prompt.length + (generatedContent?.length || 0)) / 4; // Simple estimation
    }

    // Track API usage
    await apiUsageService.track({
        userId: user.id,
        endpoint: '/api/prd/generate',
        tokens: Math.ceil(totalTokens),
        cost: 0, // Cost calculation can be added later
    });

    const prdDocument = await prdService.create({
        projectId,
        content: prdContent,
    });

    return NextResponse.json(prdDocument);

  } catch (error) {
    console.error('PRD generation error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during PRD generation' }, { status: 500 });
  }
}
