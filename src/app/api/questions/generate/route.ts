
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { projectService, interviewService, apiUsageService } from '@/services/database';
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

    let session = await interviewService.findByProjectId(projectId);
    if (!session) {
      session = await interviewService.create({ projectId, questions: [], answers: [] });
    }

    const questions = Array.isArray(session.questions) ? session.questions : [];
    const answers = Array.isArray(session.answers) ? session.answers : [];
    const qaHistory = questions.map((q: unknown, i: number) => {
        const question = typeof q === 'object' && q && 'text' in q ? (q as { text: string }).text : String(q);
        return `Q: ${question}\nA: ${answers[i] || ''}`;
    }).join('\n\n');

    const prompt = fillTemplate(PromptTemplates.questionGeneration, {
      idea: project.initialIdea,
      qa_history: qaHistory,
    });

    const rawResponse = await generateText(prompt);

    // Track API usage
    const tokens = (prompt.length + (rawResponse?.length || 0)) / 4; // Simple estimation
    await apiUsageService.track({
        userId: user.id,
        endpoint: '/api/questions/generate',
        tokens: Math.ceil(tokens),
        cost: 0, // Cost calculation can be added later
    });

    // Parse the response
    const lines = (rawResponse || '').split('\n');
    let nextQuestion = '';
    let questionType = 'text';
    let options: string[] = [];

    lines.forEach(line => {
        if (line.startsWith('Question:')) {
            nextQuestion = line.substring('Question:'.length).trim();
        } else if (line.startsWith('Type:')) {
            questionType = line.substring('Type:'.length).trim();
        } else if (line.startsWith('Options:')) {
            options = line.substring('Options:'.length).trim().split('|');
        }
    });

    if (!nextQuestion) {
        // Fallback for when the model doesn't follow the format
        nextQuestion = rawResponse || 'Could you tell me more about your project requirements?';
        questionType = 'text';
        options = [];
    }

    // A simple logic to determine if the interview is complete.
    // This should be improved with a more sophisticated algorithm.
    if (nextQuestion.toLowerCase().includes('prd를 생성할 준비가 되었습니다')) {
        await interviewService.update(projectId, { completedAt: new Date() });
        return NextResponse.json({ finished: true });
    }

    const updatedQuestions = [...questions, { text: nextQuestion, type: questionType, options }];
    await interviewService.update(projectId, { questions: updatedQuestions });

    return NextResponse.json({ question: { text: nextQuestion, type: questionType, options } });

  } catch (error) {
    console.error('Question generation error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during question generation' }, { status: 500 });
  }
}
