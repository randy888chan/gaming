import { withRateLimit, withSensitiveRateLimit } from './rateLimitMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

let mockIpLimiter: jest.Mock;
let mockStandardLimiter: jest.Mock;
let mockSpeedLimiter: jest.Mock;
let mockSensitiveLimiter: jest.Mock;

jest.doMock('express-rate-limit', () => {
    mockIpLimiter = jest.fn((req, res, next) => next());
    mockStandardLimiter = jest.fn((req, res, next) => next());
    mockSensitiveLimiter = jest.fn((req, res, next) => next());
    return jest.fn().mockImplementation((options) => {
        if (options && options.keyGenerator) {
            // This is the sensitive limiter
            return mockSensitiveLimiter;
        }
        if (options && options.max === 100) {
            return mockIpLimiter;
        }
        return mockStandardLimiter;
    });
});

jest.doMock('express-slow-down', () => {
    mockSpeedLimiter = jest.fn((req, res, next) => next());
    return jest.fn(() => mockSpeedLimiter);
});

describe('rateLimitMiddleware', () => {
  let mockRequest: Partial<NextApiRequest>;
  let mockResponse: Partial<NextApiResponse>;
  let mockHandler: jest.Mock;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    
    mockRequest = {
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test',
      socket: { remoteAddress: '127.0.0.1' } as any,
      headers: {},
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      headersSent: false,
    } as any;
    
    mockHandler = jest.fn();
    jest.clearAllMocks();
  });

  describe('withRateLimit', () => {
    it('should call the handler when rate limit is not exceeded', async () => {
        const { withRateLimit } = await import('./rateLimitMiddleware');
        const wrappedHandler = withRateLimit(mockHandler);
        await wrappedHandler(
            mockRequest as NextApiRequest,
            mockResponse as NextApiResponse
        );
        expect(mockHandler).toHaveBeenCalled();
    });

    it('should not call the handler when middleware throws an error', async () => {
        mockIpLimiter.mockImplementationOnce((req, res, next) => {
            next(new Error("Middleware error"));
        });
        const { withRateLimit } = await import('./rateLimitMiddleware');
        const wrappedHandler = withRateLimit(mockHandler);
        await wrappedHandler(
            mockRequest as NextApiRequest,
            mockResponse as NextApiResponse
        );
        expect(mockHandler).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ success: false, error: "Internal server error" });
    });
  });

  describe('withSensitiveRateLimit', () => {
    it('should call the handler when rate limit is not exceeded', async () => {
        const { withSensitiveRateLimit } = await import('./rateLimitMiddleware');
        const wrappedHandler = withSensitiveRateLimit(mockHandler);
        await wrappedHandler(
            mockRequest as NextApiRequest,
            mockResponse as NextApiResponse
        );
        expect(mockHandler).toHaveBeenCalled();
    });

    it('should not call the handler when middleware throws an error', async () => {
        mockIpLimiter.mockImplementationOnce((req, res, next) => {
            next(new Error("Middleware error"));
        });
        const { withSensitiveRateLimit } = await import('./rateLimitMiddleware');
        const wrappedHandler = withSensitiveRateLimit(mockHandler);
        await wrappedHandler(
            mockRequest as NextApiRequest,
            mockResponse as NextApiResponse
        );
        expect(mockHandler).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ success: false, error: "Internal server error" });
    });

    it('should use user ID as key for valid token', async () => {
        const { withSensitiveRateLimit } = await import('./rateLimitMiddleware');
        const rateLimit = require('express-rate-limit');
        const keyGenerator = rateLimit.mock.calls[0][0].keyGenerator;

        const req = {
            headers: { authorization: 'Bearer valid-token' },
            ip: '127.0.0.1',
            socket: { remoteAddress: '127.0.0.1' },
            'user-agent': 'test-agent',
        } as any;

        const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue({ particle_user_id: 'test-user' } as any);

        const key = keyGenerator(req);
        expect(key).toBe('test-user');
        verifySpy.mockRestore();
    });

    it('should use IP and user agent as key for invalid token', async () => {
        const { withSensitiveRateLimit } = await import('./rateLimitMiddleware');
        const rateLimit = require('express-rate-limit');
        const keyGenerator = rateLimit.mock.calls[0][0].keyGenerator;

        const req = {
            headers: { authorization: 'Bearer invalid-token' },
            ip: '127.0.0.1',
            socket: { remoteAddress: '127.0.0.1' },
            'user-agent': 'test-agent',
        } as any;

        const verifySpy = jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const key = keyGenerator(req);
        expect(key).toBe('127.0.0.1test-agent');
        verifySpy.mockRestore();
    });
  });
});
