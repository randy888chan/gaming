import { createMocks } from 'node-mocks-http';
import handler from './track-share';

describe('/api/track-share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process track share request for POST request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        eventType: 'click',
        userId: 'user123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Tracked click for content123'
    });
  });

  it('should process track share request without userId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        eventType: 'impression'
        // no userId
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Tracked impression for content123'
    });
  });

  it('should return 400 for POST request with missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // missing contentId and eventType
        userId: 'user123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required fields.'
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