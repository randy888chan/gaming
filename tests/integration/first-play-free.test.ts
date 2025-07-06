import request from 'supertest';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import firstPlayFreeHandler from '../../src/pages/api/first-play-free';
import { creditConfigService, ICreditConfigService, CreditConfig } from '../../src/services/CreditConfigService';
import * as jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { JwtPayload, VerifyOptions } from 'jsonwebtoken'; // Import JwtPayload and VerifyOptions directly

// Define a type for the D1 database mock
interface D1DatabaseMock {
  prepare: jest.Mock;
  dump: jest.Mock;
  batch: jest.Mock;
  transaction: jest.Mock;
}

// Define a type for the D1PreparedStatement mock
interface D1PreparedStatementMock {
  bind: jest.Mock;
  first: jest.Mock;
  run: jest.Mock;
  all: jest.Mock;
  raw: jest.Mock;
}

// Extend NextApiResponse to include mock properties
interface MockNextApiResponse extends Partial<NextApiResponse> {
  status: jest.Mock<any, any>;
  json: jest.Mock<any, any>;
  send: jest.Mock<any, any>;
  setHeader: jest.Mock<any, any>;
  end: jest.Mock<any, any>;
  statusCode: number;
  req: IncomingMessage;
}

// Helper to mock Next.js API routes for supertest
const testApiHandler = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const nextReq = req as NextApiRequest;
    const nextRes: MockNextApiResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      end: jest.fn(),
      statusCode: 200,
      req: req,
    };

    // Mock necessary Next.js specific properties
    nextReq.query = {};
    nextReq.cookies = {};
    nextReq.body = {};

    // Capture the response body
    let responseBody: any;
    (nextRes.json as jest.Mock).mockImplementation((data: any) => {
      responseBody = data;
      return nextRes;
    });
    (nextRes.send as jest.Mock).mockImplementation((data: any) => {
      responseBody = data;
      return nextRes;
    });

    // Parse body for POST requests
    if (req.method === 'POST') {
      await new Promise<void>((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            nextReq.body = JSON.parse(body);
          } catch (e) {
            nextReq.body = body;
          }
          resolve();
        });
      });
    }

    await handler(nextReq, nextRes as NextApiResponse); // Cast to NextApiResponse for the handler

    // Manually send the captured response back through the original ServerResponse
    if ((nextRes.json as jest.Mock).mock.calls.length > 0) {
      res.statusCode = (nextRes.status as jest.Mock).mock.calls[0]?.[0] || 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(responseBody));
    } else if ((nextRes.send as jest.Mock).mock.calls.length > 0) {
      res.statusCode = (nextRes.status as jest.Mock).mock.calls[0]?.[0] || 200;
      res.end(responseBody);
    } else {
      res.statusCode = (nextRes.status as jest.Mock).mock.calls[0]?.[0] || 200;
      res.end();
    }
  };
};

