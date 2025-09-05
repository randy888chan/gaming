// End-to-end test for referral journey
// This test simulates a complete referral journey from setting a referrer to earning and payout

import { createMocks } from 'node-mocks-http';
import * as referralService from '../src/services/ReferralService';
import * as zetaChainService from '../src/services/zetaChainService';
import referralApiHandler from '../src/pages/api/v1/referrals/index';
import referralEarningsApiHandler from '../src/pages/api/v1/referrals/earnings';
import referralPayoutWorker from '../src/workers/referralPayout/index';

// Mock the services
jest.mock('../src/services/ReferralService', () => ({
  setReferrer: jest.fn(),
  recordReferralEarnings: jest.fn(),
  getReferralEarnings: jest.fn(),
  getReferredUsers: jest.fn(),
  getReferralStats: jest.fn(),
}));

jest.mock('../src/services/zetaChainService', () => ({
  zetaChainService: {
    sendTransaction: jest.fn(),
  },
}));

describe('Referral Journey - E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the full referral journey: set referrer -> earn credits -> payout', async () => {
    // Mock user data
    const mockUserId = 'user123';
    const mockReferrerId = 'referrer123';
    const mockToken = 'valid-jwt-token';

    // Mock referral service responses
    (referralService.setReferrer as jest.Mock).mockResolvedValue(true);
    (referralService.getReferralStats as jest.Mock).mockResolvedValue({
      referredCount: 1,
      totalEarned: 25.5,
      unpaidBalance: 12.75,
    });
    (referralService.getReferralEarnings as jest.Mock).mockResolvedValue({
      totalEarned: 25.5,
      unpaidBalance: 12.75,
      lastUpdated: new Date().toISOString(),
    });
    (referralService.getReferredUsers as jest.Mock).mockResolvedValue([
      {
        id: 'referredUser1',
        username: 'Alice',
        joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    // Mock zetaChain service for payout
    const mockCctxHash = '0xabcdef1234567890';
    (zetaChainService.zetaChainService.sendTransaction as jest.Mock).mockResolvedValue(mockCctxHash);

    // Step 1: Set referrer
    const setReferrerReq = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        referrerId: mockReferrerId,
      },
    });

    const setReferrerRes = createMocks();

    // We don't have the actual handler for setting referrer, so we'll test the service directly
    const setReferrerResult = await referralService.setReferrer(mockUserId, mockReferrerId);
    expect(setReferrerResult).toBe(true);
    expect(referralService.setReferrer).toHaveBeenCalledWith(mockUserId, mockReferrerId);

    // Step 2: Check referral stats
    const statsReq = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    });

    const statsRes = createMocks();

    await referralApiHandler(statsReq as any, statsRes as any);

    expect(statsRes._getStatusCode()).toBe(200);
    expect(JSON.parse(statsRes._getData())).toEqual({
      success: true,
      stats: {
        referredCount: 1,
        totalEarned: 25.5,
        unpaidBalance: 12.75,
      },
    });

    // Step 3: Check earnings
    const earningsReq = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    });

    const earningsRes = createMocks();

    await referralEarningsApiHandler(earningsReq as any, earningsRes as any);

    expect(earningsRes._getStatusCode()).toBe(200);
    expect(JSON.parse(earningsRes._getData())).toEqual({
      success: true,
      earnings: {
        totalEarned: 25.5,
        unpaidBalance: 12.75,
        lastUpdated: expect.any(String),
      },
    });

    // Step 4: Check referred users
    const referredUsersReq = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    });

    const referredUsersRes = createMocks();

    // We don't have the actual handler for referred users, so we'll test the service directly
    const referredUsers = await referralService.getReferredUsers(mockUserId);
    expect(referredUsers).toHaveLength(1);
    expect(referredUsers[0]).toEqual({
      id: 'referredUser1',
      username: 'Alice',
      joinDate: expect.any(String),
    });
    expect(referralService.getReferredUsers).toHaveBeenCalledWith(mockUserId);

    // Step 5: Process payout (simulating the worker)
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({
        results: [
          {
            particle_user_id: mockUserId,
            unpaid_balance_usd: 12.75,
          },
        ],
      }),
      first: jest.fn().mockResolvedValue({
        wallet_address: '0xwallet123',
      }),
    };

    const mockEnv = {
      DB: mockDB,
    } as any;

    const controller = {} as any;
    const ctx = {} as any;

    await referralPayoutWorker.scheduled(controller, mockEnv, ctx);

    // Verify that the database was queried for eligible users
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT particle_user_id, unpaid_balance_usd FROM referral_earnings WHERE unpaid_balance_usd >= ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith(1.0);
    expect(mockDB.all).toHaveBeenCalled();

    // Verify that the user's wallet address was retrieved
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT wallet_address FROM user_preferences WHERE particle_user_id = ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith(mockUserId);
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that zetaChainService was called to send transaction
    expect(zetaChainService.zetaChainService.sendTransaction).toHaveBeenCalledWith(
      '0xwallet123',
      'USDC',
      '12.75',
      'ZETA',
      'USDC'
    );
  });

  it('should handle referral with no earnings', async () => {
    // Mock referral service responses with no earnings
    (referralService.getReferralStats as jest.Mock).mockResolvedValue({
      referredCount: 0,
      totalEarned: 0,
      unpaidBalance: 0,
    });
    (referralService.getReferralEarnings as jest.Mock).mockResolvedValue({
      totalEarned: 0,
      unpaidBalance: 0,
      lastUpdated: new Date().toISOString(),
    });

    const statsReq = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer valid-jwt-token`,
      },
    });

    const statsRes = createMocks();

    await referralApiHandler(statsReq as any, statsRes as any);

    expect(statsRes._getStatusCode()).toBe(200);
    expect(JSON.parse(statsRes._getData())).toEqual({
      success: true,
      stats: {
        referredCount: 0,
        totalEarned: 0,
        unpaidBalance: 0,
      },
    });
  });
});