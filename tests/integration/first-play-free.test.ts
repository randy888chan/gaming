import request from 'supertest';
import { SuperTest, Test } from 'supertest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import firstPlayFreeHandler from '../../src/pages/api/first-play-free';
import jwt from 'jsonwebtoken';

// Mock jwt.verify to control token validation
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const mockJwtSecret = 'mock-jwt-secret';
process.env.PARTICLE_NETWORK_JWT_SECRET = mockJwtSecret;

// Mock the D1 Database
const mockD1 = {
  prepare: (query: string) => ({
    bind: (...args: any[]) => ({
      first: async (colName?: string) => {
        if (query.includes('SELECT * FROM user_preferences WHERE walletAddress = ?')) {
          const [walletAddress] = args;
          if (walletAddress === 'mock_existing_user_id_claimed') {
            return { walletAddress: 'mock_existing_user_id_claimed', hasClaimedFirstPlay: 1 };
          }
          if (walletAddress === 'mock_existing_user_id_unclaimed') {
            return { walletAddress: 'mock_existing_user_id_unclaimed', hasClaimedFirstPlay: 0 };
          }
          if (walletAddress === 'mock_new_user_id') {
            return null; // Simulate new user
          }
        }
        return null;
      },
      run: async () => ({ success: true, changes: 1 }),
    }),
  }),
};

// Helper to create a test server for Next.js API routes
const testServer = (handler: any): SuperTest<Test> => {
  return request(createServer((req, res) => apiResolver(req, res, undefined, handler, {
    previewModeId: 'test-id',
    previewModeEncryptionKey: 'test-key',
    previewModeSigningKey: 'test-signing-key',
  }, true)));
};

describe('First Play Free API Integration Tests', () => {
  let server: SuperTest<Test>;
  let mockUserToken: string;
  let mockClaimedUserToken: string;
  let mockUnclaimedUserToken: string;

  beforeAll(() => {
    server = testServer(firstPlayFreeHandler);
    // Generate mock JWT tokens for different user states
    mockUserToken = jwt.sign({ account: 'mock_new_user_id' }, mockJwtSecret, { expiresIn: '1h' });
    mockClaimedUserToken = jwt.sign({ account: 'mock_existing_user_id_claimed' }, mockJwtSecret, { expiresIn: '1h' });
    mockUnclaimedUserToken = jwt.sign({ account: 'mock_existing_user_id_unclaimed' }, mockJwtSecret, { expiresIn: '1h' });

    // Temporarily set the mocked D1 database for the API handler
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });
    Object.defineProperty(process.env, 'DB', {
      value: mockD1,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (secret !== mockJwtSecret) {
        throw new Error('Invalid secret');
      }
      if (token === mockUserToken) {
        return { account: 'mock_new_user_id' };
      }
      if (token === mockClaimedUserToken) {
        return { account: 'mock_existing_user_id_claimed' };
      }
      if (token === mockUnclaimedUserToken) {
        return { account: 'mock_existing_user_id_unclaimed' };
      }
      throw new Error('Invalid token');
    });
  });

  // QA-API-001: Verify `first-play-free` API endpoint functionality.
  describe('First Play Free Claiming', () => {
    test('should allow a new user to claim first play free', async () => {
      const res = await server.post('/api/first-play-free')
        .send({ userToken: mockUserToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.creditAmount).toBe(0.001);
    });

    test('should prevent an already claimed user from claiming again', async () => {
      const res = await server.post('/api/first-play-free')
        .send({ userToken: mockClaimedUserToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('First play free already claimed.');
    });

    test('should update an existing user record if they have not claimed yet', async () => {
      const res = await server.post('/api/first-play-free')
        .send({ userToken: mockUnclaimedUserToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.creditAmount).toBe(0.001);
    });

    test('should return 400 if user token is missing', async () => {
      const res = await server.post('/api/first-play-free')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User token is required.');
    });

    test('should return 401 if user token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      const res = await server.post('/api/first-play-free')
        .send({ userToken: 'invalid-token' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid or expired token.');
    });
  });
});