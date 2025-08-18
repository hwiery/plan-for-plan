import { GET, POST } from '@/app/api/projects/route';
import { requireAuth } from '@/lib/auth-utils';
import { projectService } from '@/services/database';

// Mock external dependencies
jest.mock('@/lib/auth-utils');
jest.mock('@/services/database');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('/api/projects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    const mockProjects = [
      {
        id: 'project1',
        name: 'Test Project 1',
        initialIdea: 'Test idea 1',
        userId: 'user123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return user projects successfully', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);
      mockProjectService.findByUserId.mockResolvedValue(mockProjects);

      const mockRequest = {} as Request;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProjects);
      expect(mockProjectService.findByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const mockRequest = {} as Request;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Authentication required');
    });

    it('should return 500 on unexpected error', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);
      mockProjectService.findByUserId.mockRejectedValue(new Error('Database error'));

      const mockRequest = {} as Request;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('An unexpected error occurred');
    });
  });

  describe('POST /api/projects', () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };

    const mockProject = {
      id: 'project123',
      name: 'Test Project',
      initialIdea: 'A new idea',
      userId: 'user123',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new project if authenticated', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);
      mockProjectService.create.mockResolvedValue(mockProject);

      const mockRequest = {
        json: async () => ({ name: 'Test Project', initialIdea: 'A new idea' }),
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockProject);
      expect(mockProjectService.create).toHaveBeenCalledWith({
        userId: 'user123',
        name: 'Test Project',
        initialIdea: 'A new idea',
      });
    });

    it('should create project with default name when name is not provided', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);
      mockProjectService.create.mockResolvedValue({
        ...mockProject,
        name: 'Untitled Project',
      });

      const mockRequest = {
        json: async () => ({ initialIdea: 'A new idea' }),
      } as Request;

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
      expect(mockProjectService.create).toHaveBeenCalledWith({
        userId: 'user123',
        name: 'Untitled Project',
        initialIdea: 'A new idea',
      });
    });

    it('should return 401 if not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      const mockRequest = {
        json: async () => ({ name: 'Test Project', initialIdea: 'A new idea' }),
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Authentication required');
    });

    it('should return 400 if initialIdea is missing', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);

      const mockRequest = {
        json: async () => ({ name: 'Test Project' }),
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Initial idea is required');
    });

    it('should return 500 on unexpected error', async () => {
      mockRequireAuth.mockResolvedValue(mockUser);
      mockProjectService.create.mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: async () => ({ name: 'Test Project', initialIdea: 'A new idea' }),
      } as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('An unexpected error occurred during project creation');
    });
  });
});