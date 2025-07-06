import request from 'supertest';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import firstPlayFreeHandler from '../../src/pages/api/first-play-free';
import { testDbHolder } from '../../src/lib/test-db-holder';
import { creditConfigService, ICreditConfigService, CreditConfig } from '../../src/services/CreditConfigService';
import { NextApiRequest, NextApiResponse } from 'next';
import { JwtPayload, VerifyOptions, JsonWebTokenError } from 'jsonwebtoken'; // Import VerifyOptions and JsonWebTokenError

jest.mock('jsonwebtoken', () => {
  const mockVerifySingleton = jest.fn();
  const originalModule = jest.requireActual('jsonwebtoken'); // Call requireActual inside the factory

  return {
    __esModule: true,
    default: {
      verify: mockVerifySingleton,
      JsonWebTokenError: originalModule.JsonWebTokenError,
      TokenExpiredError: originalModule.TokenExpiredError,
      NotBeforeError: originalModule.NotBeforeError,
    },
    verify: mockVerifySingleton,
    JsonWebTokenError: originalModule.JsonWebTokenError,
    TokenExpiredError: originalModule.TokenExpiredError,
    NotBeforeError: originalModule.NotBeforeError,
  };
});

// Must import jwt AFTER the jest.mock call for it to be the mocked version
import * as jwt from 'jsonwebtoken'; // This will now correctly pick up the mocked structure.

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

    nextReq.query = {};
    nextReq.cookies = {};
    nextReq.body = {};

    let responseBody: any;
    (nextRes.json as jest.Mock).mockImplementation((data: any) => {
      responseBody = data;
      return nextRes;
    });
    (nextRes.send as jest.Mock).mockImplementation((data: any) => {
      responseBody = data;
      return nextRes;
    });

    if (req.method === 'POST') {
      await new Promise<void>((resolve) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try { nextReq.body = JSON.parse(body); } catch (e) { nextReq.body = body; }
          resolve();
        });
      });
    }

    await handler(nextReq, nextRes as NextApiResponse);

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

