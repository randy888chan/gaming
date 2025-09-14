import { createMocks } from 'node-mocks-http';
import handler from './referred-users';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/referrals/referred-users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return referred users for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      referredUsers: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          joinDate: expect.any(String),
        }),
      ]),
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