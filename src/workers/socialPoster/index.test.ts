import worker from './index';
import * as aiAdapter from '../../services/aiAdapter';

// Mock the AI adapter
jest.mock('../../services/aiAdapter', () => ({
  generateSocialPost: jest.fn()
}));

describe('SocialPoster Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle scheduled triggers (though it\'s not expected to receive them)', async () => {
    const env = {} as any;
    const controller = {} as any;
    const ctx = {} as any;

    // This should not throw an error
    await expect(worker.scheduled(controller, env, ctx)).resolves.not.toThrow();
  });

  it('should process queue messages and post to social media', async () => {
    const mockSocialPost = 'Check out this amazing content!';

    (aiAdapter.generateSocialPost as jest.Mock).mockResolvedValue(mockSocialPost);

    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'content123',
          urlPath: '/content/content123',
          title: 'Test Content',
          metaDescription: 'Test description',
          keywords: 'test,keywords',
          generatedHtml: '<p>Test content</p>',
          imageUrl: 'https://example.com/image.jpg',
          generationDate: new Date().toISOString(),
          socialPostQueueId: null
        }),
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123'
          }
        }
      ]
    } as any;

    const ctx = {} as any;

    await worker.queue(batch, env as any, ctx);

    // Verify that the AI adapter was called
    expect(aiAdapter.generateSocialPost).toHaveBeenCalled();

    // Verify that the database methods were called
    expect(env.DB.prepare).toHaveBeenCalled();
  });

  it('should handle errors when processing queue messages fails', async () => {
    (aiAdapter.generateSocialPost as jest.Mock).mockRejectedValue(new Error('Generation failed'));

    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'content123',
          urlPath: '/content/content123',
          title: 'Test Content',
          metaDescription: 'Test description',
          keywords: 'test,keywords',
          generatedHtml: '<p>Test content</p>',
          imageUrl: 'https://example.com/image.jpg',
          generationDate: new Date().toISOString(),
          socialPostQueueId: null
        }),
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123'
          }
        }
      ]
    } as any;

    const ctx = {} as any;

    // This should not throw an error as the worker catches it
    await expect(worker.queue(batch, env as any, ctx)).resolves.not.toThrow();
  });

  it('should handle missing contentId in queue messages', async () => {
    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            // missing contentId
          }
        }
      ]
    } as any;

    const ctx = {} as any;

    // This should not throw an error as the worker handles it
    await expect(worker.queue(batch, env as any, ctx)).resolves.not.toThrow();
  });

  it('should handle missing content in database', async () => {
    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // Return null to simulate missing content
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123'
          }
        }
      ]
    } as any;

    const ctx = {} as any;

    // This should not throw an error as the worker handles it
    await expect(worker.queue(batch, env as any, ctx)).resolves.not.toThrow();
  });
});