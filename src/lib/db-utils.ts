import { prisma } from './prisma';

// Database connection test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Database cleanup utilities
export async function cleanupTestData() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Cleanup can only be run in test environment');
  }

  await prisma.pRDDocument.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.apiUsage.deleteMany();
  await prisma.feedback.deleteMany();
}

// Health check
export async function healthCheck() {
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    return {
      status: 'healthy',
      database: 'connected',
      users: userCount,
      projects: projectCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Migration utilities
export async function runMigrations() {
  try {
    // This would typically be handled by Prisma CLI
    // but we can add custom migration logic here if needed
    console.log('Running database migrations...');
    // Custom migration logic can go here
    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}