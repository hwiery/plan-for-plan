import { POST } from '../analyze/route';
import { requireAuth } from '@/lib/auth-utils';
import { generateText } from '@/lib/gemini';
import { fillTemplate, PromptTemplates } from '@/lib/prompts';
import { apiUsageService } from '@/services/database';

// Mock dependencies
jest.mock('@/lib/auth-utils');
jest.mock('@/lib/gemini');
jest.mock('@/lib/prompts');
jest.mock('@/services/database');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>;
const mockFillTemplate = fillTemplate as jest.MockedFunction<typeof fillTemplate>;
const mockApiUsageService = apiUsageService as jest.Mocked<typeof apiUsageService>;

// Mock socket property for rate limiting tests
Object.defineProperty(globalThis, 'Request', {
  value: class MockRequest {
    headers: Map<string, string>;
    socket: { remoteAddress: string };
    
    constructor(input: string, init: Record<string, unknown> = {}) {
      this.headers = new Map();
      this.socket = { remoteAddress: '127.0.0.1' };
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string);
        });
      }
    }
    
    get(key: string) {
      return this.headers.get(key.toLowerCase()) || null;
    }
    
    async json() {
      return {};
    }
  } as typeof Request,
});

describe('POST /api/ideas/analyze', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock a timestamp in the past to avoid rate limiting
    Date.now = jest.fn(() => 1000000000); // Fixed timestamp
  });

  it('should analyze idea successfully', async () => {
    mockRequireAuth.mockResolvedValue(mockUser);
    mockFillTemplate.mockReturnValue('filled prompt');
    mockGenerateText.mockResolvedValue('Category: Web Application\nFeasibility: High\nSimilar Services: Google Drive, Dropbox');
    mockApiUsageService.track.mockResolvedValue(undefined);

    const mockRequest = {
      headers: new Map([['x-forwarded-for', '127.0.0.1']]),
      socket: { remoteAddress: '127.0.0.1' },
      json: async () => ({ idea: 'A cloud storage service' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toEqual({
      category: 'Web Application',
      feasibility: 'High',
      similarServices: ['Google Drive', 'Dropbox'],
    });
    expect(mockFillTemplate).toHaveBeenCalledWith(PromptTemplates.ideaAnalysis, { idea: 'A cloud storage service' });
    expect(mockGenerateText).toHaveBeenCalledWith('filled prompt');
    expect(mockApiUsageService.track).toHaveBeenCalledWith({
      userId: 'user123',
      endpoint: '/api/ideas/analyze',
      tokens: expect.any(Number),
      cost: 0,
    });
  });

  it('should return 400 when idea is missing', async () => {
    mockRequireAuth.mockResolvedValue(mockUser);

    const mockRequest = {
      headers: new Map(),
      socket: { remoteAddress: '127.0.0.1' },
      json: async () => ({}),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Idea is required');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

    const mockRequest = {
      headers: new Map(),
      socket: { remoteAddress: '127.0.0.1' },
      json: async () => ({ idea: 'Test idea' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Authentication required');
  });

  it('should handle parsing errors gracefully', async () => {
    mockRequireAuth.mockResolvedValue(mockUser);
    mockFillTemplate.mockReturnValue('filled prompt');
    mockGenerateText.mockResolvedValue('Malformed response without proper structure');
    mockApiUsageService.track.mockResolvedValue(undefined);

    const mockRequest = {
      headers: new Map(),
      socket: { remoteAddress: '127.0.0.1' },
      json: async () => ({ idea: 'Test idea' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toEqual({
      category: 'Unknown',
      feasibility: 'Unknown',
      similarServices: [],
    });
  });

  it('should return 500 on unexpected error', async () => {
    mockRequireAuth.mockResolvedValue(mockUser);
    mockFillTemplate.mockReturnValue('filled prompt');
    mockGenerateText.mockRejectedValue(new Error('API error'));

    const mockRequest = {
      headers: new Map(),
      socket: { remoteAddress: '127.0.0.1' },
      json: async () => ({ idea: 'Test idea' }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('An unexpected error occurred during idea analysis');
  });
});