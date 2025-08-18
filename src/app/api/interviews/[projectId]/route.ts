
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { projectService, interviewService } from '@/services/database';

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await requireAuth();
    const { projectId } = await params;

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

    return NextResponse.json({ project, session });

  } catch (error) {
    console.error('Error fetching interview data:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        await requireAuth();
        const { projectId } = await params;
        const { answer, questionIndex } = await req.json();

        if (!projectId) {
            return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
        }

        const session = await interviewService.findByProjectId(projectId);
        if (!session) {
            return NextResponse.json({ message: 'Interview session not found' }, { status: 404 });
        }

        const answers = Array.isArray(session.answers) ? [...session.answers] : [];
        answers[questionIndex] = answer;

        const updatedSession = await interviewService.update(projectId, { answers });

        return NextResponse.json(updatedSession);

    } catch (error) {
        console.error('Error submitting answer:', error);
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
    }
}
