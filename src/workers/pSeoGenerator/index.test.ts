// Import the actual worker code to mock specific functions
import * as aiAdapter from '../../services/aiAdapter';
import worker from './index';
import * as aiAdapter from '../../services/aiAdapter';

// Mock the AI adapter
jest.mock('../../services/aiAdapter', () => ({
  generatePSEOContent: jest.fn()
}));

describe('pSeoGenerator Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate pSEO content and store it in the database when scheduled', async () => {
    const mockContent = {
      title: 'Test Title',
      description: 'Test Description',
      keywords: ['test', 'keywords'],
      htmlBody: '<p>Test content</p>'
    };

    (aiAdapter.generatePSEOContent as jest.Mock).mockResolvedValue(mockContent);

    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        run: jest.fn().mockResolvedValue(undefined)
      },
      SOCIAL_POST_QUEUE: {
        send: jest.fn().mockResolvedValue(undefined)
      }
    };

    const controller = {} as any;
    const ctx = {} as any;

    await worker.scheduled(controller, env as any, ctx);

    // Verify that the AI adapter was called
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();

    // Verify that the database methods were called
    expect(env.DB.prepare).toHaveBeenCalled();
    expect(env.SOCIAL_POST_QUEUE.send).toHaveBeenCalled();
  });

  it('should handle errors when generating pSEO content fails', async () => {
    (aiAdapter.generatePSEOContent as jest.Mock).mockRejectedValue(new Error('Generation failed'));

    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        run: jest.fn().mockResolvedValue(undefined)
      },
      SOCIAL_POST_QUEUE: {
        send: jest.fn().mockResolvedValue(undefined)
      }
    };

    const controller = {} as any;
    const ctx = {} as any;

    // This should not throw an error as the worker catches it
    await expect(worker.scheduled(controller, env as any, ctx)).resolves.not.toThrow();

    // Verify that the error was logged (we can't easily test console.error)
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();
  });

  it('should handle queue messages (though it\'s not expected to receive them)', async () => {
    const env = {} as any;
    const batch = {
      messages: []
    } as any;
    const ctx = {} as any;

    // This should not throw an error
    await expect(worker.queue(batch, env, ctx)).resolves.not.toThrow();
  });
});