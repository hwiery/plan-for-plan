
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prdService } from '@/services/database';

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await requireAuth();
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    const prdDocument = await prdService.findLatestByProjectId(projectId);

    if (!prdDocument) {
      return NextResponse.json({ message: 'PRD document not found' }, { status: 404 });
    }

    return NextResponse.json(prdDocument);

  } catch (error) {
    console.error('Error fetching PRD document:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
