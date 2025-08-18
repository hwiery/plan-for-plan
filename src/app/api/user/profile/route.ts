
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { userService } from '@/services/database';

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const { name } = await req.json();

    const updatedUser = await userService.update(user.id, { name });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during profile update' }, { status: 500 });
  }
}
