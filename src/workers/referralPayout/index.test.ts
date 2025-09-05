// Mock the zetaChainService
jest.mock('../../services/zetaChainService', () => ({
  zetaChainService: {
    sendTransaction: jest.fn()
  }
}));

import worker from './index';
import * as zetaChainService from '../../services/zetaChainService';

describe('ReferralPayout Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process referral payouts when scheduled', async () => {
    const mockCctxHash = '0x123456789abcdef';

    (zetaChainService.zetaChainService.sendTransaction as jest.Mock).mockResolvedValue(mockCctxHash);

    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        all: jest.fn().mockResolvedValue({
          results: [
            {
              particle_user_id: 'user1',
              unpaid_balance_usd: 10.0
            }
          ]
        }),
        first: jest.fn().mockResolvedValue({
          wallet_address: '0xwallet123'
        }),
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const controller = {} as any;
    const ctx = {} as any;

    await worker.scheduled(controller, env as any, ctx);

    // Verify that the database methods were called
    expect(env.DB.prepare).toHaveBeenCalled();
    expect(zetaChainService.zetaChainService.sendTransaction).toHaveBeenCalled();
  });

  it('should handle errors when processing referral payouts fails', async () => {
    (zetaChainService.zetaChainService.sendTransaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

    // Mock environment and context
    const env = {
      DB: {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        all: jest.fn().mockResolvedValue({
          results: [
            {
              particle_user_id: 'user1',
              unpaid_balance_usd: 10.0
            }
          ]
        }),
        first: jest.fn().mockResolvedValue({
          wallet_address: '0xwallet123'
        }),
        run: jest.fn().mockResolvedValue(undefined)
      }
    };

    const controller = {} as any;
    const ctx = {} as any;

    // This should not throw an error as the worker catches it
    await expect(worker.scheduled(controller, env as any, ctx)).resolves.not.toThrow();
  });

  it('should handle queue messages (though it\'s not expected to receive them)', async () => {
    const env = {} as any;
    const batch = {
      messages: []
    } as any;
    const ctx = {} as any;

    // This should not throw an error
    await expect(worker.queue(batch, env, ctx)).resolves.not.toThrow();
  });
});