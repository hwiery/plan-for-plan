import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      planType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }
  
  if (password.length > 128) {
    errors.push('비밀번호는 128자를 초과할 수 없습니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호에는 소문자가 포함되어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호에는 대문자가 포함되어야 합니다.');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에는 숫자가 포함되어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}