import { getSimplifiedMarkets, placePolymarketBet, PaginatedSimplifiedMarkets } from '../../src/services/polymarketService';
import { ClobClient } from '@polymarket/clob-client';
import { jest } from '@jest/globals';
import { ethers } from 'ethers';

// Create a proper mock for ClobClient
jest.mock('@polymarket/clob-client', () => {
  return {
    ClobClient: jest.fn().mockImplementation(() => ({
      getSimplifiedMarkets: jest.fn()
    }))
  };
});

describe('polymarketService', () => {
  let mockClient: {
    getSimplifiedMarkets: jest.Mock<Promise<PaginatedSimplifiedMarkets>, [{ next_cursor: string }]>;
  };

  beforeEach(() => {
    // Initialize the mock client
    mockClient = new (ClobClient as jest.Mock)() as any;
    jest.clearAllMocks();
  });

  describe('getSimplifiedMarkets', () => {
    it('should return simplified market data', async () => {
      const mockResponse: PaginatedSimplifiedMarkets = {
        limit: 10,
        count: 1,
        next_cursor: 'next-page',
        data: [{
          condition_id: '0x123',
          question: 'Will ETH hit $5000?',
          slug: 'eth-5000',
          tokens: [{
            token_id: '0x123-yes',
            outcome: 'Yes',
            price: 0.45
          }, {
            token_id: '0x123-no',
            outcome: 'No',
            price: 0.55
          }],
          category: 'Crypto',
          active: true,
          closed: false,
          endDate: '2025-12-31T00:00:00Z',
          volume: 1000,
          liquidity: 5000
        }]
      };

      mockClient.getSimplifiedMarkets.mockResolvedValue(mockResponse);

      const result = await getSimplifiedMarkets();
      
      expect(mockClient.getSimplifiedMarkets).toHaveBeenCalledWith({
        next_cursor: ''
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockClient.getSimplifiedMarkets.mockRejectedValue(new Error('API error'));

      const result = await getSimplifiedMarkets();
      
      // Should return empty data structure on error
      expect(result).toEqual({
        limit: 0,
        count: 0,
        next_cursor: null,
        data: []
      });
    });
  });

  describe('placePolymarketBet', () => {
    it('should encode bet payload correctly', () => {
      const conditionId = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const outcomeIndex = 1;
      const amount = BigInt(1000000000000000000); // 1 ETH

      const result = placePolymarketBet(conditionId, outcomeIndex, amount);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should validate conditionId format', () => {
      expect(() => placePolymarketBet('invalid', 0, BigInt(100)))
        .toThrow('Invalid conditionId format');
    });

    it('should validate outcomeIndex', () => {
      expect(() => placePolymarketBet('0x1234567890123456789012345678901234567890123456789012345678901234', -1, BigInt(100)))
        .toThrow('Invalid outcomeIndex');
    });

    it('should validate amount', () => {
      expect(() => placePolymarketBet('0x1234567890123456789012345678901234567890123456789012345678901234', 0, BigInt(0)))
        .toThrow('Amount must be positive');
    });
  });
});