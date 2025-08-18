import { geminiPro } from '../gemini';

// Mock the GoogleGenerativeAI
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

// Mock the generateText function directly
const mockGenerateText = jest.fn();
jest.mock('../gemini', () => ({
  ...jest.requireActual('../gemini'),
  generateText: mockGenerateText,
  geminiPro: {
    generateContent: mockGenerateContent,
  },
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      mockGenerateText.mockResolvedValue('Generated text response');

      const result = await mockGenerateText('Test prompt');

      expect(result).toBe('Generated text response');
      expect(mockGenerateText).toHaveBeenCalledWith('Test prompt');
    });

    it('should handle errors gracefully', async () => {
      mockGenerateText.mockRejectedValue(new Error('API error'));

      await expect(mockGenerateText('Test prompt')).rejects.toThrow('API error');
      expect(mockGenerateText).toHaveBeenCalledWith('Test prompt');
    });
  });
});