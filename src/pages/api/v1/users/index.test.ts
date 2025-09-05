import { createMocks } from 'node-mocks-http';
import handler from './index';
import * as authMiddleware from '@/utils/authMiddleware';
import * as particleAuth from '@/utils/particleAuth';
import * as rateLimitMiddleware from '@/utils/rateLimitMiddleware';
import * as creditConfigService from '@/services/CreditConfigService';

// Mock the middlewares and services
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

jest.mock('@/utils/rateLimitMiddleware', () => ({
  withRateLimit: jest.fn((handler) => handler)
}));

jest.mock('@/utils/particleAuth', () => ({
  verifyParticleToken: jest.fn()
}));

jest.mock('@/services/CreditConfigService', () => ({
  creditConfigService: {
    getConfig: jest.fn()
  }
}));

describe('/api/v1/users/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 for GET request without authorization header', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {}
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Unauthorized: No token provided'
    });
  });

  it('should return 401 for GET request with invalid token', async () => {
    (particleAuth.verifyParticleToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Unauthorized: Invalid token'
    });
  });

  it('should return 405 for non-GET/POST methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT'
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Method Not Allowed'
    });
  });
});