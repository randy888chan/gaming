import request from 'supertest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import creditConfigHandler from '../../src/pages/api/v1/admin/credit-config';
import jwt from 'jsonwebtoken';
import type { D1Database } from '@cloudflare/workers-types';

// Mock D1Database implementation
jest.mock('@cloudflare/workers-types', () => ({
  D1Database: jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockImplementation((query: string) => ({
      bind: jest.fn().mockImplementation((...args: any[]) => ({
        first: jest.fn().mockResolvedValue({
          id: 'test-config-1',
          name: 'Test Config',
          rules: JSON.stringify({ minBet: 0.01 }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
        run: jest.fn().mockResolvedValue({ meta: { rows_written: 1 } })
      }))
    }))
  }))
}));

// Mock jwt verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token: string) => ({
    account: token === 'valid_token' ? 'admin_user' : null
  }))
}));

const mockJwtSecret = 'mock-jwt-secret';
process.env.PARTICLE_NETWORK_JWT_SECRET = mockJwtSecret;

// Helper to create a test server for Next.js API routes
const testServer = (handler: any) => {
  return request(createServer((req, res) => apiResolver(req, res, undefined, handler, {}, true)));
};

describe('Credit Configuration API Integration Tests', () => {
  let server: request.SuperTest<request.Test>;
  let mockAdminToken: string;
  let mockNonAdminToken: string;

  beforeAll(() => {
    server = testServer(creditConfigHandler);
    // Generate mock JWT tokens
    mockAdminToken = jwt.sign({ userId: 'adminUser', role: 'admin' }, mockJwtSecret, { expiresIn: '1h' });
    mockNonAdminToken = jwt.sign({ userId: 'regularUser', role: 'user' }, mockJwtSecret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === mockAdminToken && secret === mockJwtSecret) {
        return { userId: 'adminUser', role: 'admin' };
      }
      if (token === mockNonAdminToken && secret === mockJwtSecret) {
        return { userId: 'regularUser', role: 'user' };
      }
      throw new Error('Invalid token');
    });
  });

  // QA-API-003 & QA-SEC-001: Test CRUD operations with authentication
  describe('Authenticated CRUD Operations', () => {
    const mockConfig = {
      id: 'test-config-1',
      name: 'Default Credit Config',
      rules: { minBet: 0.01, maxBet: 100 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test('should allow an authenticated admin to GET credit configuration', async () => {
      (creditConfigService.getConfig as jest.Mock).mockResolvedValue(mockConfig);

      const res = await server.get('/api/v1/admin/credit-config?id=test-config-1')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual(mockConfig);
      expect(creditConfigService.getConfig).toHaveBeenCalledWith('test-config-1');
    });

    test('should allow an authenticated admin to POST (create) credit configuration', async () => {
      const newConfigData = { name: 'New Config', rules: { bonus: 0.1 } };
      const createdConfig = { ...mockConfig, id: 'new-config-id', ...newConfigData };
      (creditConfigService.createConfig as jest.Mock).mockResolvedValue(createdConfig);

      const res = await server.post('/api/v1/admin/credit-config')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send(newConfigData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual(createdConfig);
      expect(creditConfigService.createConfig).toHaveBeenCalledWith(newConfigData);
    });

    test('should allow an authenticated admin to POST (update) credit configuration', async () => {
      const updatedConfigData = { id: 'test-config-1', name: 'Updated Config', rules: { bonus: 0.15 } };
      const updatedConfig = { ...mockConfig, ...updatedConfigData };
      (creditConfigService.updateConfig as jest.Mock).mockResolvedValue(updatedConfig);

      const res = await server.post('/api/v1/admin/credit-config')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send(updatedConfigData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual(updatedConfig);
      expect(creditConfigService.updateConfig).toHaveBeenCalledWith('test-config-1', { name: 'Updated Config', rules: { bonus: 0.15 } });
    });

    test('should allow an authenticated admin to DELETE credit configuration', async () => {
      (creditConfigService.deleteConfig as jest.Mock).mockResolvedValue(true);

      const res = await server.delete('/api/v1/admin/credit-config?id=test-config-1')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Configuration deleted successfully.');
      expect(creditConfigService.deleteConfig).toHaveBeenCalledWith('test-config-1');
    });
  });

  // QA-SEC-001: Test unauthorized and forbidden access
  describe('Authentication and Authorization', () => {
    test('should return 401 if no token is provided', async () => {
      const res = await server.get('/api/v1/admin/credit-config?id=test-config-1');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Unauthorized: No token provided.');
    });

    test('should return 401 if an invalid token is provided', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      const res = await server.get('/api/v1/admin/credit-config?id=test-config-1')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Unauthorized: Invalid or expired token.');
    });

    // The current implementation in credit-config.ts considers any valid Particle Network token as authenticated for admin access.
    // If a more granular role-based authorization is implemented, this test would need to be adjusted.
    // For now, a non-admin token will still pass the authentication check as per the current API logic.
    test('should allow access with a valid non-admin token (current implementation)', async () => {
      (creditConfigService.getConfig as jest.Mock).mockResolvedValue({ id: 'some-id', name: 'config', rules: {} });

      const res = await server.get('/api/v1/admin/credit-config?id=some-id')
        .set('Authorization', `Bearer ${mockNonAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  // QA-SEC-002: Test rate limiting behavior
  describe('Rate Limiting', () => {
    test('should return 429 Too Many Requests after 30 requests within a minute', async () => {
      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await server.get('/api/v1/admin/credit-config?id=any-id')
          .set('Authorization', `Bearer ${mockAdminToken}`);
      }

      // The 31st request should be rate-limited
      const res = await server.get('/api/v1/admin/credit-config?id=any-id')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(429);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Too many requests, please try again later.');
    }, 65000); // Increase timeout for rate limit test

    test('should reset rate limit after windowMs', async () => {
      // Make 30 requests to hit the limit
      for (let i = 0; i < 30; i++) {
        await server.get('/api/v1/admin/credit-config?id=any-id')
          .set('Authorization', `Bearer ${mockAdminToken}`);
      }

      // Wait for more than 1 minute (60 seconds)
      await new Promise(resolve => setTimeout(resolve, 61 * 1000));

      // The first request after the reset should succeed
      (creditConfigService.getConfig as jest.Mock).mockResolvedValue({ id: 'any-id', name: 'config', rules: {} });
      const res = await server.get('/api/v1/admin/credit-config?id=any-id')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    }, 130000); // Increase timeout for rate limit reset test
  });
});