import { createMocks } from 'node-mocks-http';
import handler from './smart-bet';
import * as aiAdapter from '../../services/aiAdapter';
import * as rateLimitMiddleware from '../../utils/rateLimitMiddleware';
import * as particleAuth from '../../utils/particleAuth';

// Mock the middlewares and services
jest.mock('../../utils/rateLimitMiddleware', () => ({
  withRateLimit: jest.fn((handler) => handler)
}));

jest.mock('../../utils/particleAuth', () => ({
  verifyParticleToken: jest.fn()
}));

jest.mock('../../services/aiAdapter', () => ({
  getSmartBetSuggestion: jest.fn()
}));

describe('/api/smart-bet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return smart bet suggestion for GET request with valid token and marketId', async () => {
    const mockUserId = 'user123';
    const mockSuggestion = {
      marketId: 'market123',
      recommendation: 'bet_on_yes',
      confidence: 0.85,
      analysis: 'Based on historical data and current trends'
    };

    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue(mockUserId);
    (aiAdapter.getSmartBetSuggestion as jest.Mock).mockResolvedValue(mockSuggestion);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      },
      query: {
        marketId: 'market123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockSuggestion);
    expect(particleAuth.verifyParticleToken).toHaveBeenCalledWith('valid-token');
    expect(aiAdapter.getSmartBetSuggestion).toHaveBeenCalledWith('market123', mockUserId);
  });

  it('should return 401 for GET request without authorization header', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Missing or invalid authorization header'
    });
  });

  it('should return 401 for GET request with invalid token', async () => {
    (particleAuth.verifyParticleToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Invalid or expired token'
    });
  });

  it('should return 400 for GET request with missing marketId', async () => {
    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue('user123');

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      },
      query: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Missing or invalid marketId'
    });
  });

  it('should return 404 when no smart bet suggestion is found', async () => {
    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue('user123');
    (aiAdapter.getSmartBetSuggestion as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      },
      query: {
        marketId: 'market123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'No smart bet suggestion found for this market.'
    });
  });

  it('should return 500 when getSmartBetSuggestion throws an error', async () => {
    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue('user123');
    (aiAdapter.getSmartBetSuggestion as jest.Mock).mockRejectedValue(new Error('Service error'));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      },
      query: {
        marketId: 'market123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Internal Server Error'
    });
  });

  it('should return 405 for non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Method Not Allowed'
    });
  });
});