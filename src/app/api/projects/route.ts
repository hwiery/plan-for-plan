
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { projectService } from '@/services/database';

export async function GET(req: Request) {
    try {
        const user = await requireAuth();
        const projects = await projectService.findByUserId(user.id);
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { name, initialIdea } = await req.json();

    if (!initialIdea) {
      return NextResponse.json({ message: 'Initial idea is required' }, { status: 400 });
    }

    const project = await projectService.create({
      userId: user.id,
      name: name || 'Untitled Project',
      initialIdea,
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error('Project creation error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during project creation' }, { status: 500 });
  }
}
