import { createMocks } from 'node-mocks-http';
import handler from './social-post';
import * as rateLimitMiddleware from '../../utils/rateLimitMiddleware';

// Mock the rate limit middleware
jest.mock('../../utils/rateLimitMiddleware', () => ({
  withRateLimit: jest.fn((handler) => handler)
}));

describe('/api/social-post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process social post request for POST request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        platforms: ['twitter', 'facebook'],
        scheduleAt: new Date().toISOString()
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      postedTo: expect.arrayContaining(['twitter', 'facebook'])
    });
  });

  it('should return 400 for POST request with missing contentId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // missing contentId
        platforms: ['twitter'],
        scheduleAt: new Date().toISOString()
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing or invalid contentId.'
    });
  });

  it('should return 400 for POST request with invalid platforms', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        platforms: ['invalid-platform'],
        scheduleAt: new Date().toISOString()
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing or invalid platforms.'
    });
  });

  it('should return 400 for POST request with invalid scheduleAt', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        platforms: ['twitter'],
        scheduleAt: 'invalid-date'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing or invalid scheduleAt.'
    });
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});