// Integration test for social posting workflow
// This test verifies the interaction between socialPoster worker, AI adapter, and database

import * as socialPosterWorker from '../workers/socialPoster/index';
import * as aiAdapter from '../services/aiAdapter';

// Mock the AI adapter
jest.mock('../services/aiAdapter', () => ({
  generateSocialPost: jest.fn(),
}));

describe('Social Posting Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process queue message, generate social post, and post to social media', async () => {
    // Mock the AI adapter response
    const mockSocialPost = 'Check out this amazing content! #gaming #crypto';

    (aiAdapter.generateSocialPost as jest.Mock).mockResolvedValue(mockSocialPost);

    // Mock environment with database
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      first: jest.fn().mockResolvedValue({
        id: 'content123',
        title: 'Test Content',
        metaDescription: 'Test description',
        imageUrl: 'https://example.com/image.jpg',
      }),
    };

    const mockEnv = {
      DB: mockDB,
    } as any;

    // Mock message batch
    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123',
          },
        },
      ],
    } as any;

    const ctx = {} as any;

    // Execute the worker
    await socialPosterWorker.default.queue(batch, mockEnv, ctx);

    // Verify that the database was queried for content
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM content_metadata WHERE id = ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith('content123');
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that the AI adapter was called to generate social post
    expect(aiAdapter.generateSocialPost).toHaveBeenCalled();

    // Verify that the database was updated with queue ID
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'UPDATE content_metadata SET socialPostQueueId = ? WHERE id = ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith('message123', 'content123');
    expect(mockDB.run).toHaveBeenCalled();
  });

  it('should handle missing content gracefully', async () => {
    // Mock the database to return null (missing content)
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      first: jest.fn().mockResolvedValue(null), // No content found
    };

    const mockEnv = {
      DB: mockDB,
    } as any;

    // Mock message batch
    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'missing-content',
          },
        },
      ],
    } as any;

    const ctx = {} as any;

    // Execute the worker - should not throw
    await expect(
      socialPosterWorker.default.queue(batch, mockEnv, ctx)
    ).resolves.not.toThrow();

    // Verify that the database was queried
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM content_metadata WHERE id = ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith('missing-content');
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that the AI adapter was not called since content was missing
    expect(aiAdapter.generateSocialPost).not.toHaveBeenCalled();
  });

  it('should handle AI generation failure gracefully', async () => {
    // Mock the AI adapter to throw an error
    (aiAdapter.generateSocialPost as jest.Mock).mockRejectedValue(
      new Error('AI service unavailable')
    );

    // Mock environment with database
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      first: jest.fn().mockResolvedValue({
        id: 'content123',
        title: 'Test Content',
        metaDescription: 'Test description',
        imageUrl: 'https://example.com/image.jpg',
      }),
    };

    const mockEnv = {
      DB: mockDB,
    } as any;

    // Mock message batch
    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123',
          },
        },
      ],
    } as any;

    const ctx = {} as any;

    // Execute the worker - should not throw
    await expect(
      socialPosterWorker.default.queue(batch, mockEnv, ctx)
    ).resolves.not.toThrow();

    // Verify that the database was queried
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM content_metadata WHERE id = ?'
    );
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that the AI adapter was called
    expect(aiAdapter.generateSocialPost).toHaveBeenCalled();

    // Verify that the database was not updated since AI generation failed
    expect(mockDB.prepare).not.toHaveBeenCalledWith(
      'UPDATE content_metadata SET socialPostQueueId = ? WHERE id = ?'
    );
  });
});