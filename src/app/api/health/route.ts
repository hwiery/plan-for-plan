import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db-utils';

export async function GET() {
  try {
    const health = await healthCheck();
    
    if (health.status === 'healthy') {
      return NextResponse.json(health, { status: 200 });
    } else {
      return NextResponse.json(health, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}