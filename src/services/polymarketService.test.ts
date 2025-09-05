/**
 * Test for polymarketService
 */

// Mock the ClobClient since it's not available in test environment
jest.mock('@polymarket/clob-client', () => {
  return {
    ClobClient: jest.fn().mockImplementation(() => {
      return {
        getSimplifiedMarkets: jest.fn().mockResolvedValue({
          limit: 10,
          count: 2,
          next_cursor: 'cursor123',
          data: [
            {
              conditionId: '0x1234567890123456789012345678901234567890123456789012345678901234',
              question: 'Will this test pass?',
              outcomes: ['Yes', 'No'],
              outcomePrices: ['0.6', '0.4'],
              liquidity: '1000',
              volume: '5000',
              expiration: '2025-12-31T23:59:59Z'
            },
            {
              conditionId: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
              question: 'Is testing important?',
              outcomes: ['Yes', 'No'],
              outcomePrices: ['0.9', '0.1'],
              liquidity: '5000',
              volume: '25000',
              expiration: '2025-11-30T23:59:59Z'
            }
          ]
        })
      };
    })
  };
});

describe('polymarketService', () => {
  it('should be able to import the service', async () => {
    // This is a very basic test just to ensure the file can be imported
    const module = await import('./polymarketService');
    expect(module).toBeDefined();
    expect(typeof module.getSimplifiedMarkets).toBe('function');
    expect(typeof module.placePolymarketBet).toBe('function');
  });

  describe('getSimplifiedMarkets function', () => {
    it('should have getSimplifiedMarkets function', async () => {
      const module = await import('./polymarketService');
      expect(typeof module.getSimplifiedMarkets).toBe('function');
    });

    it('should be able to fetch simplified markets', async () => {
      const module = await import('./polymarketService');
      const result = await module.getSimplifiedMarkets();
      
      expect(result).toBeDefined();
      expect(result.limit).toBe(10);
      expect(result.count).toBe(2);
      expect(result.next_cursor).toBe('cursor123');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].question).toBe('Will this test pass?');
    });

    it('should handle errors when fetching simplified markets', async () => {
      const module = await import('./polymarketService');
      
      // Mock the ClobClient to throw an error
      const { ClobClient } = await import('@polymarket/clob-client');
      (ClobClient as jest.Mock).mockImplementationOnce(() => {
        return {
          getSimplifiedMarkets: jest.fn().mockRejectedValue(new Error('Network error'))
        };
      });
      
      const result = await module.getSimplifiedMarkets();
      
      expect(result).toBeDefined();
      expect(result.limit).toBe(0);
      expect(result.count).toBe(0);
      expect(result.data).toHaveLength(0);
      expect(result.next_cursor).toBeNull();
    });
  });

  describe('placePolymarketBet function', () => {
    it('should have placePolymarketBet function', async () => {
      const module = await import('./polymarketService');
      expect(typeof module.placePolymarketBet).toBe('function');
    });

    it('should be able to place a bet for outcome 0', async () => {
      const module = await import('./polymarketService');
      const conditionId = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const outcomeIndex = 0;
      const amount = BigInt(1000000000000000000n); // 1 token
      
      const result = module.placePolymarketBet(conditionId, outcomeIndex, amount);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be able to place a bet for outcome 1', async () => {
      const module = await import('./polymarketService');
      const conditionId = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const outcomeIndex = 1;
      const amount = BigInt(1000000000000000000n); // 1 token
      
      const result = module.placePolymarketBet(conditionId, outcomeIndex, amount);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid conditionId', async () => {
      const module = await import('./polymarketService');
      const conditionId = 'invalid-condition-id';
      const outcomeIndex = 0;
      const amount = BigInt(1000000000000000000n); // 1 token
      
      expect(() => {
        module.placePolymarketBet(conditionId, outcomeIndex, amount);
      }).toThrow('Invalid conditionId format. Must be a 32-byte hex string.');
    });

    it('should throw error for invalid outcomeIndex', async () => {
      const module = await import('./polymarketService');
      const conditionId = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const outcomeIndex = 2; // Invalid outcome index
      const amount = BigInt(1000000000000000000n); // 1 token
      
      expect(() => {
        module.placePolymarketBet(conditionId, outcomeIndex, amount);
      }).toThrow('Invalid outcomeIndex. Must be 0 or 1 for binary markets.');
    });

    it('should throw error for non-positive amount', async () => {
      const module = await import('./polymarketService');
      const conditionId = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const outcomeIndex = 0;
      const amount = BigInt(0); // Invalid amount
      
      expect(() => {
        module.placePolymarketBet(conditionId, outcomeIndex, amount);
      }).toThrow('Amount must be positive');
    });
  });
});