// Mock the D1 Database for testing
const mockD1: D1DatabaseMock = {
  prepare: jest.fn((query: string): D1PreparedStatementMock => {
    const statement: Partial<D1PreparedStatementMock> = {
      bind: jest.fn().mockReturnThis(),
      first: jest.fn(async (colName?: string) => {
        // Default behavior for first()
        if (query.includes('SELECT * FROM user_preferences WHERE walletAddress = ?')) {
          const lastBindCall = (statement.bind as jest.Mock).mock.calls[(statement.bind as jest.Mock).mock.calls.length - 1];
          const walletAddress = lastBindCall ? lastBindCall[0] : undefined;

          if (walletAddress === 'new_user_wallet_address') {
            return null; // Simulate new user
          }
          if (walletAddress === 'existing_user_wallet_address') {
            return { walletAddress: 'existing_user_wallet_address', hasClaimedFirstPlay: 1, referralCredits: 0 }; // Simulate already claimed
          }
          if (walletAddress === 'unclaimed_user_wallet_address') {
            return { walletAddress: 'unclaimed_user_wallet_address', hasClaimedFirstPlay: 0, referralCredits: 0 }; // Simulate unclaimed existing user
          }
          if (walletAddress === 'config_test_user') {
            return null; // Simulate new user for config test
          }
        }
        return null;
      }),
      run: jest.fn(async () => ({ success: true, changes: 1, meta: {} })),
      all: jest.fn(async () => ({ results: [], success: true, meta: {} })),
      raw: jest.fn(async () => []),
    };
    return statement as D1PreparedStatementMock;
  }),
  dump: jest.fn(),
  batch: jest.fn(async (statements: D1PreparedStatementMock[]) => {
    const results = await Promise.all(statements.map(s => s.run()));
    return results;
  }),
  transaction: jest.fn(() => ({
    // Mock the transaction object with a commit method
    commit: jest.fn(async (callback: () => Promise<any>) => {
      try {
        const result = await callback();
        return { success: true, result };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    }),
    rollback: jest.fn(), // Add rollback for completeness
  })),
};

// Mock the CreditConfigService with its interface
jest.mock('../../src/services/CreditConfigService', () => ({
  creditConfigService: {
    getConfig: jest.fn<Promise<CreditConfig | null>, [string]>().mockImplementation(async (id: string) => {
      // Simulate fetching a CreditConfig object that matches the interface
      return {
        id: id,
        name: 'Mock Config',
        rules: { amount: 0.005 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }),
    createConfig: jest.fn<Promise<CreditConfig>, [Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>]>().mockImplementation(async (data) => ({
      id: 'mock-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    })),
    updateConfig: jest.fn<Promise<CreditConfig | null>, [string, Partial<Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>>]>().mockImplementation(async (id, updates) => ({
      id: id,
      name: updates.name || 'Mock Config',
      rules: updates.rules || { amount: 0.005 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    deleteConfig: jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true),
  } as ICreditConfigService,
}));

// Mock jwt.verify
// Mock jwt.verify with validation
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string, secret: string, options?: any) => { // Use any for options
    if (typeof secret !== 'string' || secret.length < 32) {
      throw new Error('JWT Secret must be a string of at least 32 characters.');
    }
    if (token === 'valid_test_token') {
      return {
        sub: 'test_user',
        w: 'test_wallet_address',
        exp: Date.now() / 1000 + 3600, // 1 hour from now
      } as any; // Use any for return type
    }
    if (token === 'new_user_token') {
      return {
        sub: 'new_user',
        w: 'new_user_wallet_address',
        exp: Date.now() / 1000 + 3600,
      } as any; // Use any for return type
    }
    if (token === 'existing_user_token') {
      return {
        sub: 'existing_user',
        w: 'existing_user_wallet_address',
        exp: Date.now() / 1000 + 3600,
      } as any; // Use any for return type
    }
    if (token === 'unclaimed_user_token') {
      return {
        sub: 'unclaimed_user',
        w: 'unclaimed_user_wallet_address',
        exp: Date.now() / 1000 + 3600,
      } as any; // Use any for return type
    }
    if (token === 'config_test_token') {
      return {
        sub: 'config_test_user',
        w: 'config_test_user',
        exp: Date.now() / 1000 + 3600,
      } as any; // Use any for return type
    }
    throw new Error('Invalid or expired token.');
  }),
}));

describe('/api/first-play-free', () => {
  let server: any;
  let agent: any;

  beforeAll(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
    });
    (process.env as any).DB = mockD1; // Inject mock D1

    server = createServer(testApiHandler(firstPlayFreeHandler as any));
    agent = request(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up mock environment variables for each test
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'supersecretjwtkeythatisatleast32characterslong';

    // Reset mock D1 and CreditConfigService before each test
    mockD1.prepare.mockClear();
    mockD1.prepare.mockReset();
    // Simplified default mock for D1.prepare
    mockD1.prepare.mockImplementation((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });

    (creditConfigService.getConfig as jest.Mock).mockReset();
    (creditConfigService.getConfig as jest.Mock).mockResolvedValue({ rules: { amount: 0.005 } }); // Default mock for config service
    (jwt.verify as jest.Mock).mockReset();
    // Set a default mock for jwt.verify to avoid "invalid token" errors in tests that don't explicitly mock it
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: 'default_user',
      w: 'default_wallet_address',
      exp: Date.now() / 1000 + 3600,
    });
  });

  it('should grant first play free credit to a new user', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'new_user_wallet_address' });
    // Specific mocks for this test
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null), // User not found
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(async () => ({ success: true, changes: 1 })), // Insert success
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({ rules: { amount: 0.005 } });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.005);
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectBindMock = mockD1.prepare.mock.results[0].value.bind;
    expect(selectBindMock).toHaveBeenCalledWith('new_user_wallet_address');
    expect(mockD1.prepare).toHaveBeenCalledWith('INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
    const insertBindMock = mockD1.prepare.mock.results[1].value.bind;
    expect(insertBindMock).toHaveBeenCalledWith('new_user_wallet_address', 1, 0.005);
  });

  it('should prevent a user from claiming first play free credit twice', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'existing_user_wallet_address' });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => ({ walletAddress: 'existing_user_wallet_address', hasClaimedFirstPlay: 1, referralCredits: 0 })), // User already claimed
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('First play free already claimed.');
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectBindMock = mockD1.prepare.mock.results[0].value.bind;
    expect(selectBindMock).toHaveBeenCalledWith('existing_user_wallet_address');
    expect(selectBindMock().run).not.toHaveBeenCalled(); // No database write should occur
  });

  it('should update an existing user who has not claimed first play free credit', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'unclaimed_user_wallet_address' });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => ({ walletAddress: 'unclaimed_user_wallet_address', hasClaimedFirstPlay: 0, referralCredits: 0 })), // User exists, not claimed
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(async () => ({ success: true, changes: 1 })), // Update success
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({ rules: { amount: 0.01 } });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.01);
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectBindMock = mockD1.prepare.mock.results[0].value.bind;
    expect(selectBindMock).toHaveBeenCalledWith('unclaimed_user_wallet_address');
    expect(mockD1.prepare).toHaveBeenCalledWith('UPDATE user_preferences SET hasClaimedFirstPlay = ?, referralCredits = referralCredits + ?, lastLogin = CURRENT_TIMESTAMP WHERE walletAddress = ?');
    const updateBindMock = mockD1.prepare.mock.results[1].value.bind;
    expect(updateBindMock).toHaveBeenCalledWith(1, 0.01, 'unclaimed_user_wallet_address');
  });

  it('should return 400 if userToken is missing', async () => {
    const res = await agent.post('/api/first-play-free').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User token is required.');
  });

  it('should return 401 if JWT is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'invalid_jwt' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid or expired token.');
  });

  it('should return 500 if PARTICLE_NETWORK_JWT_SECRET is not set', async () => {
    const originalSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
    (process.env as any).PARTICLE_NETWORK_JWT_SECRET = undefined;

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Server configuration error');

    process.env.PARTICLE_NETWORK_JWT_SECRET = originalSecret; // Restore
  });

  it('should return 500 if PARTICLE_NETWORK_JWT_SECRET is too short', async () => {
    const originalSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'short'; // Less than 32 chars

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Server configuration error');

    process.env.PARTICLE_NETWORK_JWT_SECRET = originalSecret; // Restore
  });

  it('should return 500 if CreditConfigService fails', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'new_user_wallet_address' });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null), // User not found
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    (creditConfigService.getConfig as jest.Mock).mockRejectedValueOnce(new Error('Config service error'));

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Config service error');
  });

  it('should return 500 if D1 database operation fails', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'new_user_wallet_address' });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null), // User not found
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({ rules: { amount: 0.005 } });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(async () => { throw new Error('Database write error'); }), // Simulate database write error
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Database write error');
  });

  it('should use the configured amount from CreditConfigService', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ account: 'config_test_user' });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null), // User not found
        run: jest.fn(),
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    mockD1.prepare.mockImplementationOnce((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(async () => ({ success: true, changes: 1 })), // Insert success
        all: jest.fn(),
        raw: jest.fn(),
      };
      return mockStatement;
    });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({ rules: { amount: 0.123 } });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'mock_jwt_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.123);
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectBindMock = mockD1.prepare.mock.results[0].value.bind;
    expect(selectBindMock).toHaveBeenCalledWith('config_test_user');
    expect(mockD1.prepare).toHaveBeenCalledWith('INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
    const insertBindMock = mockD1.prepare.mock.results[1].value.bind;
    expect(insertBindMock).toHaveBeenCalledWith('config_test_user', 1, 0.123);
  });
});