import { createMocks } from 'node-mocks-http';
import handler from './credit-config';

// Mock the CreditConfigService
jest.mock('../../../../services/CreditConfigService', () => ({
  creditConfigService: {
    getConfig: jest.fn(),
    createConfig: jest.fn(),
    updateConfig: jest.fn(),
    deleteConfig: jest.fn(),
  },
}));

// Mock the auth middleware
jest.mock('../../../../utils/authMiddleware', () => ({
  withAuth: (handler) => handler,
}));

// Mock the rate limit middleware
jest.mock('../../../../utils/rateLimitMiddleware', () => ({
  withRateLimit: (handler) => handler,
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Credit Config API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/credit-config', () => {
    it('should return a config when found', async () => {
      const mockConfig = {
        id: 'test-config',
        name: 'Test Config',
        rules: { enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      require('../../../../services/CreditConfigService').creditConfigService.getConfig.mockResolvedValue(mockConfig);

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'test-config' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        config: mockConfig,
      });
    });

    it('should return a default config when not found', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.getConfig.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'non-existent' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        config: {
          id: 'non-existent',
          name: 'Default Credit Configuration',
          rules: {
            enabled: false,
            amount: 0,
            chains: [],
            treasuryWallet: '',
            kmsProvider: '',
          },
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      });
    });

    it('should handle errors when getting config', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.getConfig.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('POST /api/v1/admin/credit-config', () => {
    it('should create a new config when no id is provided', async () => {
      const mockConfig = {
        id: 'new-config',
        name: 'New Config',
        rules: { enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      require('../../../../services/CreditConfigService').creditConfigService.createConfig.mockResolvedValue(mockConfig);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'New Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        config: mockConfig,
      });
    });

    it('should update an existing config when id is provided', async () => {
      const mockConfig = {
        id: 'existing-config',
        name: 'Updated Config',
        rules: { enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      require('../../../../services/CreditConfigService').creditConfigService.updateConfig.mockResolvedValue(mockConfig);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          id: 'existing-config',
          name: 'Updated Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        config: mockConfig,
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Missing Rules',
          // rules is missing
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Missing required fields: name, rules.',
      });
    });

    it('should handle errors when creating/updating config', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.createConfig.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'New Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('DELETE /api/v1/admin/credit-config', () => {
    it('should delete a config successfully', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.deleteConfig.mockResolvedValue(true);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'config-to-delete' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        message: 'Configuration deleted successfully.',
      });
    });

    it('should return 404 when config to delete is not found', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.deleteConfig.mockResolvedValue(false);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'non-existent' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Configuration not found for deletion.',
      });
    });

    it('should return 400 when id is missing or invalid', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: ['invalid', 'array'] }, // Invalid id type
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Missing or invalid config ID for deletion.',
      });
    });

    it('should handle errors when deleting config', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.deleteConfig.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'config-to-delete' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('PUT /api/v1/admin/credit-config', () => {
    it('should update a config successfully', async () => {
      const mockConfig = {
        id: 'config-to-update',
        name: 'Updated Config',
        rules: { enabled: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      require('../../../../services/CreditConfigService').creditConfigService.updateConfig.mockResolvedValue(mockConfig);

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'config-to-update',
          name: 'Updated Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        config: mockConfig,
      });
    });

    it('should return 400 when id is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Missing or invalid config ID for update.',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'config-to-update',
          name: 'Updated Config',
          // rules is missing
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Missing required fields: name, rules.',
      });
    });

    it('should return 404 when config to update is not found', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.updateConfig.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'non-existent',
          name: 'Updated Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Configuration not found for update.',
      });
    });

    it('should handle errors when updating config', async () => {
      require('../../../../services/CreditConfigService').creditConfigService.updateConfig.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'config-to-update',
          name: 'Updated Config',
          rules: { enabled: true },
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Method Not Allowed',
      });
    });
  });
});