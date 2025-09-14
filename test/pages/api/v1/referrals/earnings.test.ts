import { createMocks } from 'node-mocks-http';
import handler from './earnings';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/referrals/earnings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return earnings data for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      earnings: expect.objectContaining({
        totalEarned: expect.any(Number),
        unpaidBalance: expect.any(Number),
        lastUpdated: expect.any(String),
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