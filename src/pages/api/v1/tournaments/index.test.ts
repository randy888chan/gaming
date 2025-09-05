import { createMocks } from 'node-mocks-http';
import handler from './index';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/tournaments/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of tournaments for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      tournaments: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          format: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
        }),
      ]),
    });
  });

  it('should create a new tournament for POST request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'New Tournament',
        format: 'single-elimination',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      tournament: expect.objectContaining({
        id: expect.any(String),
        name: 'New Tournament',
        format: 'single-elimination',
        status: 'upcoming',
        createdAt: expect.any(String),
      }),
    });
  });

  it('should return 400 for POST request with missing data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'New Tournament',
        // missing format
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required fields: name, format',
    });
  });

  it('should return 405 for non-GET/POST methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});