import { rateLimitMiddleware } from './rateLimit';
import { NextApiRequest, NextApiResponse } from 'next';

describe('rateLimitMiddleware', () => {
  const mockHandler = jest.fn();
  const rateLimitedHandler = rateLimitMiddleware(2, 1000)(mockHandler);

  let mockReq: NextApiRequest;
  let mockRes: NextApiResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      headers: {},
      socket: {}
    } as unknown as NextApiRequest;
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    } as unknown as NextApiResponse;
  });

  it('returns 500 error when IP cannot be determined', async () => {
    await rateLimitedHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error: Could not determine IP address for rate limiting.'
    });
  });

  it('allows requests within the rate limit', async () => {
    mockReq.headers['x-forwarded-for'] = '127.0.0.1';
    
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    
    expect(mockRes.status).not.toHaveBeenCalledWith(429);
    expect(mockHandler).toHaveBeenCalledTimes(2);
  });

  it('blocks requests that exceed the rate limit', async () => {
    mockReq.headers['x-forwarded-for'] = '127.0.0.1';
    
    // Make 3 requests (limit is 2)
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Too Many Requests'
    });
    expect(mockHandler).toHaveBeenCalledTimes(2);
  });

  it('resets the rate limit after the window expires', async () => {
    mockReq.headers['x-forwarded-for'] = '127.0.0.1';
    
    // Mock Date.now to control time
    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    
    // Make 2 requests (at the limit)
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    
    // Advance time beyond the window
    jest.spyOn(global.Date, 'now').mockImplementation(() => now + 2000);
    
    // Make another request (should be allowed)
    await rateLimitedHandler(mockReq, mockRes);
    
    expect(mockRes.status).not.toHaveBeenCalledWith(429);
    expect(mockHandler).toHaveBeenCalledTimes(3);
  });

  it('sets Retry-After header when rate limit is exceeded', async () => {
    mockReq.headers['x-forwarded-for'] = '127.0.0.1';
    
    // Make 3 requests (limit is 2)
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    await rateLimitedHandler(mockReq, mockRes);
    
    expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
  });
});