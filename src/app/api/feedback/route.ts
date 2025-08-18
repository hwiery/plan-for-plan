
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { feedbackService } from '@/services/database';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { projectId, rating, comment } = await req.json();

    if (!rating) {
      return NextResponse.json({ message: 'Rating is required' }, { status: 400 });
    }

    await feedbackService.create({
      userId: user.id,
      projectId,
      rating,
      comment,
    });

    return NextResponse.json({ message: 'Feedback submitted successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Feedback submission error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during feedback submission' }, { status: 500 });
  }
}
