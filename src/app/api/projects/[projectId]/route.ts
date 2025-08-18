
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { projectService } from '@/services/database';

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireAuth();
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    const project = await projectService.findById(projectId);
    if (!project || project.userId !== user.id) {
        return NextResponse.json({ message: 'Project not found or you do not have permission to delete it' }, { status: 404 });
    }

    await projectService.delete(projectId);

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Project deletion error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during project deletion' }, { status: 500 });
  }
}
