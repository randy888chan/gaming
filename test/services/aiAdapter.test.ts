import * as aiAdapter from '../../src/services/aiAdapter';
import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

describe('aiAdapter', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getSmartBetSuggestion', () => {
    it('should return a smart bet suggestion on successful response', async () => {
      const mockSuggestion = {
        marketId: 'market-123',
        outcome: 'YES',
        suggestedBetAmount: 100,
        confidenceScore: 0.85,
        reasoning: 'High confidence based on market trends',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuggestion),
      });

      const result = await aiAdapter.getSmartBetSuggestion('market-123', 'user-456');

      expect(result).toEqual(mockSuggestion);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String), // AI_SERVICE_API_URL from constants
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': expect.any(String), // AI_SERVICE_API_KEY from constants
          },
          body: JSON.stringify({
            marketId: 'market-123',
            userId: 'user-456',
          }),
        })
      );
    });

    it('should return null on failed response', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const result = await aiAdapter.getSmartBetSuggestion('market-123', 'user-456');

      expect(result).toBeNull();
    });

    it('should retry on rate limit and eventually succeed', async () => {
      // First call: rate limit
      // Second call: success
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 429,
          headers: new Map([['Retry-After', '1']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({
            marketId: 'market-123',
            outcome: 'YES',
            suggestedBetAmount: 100,
            confidenceScore: 0.85,
          }),
        });

      const result = await aiAdapter.getSmartBetSuggestion('market-123', 'user-456');

      expect(result).not.toBeNull();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should return null after max retries on rate limit', async () => {
      // All calls return rate limit
      (fetch as jest.Mock).mockResolvedValue({
        status: 429,
        headers: new Map(),
      });

      const result = await aiAdapter.getSmartBetSuggestion('market-123', 'user-456');

      expect(result).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(3); // MAX_RETRIES = 3
    });
  });

  describe('generateTextContent', () => {
    it('should return success response on successful API call', async () => {
      const mockContent = 'Generated text content';
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(mockContent),
      });

      const request = { prompt: 'Generate some content' };
      const result = await aiAdapter.generateTextContent(request);

      expect(result).toEqual({
        success: true,
        content: mockContent,
      });
    });

    it('should return error response on failed API call', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const request = { prompt: 'Generate some content' };
      const result = await aiAdapter.generateTextContent(request);

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('AI service responded with status 500'),
      });
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = { prompt: 'Generate some content' };
      const result = await aiAdapter.generateTextContent(request);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });
  });

  describe('generatePSEOContent', () => {
    it('should generate pSEO content successfully', async () => {
      // Mock the sequential API calls
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('Title\nDescription\nMain content line 1\nMain content line 2'),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('keyword1, keyword2, keyword3'),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('Image prompt description'),
        });

      const result = await aiAdapter.generatePSEOContent();

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Title');
      expect(result?.description).toContain('Description');
      expect(result?.keywords).toBe('keyword1, keyword2, keyword3');
      expect(result?.imagePrompt).toBe('Image prompt description');
    });

    it('should return null if main content generation fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const result = await aiAdapter.generatePSEOContent();

      expect(result).toBeNull();
    });
  });

  describe('generateSocialPost', () => {
    it('should generate a social media post successfully', async () => {
      const mockPost = 'Exciting news! Check out our latest predictions. #predictionmarkets #blockchaingaming';
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(mockPost),
      });

      const result = await aiAdapter.generateSocialPost('Base content for social post');

      expect(result).toBe(mockPost);
    });

    it('should return null if social post generation fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const result = await aiAdapter.generateSocialPost('Base content for social post');

      expect(result).toBeNull();
    });
  });
});