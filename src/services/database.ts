import { prisma } from '@/lib/prisma';
import type {
  User,
  Project,
  InterviewSession,
  PRDDocument,
} from '@prisma/client';

// User operations
export const userService = {
  async create(data: {
    email: string;
    password?: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  },
};

// Project operations
export const projectService = {
  async create(data: {
    userId: string;
    name?: string;
    initialIdea: string;
  }): Promise<Project> {
    return prisma.project.create({
      data,
    });
  },

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        interviewSession: true,
        prdDocuments: true,
      },
    });
  },

  async findByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    });
  },
};

// Interview Session operations
export const interviewService = {
  async create(data: {
    projectId: string;
    questions: object;
    answers: object;
  }): Promise<InterviewSession> {
    return prisma.interviewSession.create({
      data,
    });
  },

  async findByProjectId(projectId: string): Promise<InterviewSession | null> {
    return prisma.interviewSession.findUnique({
      where: { projectId },
    });
  },

  async update(
    projectId: string,
    data: {
      questions?: object;
      answers?: object;
      currentStep?: number;
      completedAt?: Date;
    }
  ): Promise<InterviewSession> {
    return prisma.interviewSession.update({
      where: { projectId },
      data,
    });
  },

  async complete(projectId: string): Promise<InterviewSession> {
    return prisma.interviewSession.update({
      where: { projectId },
      data: {
        completedAt: new Date(),
      },
    });
  },
};

// PRD Document operations
export const prdService = {
  async create(data: {
    projectId: string;
    content: object;
    version?: number;
  }): Promise<PRDDocument> {
    return prisma.pRDDocument.create({
      data,
    });
  },

  async findByProjectId(projectId: string): Promise<PRDDocument[]> {
    return prisma.pRDDocument.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
  },

  async findLatestByProjectId(projectId: string): Promise<PRDDocument | null> {
    return prisma.pRDDocument.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
  },

  async update(id: string, data: { content: object }): Promise<PRDDocument> {
    return prisma.pRDDocument.update({
      where: { id },
      data,
    });
  },
};

// API Usage tracking
export const apiUsageService = {
  async track(data: {
    userId: string;
    endpoint: string;
    tokens: number;
    cost: number;
  }) {
    return prisma.apiUsage.create({
      data,
    });
  },

  async getUserUsage(userId: string, startDate?: Date, endDate?: Date) {
    return prisma.apiUsage.findMany({
      where: {
        userId,
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// Feedback operations
export const feedbackService = {
  async create(data: {
    userId?: string;
    projectId?: string;
    rating: number;
    comment?: string;
  }) {
    return prisma.feedback.create({
      data,
    });
  },

  async getAll() {
    return prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
};