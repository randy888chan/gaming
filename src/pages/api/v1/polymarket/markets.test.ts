import { createMocks } from 'node-mocks-http';

// Mock the polymarketService before importing the handler
jest.mock('@/services/polymarketService', () => ({
  polymarketService: {
    getSimplifiedMarkets: jest.fn(),
  },
}));

import handler from './markets';

describe('Polymarket Markets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the cache by deleting the module from cache
    jest.resetModules();
  });

  describe('GET /api/v1/polymarket/markets', () => {
    it('should return markets data successfully', async () => {
      const mockMarkets = {
        limit: 10,
        count: 1,
        next_cursor: 'next-page',
        data: [{
          condition_id: '0x123',
          question: 'Will this test pass?',
          slug: 'will-this-test-pass',
          tokens: [{
            token_id: '0x123-yes',
            outcome: 'Yes',
            price: 0.75
          }, {
            token_id: '0x123-no',
            outcome: 'No',
            price: 0.25
          }],
          category: 'Testing',
          active: true,
          closed: false,
          endDate: '2025-12-31T00:00:00Z',
          volume: 1000,
          liquidity: 5000
        }]
      };

      const { polymarketService } = require('@/services/polymarketService');
      polymarketService.getSimplifiedMarkets.mockResolvedValue(mockMarkets);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.markets).toEqual(mockMarkets);
      expect(responseData.cached).toBe(false);
      expect(responseData.timestamp).toBeGreaterThan(0);
    });

    it('should return cached data when available and not expired', async () => {
      const mockMarkets = {
        limit: 10,
        count: 1,
        next_cursor: 'next-page',
        data: [{
          condition_id: '0x123',
          question: 'Will this test pass?',
          slug: 'will-this-test-pass',
          tokens: [{
            token_id: '0x123-yes',
            outcome: 'Yes',
            price: 0.75
          }, {
            token_id: '0x123-no',
            outcome: 'No',
            price: 0.25
          }],
          category: 'Testing',
          active: true,
          closed: false,
          endDate: '2025-12-31T00:00:00Z',
          volume: 1000,
          liquidity: 5000
        }]
      };

      const { polymarketService } = require('@/services/polymarketService');
      polymarketService.getSimplifiedMarkets.mockResolvedValueOnce(mockMarkets);
      polymarketService.getSimplifiedMarkets.mockResolvedValueOnce(mockMarkets); // For second call

      // First call to populate cache
      const { req: req1, res: res1 } = createMocks({
        method: 'GET',
      });

      await handler(req1, res1);

      const firstResponseData = JSON.parse(res1._getData());
      const timestamp = firstResponseData.timestamp;

      // Second call should return cached data
      const { req: req2, res: res2 } = createMocks({
        method: 'GET',
      });

      await handler(req2, res2);

      expect(res2._getStatusCode()).toBe(200);
      const secondResponseData = JSON.parse(res2._getData());
      expect(secondResponseData.success).toBe(true);
      expect(secondResponseData.markets).toEqual(mockMarkets);
      expect(secondResponseData.cached).toBe(true);
      expect(secondResponseData.timestamp).toBe(timestamp);
    });

    it('should handle errors when fetching markets', async () => {
      const { polymarketService } = require('@/services/polymarketService');
      polymarketService.getSimplifiedMarkets.mockRejectedValue(new Error('API Error'));

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'API Error',
      });
    });

    it('should handle errors with no message when fetching markets', async () => {
      const { polymarketService } = require('@/services/polymarketService');
      polymarketService.getSimplifiedMarkets.mockRejectedValue({});

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Failed to fetch polymarket markets',
      });
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getData()).toBe('Method POST Not Allowed');
      expect(res.getHeader('Allow')).toEqual(['GET']);
    });
  });
});