// Integration test for pSEO workflow
// This test verifies the interaction between pSeoGenerator worker, AI adapter, and database

import * as pSeoGeneratorWorker from '../workers/pSeoGenerator/index';
import * as aiAdapter from '../services/aiAdapter';

// Mock the AI adapter
jest.mock('../services/aiAdapter', () => ({
  generatePSEOContent: jest.fn(),
  generateSocialPost: jest.fn(),
}));

describe('pSEO Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate pSEO content and enqueue social post message', async () => {
    // Mock the AI adapter responses
    const mockPSEOContent = {
      title: 'Test pSEO Content',
      description: 'This is a test pSEO content',
      keywords: ['test', 'pseo'],
      htmlBody: '<p>Test content</p>',
    };

    (aiAdapter.generatePSEOContent as jest.Mock).mockResolvedValue(mockPSEOContent);
    (aiAdapter.generateSocialPost as jest.Mock).mockResolvedValue('Check out this content!');

    // Mock environment with database and queue
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({ results: [] }),
      first: jest.fn().mockResolvedValue(null),
    };

    const mockQueue = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const mockEnv = {
      DB: mockDB,
      SOCIAL_POST_QUEUE: mockQueue,
    } as any;

    const controller = {} as any;
    const ctx = {} as any;

    // Execute the worker
    await pSeoGeneratorWorker.default.scheduled(controller, mockEnv, ctx);

    // Verify that the AI adapter was called to generate pSEO content
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();

    // Verify that the database methods were called to store content
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockDB.bind).toHaveBeenCalled();
    expect(mockDB.run).toHaveBeenCalled();

    // Verify that the social post queue was called
    expect(mockQueue.send).toHaveBeenCalled();
  });

  it('should handle errors gracefully when AI content generation fails', async () => {
    // Mock the AI adapter to throw an error
    (aiAdapter.generatePSEOContent as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

    // Mock environment
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({ results: [] }),
      first: jest.fn().mockResolvedValue(null),
    };

    const mockQueue = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const mockEnv = {
      DB: mockDB,
      SOCIAL_POST_QUEUE: mockQueue,
    } as any;

    const controller = {} as any;
    const ctx = {} as any;

    // Execute the worker - should not throw
    await expect(
      pSeoGeneratorWorker.default.scheduled(controller, mockEnv, ctx)
    ).resolves.not.toThrow();

    // Verify that the AI adapter was called
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();

    // Verify that the database and queue were not called due to the error
    expect(mockDB.prepare).not.toHaveBeenCalled();
    expect(mockQueue.send).not.toHaveBeenCalled();
  });
});