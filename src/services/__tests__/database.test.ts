import {
  userService,
  projectService,
  interviewService,
  prdService,
  apiUsageService,
  feedbackService,
} from '@/services/database';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    interviewSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pRDDocument: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    apiUsage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    feedback: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Database Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userService', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      avatarUrl: null,
      planType: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a user', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      const user = await userService.create(userData);

      expect(user).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
    });

    it('should find a user by ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await userService.findById('user123');

      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
    });

    it('should find a user by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await userService.findByEmail('test@example.com');

      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const user = await userService.update('user123', { name: 'Updated Name' });

      expect(user).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'Updated Name' },
      });
    });

    it('should delete a user', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const user = await userService.delete('user123');

      expect(user).toEqual(mockUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
    });

    it('should return null if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await userService.findById('nonexistent_id');

      expect(user).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent_id' },
      });
    });
  });

  describe('projectService', () => {
    const mockProject = {
      id: 'project123',
      userId: 'user123',
      name: 'Test Project',
      initialIdea: 'Test idea',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a project', async () => {
      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      const projectData = {
        userId: 'user123',
        name: 'Test Project',
        initialIdea: 'Test idea',
      };

      const project = await projectService.create(projectData);

      expect(project).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({ data: projectData });
    });

    it('should find a project by ID with includes', async () => {
      const projectWithIncludes = {
        ...mockProject,
        user: { id: 'user123', email: 'test@example.com' },
        interviewSession: null,
        prdDocuments: [],
      };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(projectWithIncludes);

      const project = await projectService.findById('project123');

      expect(project).toEqual(projectWithIncludes);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project123' },
        include: {
          user: true,
          interviewSession: true,
          prdDocuments: true,
        },
      });
    });

    it('should find projects by user ID', async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue([mockProject]);

      const projects = await projectService.findByUserId('user123');

      expect(projects).toEqual([mockProject]);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('interviewService', () => {
    const mockInterview = {
      id: 'interview123',
      projectId: 'project123',
      questions: { q1: 'Question 1' },
      answers: { q1: 'Answer 1' },
      currentStep: 1,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an interview session', async () => {
      (prisma.interviewSession.create as jest.Mock).mockResolvedValue(mockInterview);

      const interviewData = {
        projectId: 'project123',
        questions: { q1: 'Question 1' },
        answers: { q1: 'Answer 1' },
      };

      const interview = await interviewService.create(interviewData);

      expect(interview).toEqual(mockInterview);
      expect(prisma.interviewSession.create).toHaveBeenCalledWith({ data: interviewData });
    });

    it('should complete an interview session', async () => {
      const completedInterview = { ...mockInterview, completedAt: new Date() };
      (prisma.interviewSession.update as jest.Mock).mockResolvedValue(completedInterview);

      const interview = await interviewService.complete('project123');

      expect(interview).toEqual(completedInterview);
      expect(prisma.interviewSession.update).toHaveBeenCalledWith({
        where: { projectId: 'project123' },
        data: { completedAt: expect.any(Date) },
      });
    });
  });

  describe('apiUsageService', () => {
    const mockUsage = {
      id: 'usage123',
      userId: 'user123',
      endpoint: '/api/test',
      tokens: 100,
      cost: 0.01,
      createdAt: new Date(),
    };

    it('should track API usage', async () => {
      (prisma.apiUsage.create as jest.Mock).mockResolvedValue(mockUsage);

      const usageData = {
        userId: 'user123',
        endpoint: '/api/test',
        tokens: 100,
        cost: 0.01,
      };

      const usage = await apiUsageService.track(usageData);

      expect(usage).toEqual(mockUsage);
      expect(prisma.apiUsage.create).toHaveBeenCalledWith({ data: usageData });
    });

    it('should get user usage with date range', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([mockUsage]);

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      const usage = await apiUsageService.getUserUsage('user123', startDate, endDate);

      expect(usage).toEqual([mockUsage]);
      expect(prisma.apiUsage.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});