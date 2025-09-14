import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './health';
import { D1Database } from '@cloudflare/workers-types';

describe('/api/health', () => {
  let OLD_ENV: NodeJS.ProcessEnv;

  beforeEach(() => {
    OLD_ENV = process.env;
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('returns a 200 status code and a healthy status when the database is connected', async () => {
    const mockDb = {
      prepare: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ 1: 1 }),
    } as unknown as D1Database;
    process.env.DB = mockDb;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      status: 'healthy',
      database: 'connected',
    });
  });

  test('returns a 500 status code and an unhealthy status when the database is not connected', async () => {
    const mockDb = {
      prepare: jest.fn().mockReturnThis(),
      first: jest.fn().mockRejectedValue(new Error('Database connection failed')),
    } as unknown as D1Database;
    process.env.DB = mockDb;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  });

  test('returns a 405 status code for non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toEqual({
        "allow": ["GET"],
    });
  });
});