const mockD1: D1DatabaseMock = {
  prepare: jest.fn(), // Will be configured in beforeEach
  dump: jest.fn(),
  batch: jest.fn(async (statements: D1PreparedStatementMock[]) => {
    const results = await Promise.all(statements.map(s => s.run()));
    return results;
  }),
  transaction: jest.fn(() => ({
    commit: jest.fn(async (callback: () => Promise<any>) => {
      try {
        const result = await callback();
        return { success: true, result };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    }),
    rollback: jest.fn(),
  })),
};

jest.mock('../../src/services/CreditConfigService', () => ({
  creditConfigService: {
    getConfig: jest.fn(),
    createConfig: jest.fn(),
    updateConfig: jest.fn(),
    deleteConfig: jest.fn(),
  } as ICreditConfigService,
}));

describe('/api/first-play-free', () => {
  let server: any;
  let agent: any;
  const ORIGINAL_ENV = { ...process.env };

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'supersecretjwtkeythatisatleast32characterslong';
    // (process.env as any).DB = mockD1; // Old way
    testDbHolder.instance = mockD1;

    // Set up the default implementation for mockD1.prepare once here
    // This will be the fallback if a test doesn't use mockImplementationOnce
    (mockD1.prepare as jest.Mock).mockImplementation((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // Default: user not found
        run: jest.fn().mockResolvedValue({ success: true, changes: 1 }), // Default: successful run
        all: jest.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
        raw: jest.fn().mockResolvedValue([]),
      };
      return mockStatement;
    });

    server = createServer(testApiHandler(firstPlayFreeHandler as any));
    agent = request(server);
  });

  afterAll((done) => {
    process.env = { ...ORIGINAL_ENV };
    testDbHolder.instance = null; // Clean up
    server.close(done);
  });

  beforeEach(() => {
    // jest.resetAllMocks(); // More thorough reset <<--- TRY REMOVING THIS
    jest.clearAllMocks(); // Keep this for general mock clearing.
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'supersecretjwtkeythatisatleast32characterslong';

    // Explicitly reset call history and specific implementations for D1 mocks for each test
    // The default implementation is set in beforeAll and should persist unless overridden by mockImplementationOnce.
    // mockReset() would clear the default implementation, so use mockClear() if default should persist.
    // However, specific tests often want to control the full D1 sequence.
    (mockD1.prepare as jest.Mock).mockClear(); // Clears calls, but keeps default impl from beforeAll
    // If a test needs a DIFFERENT default for D1.prepare, it should use mockImplementationOnce or mockImplementation within the test.
    // For most tests, they will use .mockImplementationOnce for mockD1.prepare anyway.

    (mockD1.dump as jest.Mock).mockClear();
    (mockD1.batch as jest.Mock).mockClear();
    (mockD1.transaction as jest.Mock).mockClear();

    // Re-apply the default implementation in case a test used mockImplementation / mockImplementationOnce
    // This ensures each test starts with the same default D1 prepare behavior if not overridden.
    // This is a bit redundant if tests always use mockImplementationOnce, but safer.
    // (mockD1.prepare as jest.Mock).mockImplementation((query: string) => {
    //   const mockStatement: D1PreparedStatementMock = {
    //     bind: jest.fn().mockReturnThis(),
    //     first: jest.fn().mockResolvedValue(null),
    //     run: jest.fn().mockResolvedValue({ success: true, changes: 1 }),
    //     all: jest.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
    //     raw: jest.fn().mockResolvedValue([]),
    //   };
    //   return mockStatement;
    // });
    // SIMPLIFIED: mockReset followed by setting the default implementation directly on mockD1.prepare
    (mockD1.prepare as jest.Mock).mockReset();
    (mockD1.prepare as jest.Mock).mockImplementation((query: string) => {
      const mockStatement: D1PreparedStatementMock = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
        run: jest.fn().mockResolvedValue({ success: true, changes: 1 }),
        all: jest.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
        raw: jest.fn().mockResolvedValue([]),
      };
      return mockStatement;
    });

    (creditConfigService.getConfig as jest.Mock).mockReset();
    // Need to reset other creditConfigService mocks if they exist and are used
    (creditConfigService.getConfig as jest.Mock).mockClear();
    (creditConfigService.createConfig as jest.Mock)?.mockClear();
    (creditConfigService.updateConfig as jest.Mock)?.mockClear();
    (creditConfigService.deleteConfig as jest.Mock)?.mockClear();

    // Re-apply default for getConfig
    (creditConfigService.getConfig as jest.Mock).mockResolvedValue({
      id: 'first-play-free', name: 'First Play Free', rules: { amount: 0.005 },
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    (jwt.verify as jest.Mock).mockClear(); // Clear call history
    // Re-apply default JWT verify implementation
    (jwt.verify as jest.Mock).mockImplementation((token: string, secret: string, optionsOrCb?: any, cb?: any) => {
      const callback = typeof optionsOrCb === 'function' ? optionsOrCb : cb;
      // MENTALLY UNCOMMENT: console.log(`MOCK JWT.VERIFY (DEFAULT): Received token value: "${token}" (length ${token.length})`);

      if (typeof secret !== 'string' || secret.length < 32) {
        const err = new Error('Mock jwt.verify: Secret invalid');
        if (callback) { callback(err); return; }
        throw err;
      }

      let account: string | undefined;
      // MENTALLY UNCOMMENT: console.log(`MOCK JWT.VERIFY (DEFAULT): About to switch on token: "${token}"`);
      switch (token) {
        case 'new_user_token': // Copied directly from a test's send() call
          // MENTALLY UNCOMMENT: console.log('MOCK JWT.VERIFY (DEFAULT): Matched "new_user_token"');
          account = 'new_user_wallet_address';
          break;
        case 'existing_user_token': // Copied directly
          // MENTALLY UNCOMMENT: console.log('MOCK JWT.VERIFY (DEFAULT): Matched "existing_user_token"');
          account = 'existing_user_wallet_address';
          break;
        case 'unclaimed_user_token': // Copied directly
          // MENTALLY UNCOMMENT: console.log('MOCK JWT.VERIFY (DEFAULT): Matched "unclaimed_user_token"');
          account = 'unclaimed_user_wallet_address';
          break;
        case 'config_test_token': // Copied directly
          // MENTALLY UNCOMMENT: console.log('MOCK JWT.VERIFY (DEFAULT): Matched "config_test_token"');
          account = 'config_test_user';
          break;
        case 'mock_jwt_token': // Copied directly (if used)
          // MENTALLY UNCOMMENT: console.log('MOCK JWT.VERIFY (DEFAULT): Matched "mock_jwt_token"');
          account = 'mock_jwt_account_address';
          break;
        default:
          // MENTALLY UNCOMMENT: console.log(`MOCK JWT.VERIFY (DEFAULT): Token "${token}" did not match any case.`);
          break;
      }

      if (account) {
        // MENTALLY UNCOMMENT: console.log(`MOCK JWT.VERIFY (DEFAULT): Account found ("${account}") for token "${token}". Returning payload.`);
        const payload = { account, exp: Math.floor(Date.now() / 1000) + 3600 };
        if (callback) { callback(null, payload as JwtPayload); return; }
        return payload as JwtPayload;
      }

      // MENTALLY UNCOMMENT: console.log(`MOCK JWT.VERIFY (DEFAULT): No account found for token "${token}". Throwing JsonWebTokenError.`);
      const err = new jwt.JsonWebTokenError('invalid token');
      if (callback) { callback(err); return; }
      throw err;
    });
  });

  it('should grant first play free credit to a new user', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'new_user_wallet_address' });
    mockD1.prepare
      .mockImplementationOnce((query: string) => { // SELECT
        expect(query).toBe('SELECT * FROM user_preferences WHERE walletAddress = ?');
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(null), run: jest.fn(), all: jest.fn(), raw: jest.fn() };
        return statement;
      })
      .mockImplementationOnce((query: string) => { // INSERT
        expect(query).toBe('INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn(), run: jest.fn().mockResolvedValue({ success: true, changes: 1 }), all: jest.fn(), raw: jest.fn() };
        return statement;
      });

    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({
        id: 'first-play-free', name: 'First Play Free', rules: { amount: 0.005 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });

    // Diagnostic logs
    // Diagnostic logs (removed)
    // console.log('Test File - mockD1:', mockD1);
    // console.log('Test File - typeof mockD1.prepare:', typeof mockD1.prepare);
    // console.log('Test File - mockD1.prepare is mock:', jest.isMockFunction(mockD1.prepare));
    // console.log('Test File - process.env.DB === mockD1:', (process.env as any).DB === mockD1);


    const res = await agent.post('/api/first-play-free').send({ userToken: 'token_grant_new' }); // Unique token

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.005);
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectMock = mockD1.prepare.mock.results[0].value;
    expect(selectMock.bind).toHaveBeenCalledWith('new_user_wallet_address');
    expect(mockD1.prepare).toHaveBeenCalledWith('INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
    const insertMock = mockD1.prepare.mock.results[1].value;
    expect(insertMock.bind).toHaveBeenCalledWith('new_user_wallet_address', 1, 0.005);
  });

  it('should prevent a user from claiming first play free credit twice', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'existing_user_wallet_address' });

    const mockFirstFn = jest.fn().mockResolvedValue({
      walletAddress: 'existing_user_wallet_address',
      hasClaimedFirstPlay: 1,
      referralCredits: 0
    });
    const mockBindFn = jest.fn().mockReturnValue({
      first: mockFirstFn,
      run: jest.fn().mockResolvedValue({ success: true, changes: 0 }),
      all: jest.fn().mockResolvedValue({ results: []}),
      raw: jest.fn().mockResolvedValue([])
    });

    (mockD1.prepare as jest.Mock).mockImplementationOnce((query: string) => {
      // This specific implementation for 'prepare' will only be used once.
      // We ensure it's for the SELECT query.
      if (query === 'SELECT * FROM user_preferences WHERE walletAddress = ?') {
        return { bind: mockBindFn };
      }
      // Fallback if called with an unexpected query (should not happen in this test's logic path)
      // Return a default mock statement to avoid breaking the chain if an unexpected call occurs.
      return {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
        run: jest.fn().mockResolvedValue({success: false, changes: 0}),
        all: jest.fn().mockResolvedValue({results:[]}),
        raw: jest.fn().mockResolvedValue([])
      };
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'existing_user_token' });

    expect(res.statusCode).toBe(200);

    // Verify mocks were called as expected
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    expect(mockBindFn).toHaveBeenCalledWith('existing_user_wallet_address');
    expect(mockFirstFn).toHaveBeenCalled(); // Ensure the .first() method providing the specific user data was called

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('First play free already claimed.');

    // Ensure no INSERT or UPDATE was called (prepare would be called more than once if so)
    // This check assumes 'prepare' is only called for the initial SELECT in this path.
    expect((mockD1.prepare as jest.Mock).mock.calls.length).toBe(1);
  });

  it('should update an existing user who has not claimed first play free credit', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'unclaimed_user_wallet_address' }); // Already explicit, good
    mockD1.prepare
      .mockImplementationOnce((query: string) => { // SELECT
        expect(query).toBe('SELECT * FROM user_preferences WHERE walletAddress = ?');
        const statement = {
          bind: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ walletAddress: 'unclaimed_user_wallet_address', hasClaimedFirstPlay: 0, referralCredits: 0 }),
          run: jest.fn(), all: jest.fn(), raw: jest.fn()
        };
        return statement;
      })
      .mockImplementationOnce((query: string) => { // UPDATE
        expect(query).toBe('UPDATE user_preferences SET hasClaimedFirstPlay = ?, referralCredits = referralCredits + ?, lastLogin = CURRENT_TIMESTAMP WHERE walletAddress = ?');
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn(), run: jest.fn().mockResolvedValue({ success: true, changes: 1 }), all: jest.fn(), raw: jest.fn() };
        return statement;
      });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({
        id: 'first-play-free', name: 'First Play Free', rules: { amount: 0.01 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'unclaimed_user_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.01);
    expect(mockD1.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectMock = mockD1.prepare.mock.results[0].value;
    expect(selectMock.bind).toHaveBeenCalledWith('unclaimed_user_wallet_address');
    expect(mockD1.prepare).toHaveBeenCalledWith('UPDATE user_preferences SET hasClaimedFirstPlay = ?, referralCredits = referralCredits + ?, lastLogin = CURRENT_TIMESTAMP WHERE walletAddress = ?');
    const updateMock = mockD1.prepare.mock.results[1].value;
    expect(updateMock.bind).toHaveBeenCalledWith(1, 0.01, 'unclaimed_user_wallet_address');
  });

  it('should return 400 if userToken is missing', async () => {
    const res = await agent.post('/api/first-play-free').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User token is required.');
  });

  // it('should return 401 if JWT is invalid', async () => {
  //   // This test explicitly makes jwt.verify throw a JsonWebTokenError.
  //   const specificVerifyMock = (jwt.verify as jest.Mock);
  //   const originalImplementation = specificVerifyMock.getMockImplementation(); // Get default from beforeEach

  //   specificVerifyMock.mockImplementationOnce((t, s, o, c) => {
  //     // console.log(`Mock jwt.verify (401 test specific) received token: "${t}"`); // DEBUG
  //     const err = new jwt.JsonWebTokenError('specific invalid token for 401 test');
  //     const actualCb = typeof o === 'function' ? o : c;
  //     if (actualCb) { actualCb(err); return; }
  //     throw err;
  //   });

  //   const res = await agent.post('/api/first-play-free').send({ userToken: 'token_guaranteed_to_be_invalid_for_this_test' });

  //   // Restore the original default implementation IF it's not cleared by next beforeEach
  //   // However, beforeEach with resetAllMocks should handle this. This is for extreme caution.
  //   if (originalImplementation) {
  //     specificVerifyMock.mockImplementation(originalImplementation);
  //   } else {
  //     specificVerifyMock.mockReset(); // Fallback if getMockImplementation was null
  //   }

  //   expect(res.statusCode).toBe(401);
  //   expect(res.body.success).toBe(false);
  //   expect(res.body.error).toBe('Invalid or expired token.');
  // });

  it('should return 401 if JWT is invalid', async () => {
    // This test explicitly makes jwt.verify throw a JsonWebTokenError.
    // beforeEach will set a default implementation for jwt.verify.
    // This mockImplementationOnce will override it for just this one call within this test.
    (jwt.verify as jest.Mock).mockImplementationOnce((token: string, secret: string, optionsOrCb?: any, cb?: any) => {
      const callback = typeof optionsOrCb === 'function' ? optionsOrCb : cb;
      const err = new jwt.JsonWebTokenError('specific invalid token for 401 test');
      if (callback) { callback(err); return; }
      throw err;
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'token_guaranteed_to_be_invalid_for_this_test' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid or expired token.');
  });

  it('should return 500 if PARTICLE_NETWORK_JWT_SECRET is not set', async () => {
    const originalSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
    delete process.env.PARTICLE_NETWORK_JWT_SECRET; // Test actual env var check

    const res = await agent.post('/api/first-play-free').send({ userToken: 'any_token_for_secret_test' }); // Token value doesn't matter here
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Server configuration error');

    process.env.PARTICLE_NETWORK_JWT_SECRET = originalSecret;
  });

  it('should return 500 if PARTICLE_NETWORK_JWT_SECRET is too short', async () => {
    const originalSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'short'; // Test actual env var check

    const res = await agent.post('/api/first-play-free').send({ userToken: 'any_token_for_secret_test' }); // Token value doesn't matter here
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Server configuration error');

    process.env.PARTICLE_NETWORK_JWT_SECRET = originalSecret;
  });

  it('should return 500 if CreditConfigService fails', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'new_user_wallet_address' }); // Valid JWT for this part
    mockD1.prepare.mockImplementationOnce((query: string) => { // SELECT
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(null), run: jest.fn(), all: jest.fn(), raw: jest.fn() };
        return statement;
    });
    (creditConfigService.getConfig as jest.Mock).mockRejectedValueOnce(new Error('Config service error'));

    const res = await agent.post('/api/first-play-free').send({ userToken: 'new_user_token' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    // The API handler tries fallback config, so the error might change if fallback is also misconfigured or not found.
    // For this test, we assume the primary config service error is the one we want to catch.
    // Depending on fallback logic, this might need adjustment.
    // The current API handler has fallback logic. If that fallback is also mocked to fail or is missing, then this error holds.
    // If fallback is successful, this test might pass with 200.
    // For now, let's assume the error propagates.
    expect(res.body.error).toMatch(/Config service error|Configuration system failure/);
  });

  it('should return 500 if D1 database operation fails during SELECT', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'new_user_wallet_address' }); // Ensure JWT passes for this DB test
    mockD1.prepare.mockImplementationOnce((query: string) => { // SELECT fails
      const statement = {
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(async () => {
          // console.log("D1 .first() mock is about to throw 'Database select error'"); // DEBUG
          throw new Error('Database select error');
        }),
        run: jest.fn(), all: jest.fn(), raw: jest.fn()
      };
      return statement;
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'new_user_token' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Database select error');
  });

  it('should return 500 if D1 database operation fails during INSERT', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'new_user_wallet_address' });
    mockD1.prepare
      .mockImplementationOnce((query: string) => { // SELECT is fine, user not found
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(null), run: jest.fn(), all: jest.fn(), raw: jest.fn() };
        return statement;
      })
      .mockImplementationOnce((query: string) => { // INSERT fails
        const statement = {
            bind: jest.fn().mockReturnThis(),
            first: jest.fn(),
            run: jest.fn().mockRejectedValue(new Error('Database insert error')),
            all: jest.fn(), raw: jest.fn()
        };
        return statement;
      });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({
        id: 'first-play-free', name: 'First Play Free', rules: { amount: 0.005 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });


    const res = await agent.post('/api/first-play-free').send({ userToken: 'new_user_token' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Database insert error');
  });


  it('should use the configured amount from CreditConfigService', async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({ account: 'config_test_user' }); // Explicitly set
    mockD1.prepare
      .mockImplementationOnce((query: string) => { // SELECT
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(null), run: jest.fn(), all: jest.fn(), raw: jest.fn() };
        return statement;
      })
      .mockImplementationOnce((query: string) => { // INSERT
        const statement = { bind: jest.fn().mockReturnThis(), first: jest.fn(), run: jest.fn().mockResolvedValue({ success: true, changes: 1 }), all: jest.fn(), raw: jest.fn() };
        return statement;
      });
    (creditConfigService.getConfig as jest.Mock).mockResolvedValueOnce({
        id: 'first-play-free', name: 'First Play Free', rules: { amount: 0.123 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });

    const res = await agent.post('/api/first-play-free').send({ userToken: 'token_update_unclaimed' }); // Unique token

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.creditAmount).toBe(0.123);
    expect(mockD1.prepare.mock.calls[0][0]).toBe('SELECT * FROM user_preferences WHERE walletAddress = ?');
    const selectMock = mockD1.prepare.mock.results[0].value;
    expect(selectMock.bind).toHaveBeenCalledWith('config_test_user');

    expect(mockD1.prepare.mock.calls[1][0]).toBe('INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
    const insertMock = mockD1.prepare.mock.results[1].value;
    expect(insertMock.bind).toHaveBeenCalledWith('config_test_user', 1, 0.123);
  });
});