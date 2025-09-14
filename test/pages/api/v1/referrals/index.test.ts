import { createMocks } from 'node-mocks-http';
import handler from './index';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/referrals/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return referral stats for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      stats: expect.objectContaining({
        referredCount: expect.any(Number),
        totalEarned: expect.any(Number),
        unpaidBalance: expect.any(Number),
      }),
    });
  });

  it('should return 405 for non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});