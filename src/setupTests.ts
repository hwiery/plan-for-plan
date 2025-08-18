// Mock environment variables
process.env.GOOGLE_GEMINI_API_KEY = 'mock-api-key';
process.env.NEXTAUTH_SECRET = 'mock-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'mock-database-url';

// Mock auth-utils directly
jest.mock('@/lib/auth-utils', () => ({
  requireAuth: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));