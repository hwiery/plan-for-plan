
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { apiUsageService, userService } from '@/services/database';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const usage = await apiUsageService.getUserUsage(user.id);
    const totalTokens = usage.reduce((acc, item) => acc + item.tokens, 0);

    const currentUser = await userService.findById(user.id);

    return NextResponse.json({
      totalTokens,
      planType: currentUser?.planType || 'free',
    });

  } catch (error) {
    console.error('Error fetching user usage:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
