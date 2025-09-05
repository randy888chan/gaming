// Integration test for referral system
// This test verifies the interaction between ReferralService, referral API routes, and referralPayout worker

import * as referralService from '../services/ReferralService';
import * as referralPayoutWorker from '../workers/referralPayout/index';
import * as zetaChainService from '../services/zetaChainService';

// Mock the zetaChainService
jest.mock('../services/zetaChainService', () => ({
  zetaChainService: {
    sendTransaction: jest.fn(),
  },
}));

describe('Referral System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record referral earnings and process payouts', async () => {
    // Mock the zetaChainService response
    const mockCctxHash = '0x123456789abcdef';

    (zetaChainService.zetaChainService.sendTransaction as jest.Mock).mockResolvedValue(
      mockCctxHash
    );

    // Mock environment with database
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({
        results: [
          {
            particle_user_id: 'user123',
            unpaid_balance_usd: 10.0,
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

    // Execute the worker
    await referralPayoutWorker.default.scheduled(controller, mockEnv, ctx);

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
    expect(mockDB.bind).toHaveBeenCalledWith('user123');
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that zetaChainService was called to send transaction
    expect(zetaChainService.zetaChainService.sendTransaction).toHaveBeenCalledWith(
      '0xwallet123',
      'USDC',
      '10',
      'ZETA',
      'USDC'
    );

    // Verify that the cctx log was recorded
    expect(mockDB.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO zetachain_cctx_log')
    );
    expect(mockDB.bind).toHaveBeenCalled();
    expect(mockDB.run).toHaveBeenCalled();

    // Verify that the referral earnings were updated
    expect(mockDB.prepare).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE referral_earnings SET unpaid_balance_usd = 0')
    );
    expect(mockDB.bind).toHaveBeenCalledWith('user123');
    expect(mockDB.run).toHaveBeenCalled();
  });

  it('should handle users without wallet addresses gracefully', async () => {
    // Mock the database to return null for wallet address
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({
        results: [
          {
            particle_user_id: 'user123',
            unpaid_balance_usd: 10.0,
          },
        ],
      }),
      first: jest.fn().mockResolvedValue(null), // No wallet address found
    };

    const mockEnv = {
      DB: mockDB,
    } as any;

    const controller = {} as any;
    const ctx = {} as any;

    // Execute the worker - should not throw
    await expect(
      referralPayoutWorker.default.scheduled(controller, mockEnv, ctx)
    ).resolves.not.toThrow();

    // Verify that the database was queried for eligible users
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT particle_user_id, unpaid_balance_usd FROM referral_earnings WHERE unpaid_balance_usd >= ?'
    );
    expect(mockDB.all).toHaveBeenCalled();

    // Verify that the user's wallet address was attempted to be retrieved
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT wallet_address FROM user_preferences WHERE particle_user_id = ?'
    );
    expect(mockDB.bind).toHaveBeenCalledWith('user123');
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that zetaChainService was not called since no wallet address was found
    expect(zetaChainService.zetaChainService.sendTransaction).not.toHaveBeenCalled();
  });

  it('should handle zetaChain transaction failures gracefully', async () => {
    // Mock the zetaChainService to throw an error
    (zetaChainService.zetaChainService.sendTransaction as jest.Mock).mockRejectedValue(
      new Error('Transaction failed')
    );

    // Mock environment with database
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({
        results: [
          {
            particle_user_id: 'user123',
            unpaid_balance_usd: 10.0,
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

    // Execute the worker - should not throw
    await expect(
      referralPayoutWorker.default.scheduled(controller, mockEnv, ctx)
    ).resolves.not.toThrow();

    // Verify that the database was queried
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockDB.first).toHaveBeenCalled();

    // Verify that zetaChainService was called
    expect(zetaChainService.zetaChainService.sendTransaction).toHaveBeenCalledWith(
      '0xwallet123',
      'USDC',
      '10',
      'ZETA',
      'USDC'
    );

    // Verify that the cctx log was not recorded due to transaction failure
    expect(mockDB.prepare).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO zetachain_cctx_log')
    );

    // Verify that the referral earnings were not updated due to transaction failure
    expect(mockDB.prepare).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE referral_earnings SET unpaid_balance_usd = 0')
    );
  });
});