/**
 * Security middleware tests
 */

import { createMockRequest, createMockResponse, generateMockParticleToken, generateRandomParticleUserId } from './securityTestUtils';
import { withEnhancedSecurity, withEnhancedAuth, withRequestValidation } from './securityMiddleware';
import { logSecurityEvent } from './securityAudit';

// Mock the security audit logger
jest.mock('./securityAudit', () => ({
  logSecurityEvent: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    return {
      particle_user_id: 'test-user-id',
      sub: 'test-user-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    };
  })
}));

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withEnhancedSecurity', () => {
    it('should apply security headers to the response', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withEnhancedSecurity(handler);
      
      await middleware(mockReq, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:;");
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(handler).toHaveBeenCalled();
    });

    it('should not include "unsafe-inline" in Content-Security-Policy', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withEnhancedSecurity(handler);

      await middleware(mockReq, mockRes);

      const cspHeaderCall = (mockRes.setHeader as jest.Mock).mock.calls.find(call => call[0] === 'Content-Security-Policy');
      expect(cspHeaderCall[1]).not.toContain('unsafe-inline');
    });
  });

  describe('withEnhancedAuth', () => {
    it('should reject requests without authorization header', async () => {
      const mockReq = createMockRequest({
        headers: {}
      });
      const mockRes = createMockResponse();
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withEnhancedAuth(handler);
      
      await middleware(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: "Unauthorized: No token provided." });
      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'AUTH_FAILURE',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/api/test',
        details: 'Missing or invalid authorization header'
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token format', async () => {
      const mockReq = createMockRequest({
        headers: {
          'authorization': 'Bearer short'
        }
      });
      const mockRes = createMockResponse();
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withEnhancedAuth(handler);
      
      await middleware(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: "Unauthorized: Invalid token format." });
      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'AUTH_FAILURE',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/api/test',
        details: 'Invalid token format'
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should authenticate valid tokens', async () => {
      const particleUserId = generateRandomParticleUserId();
      const token = generateMockParticleToken(particleUserId);
      
      const mockReq = createMockRequest({
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      const mockRes = createMockResponse();
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withEnhancedAuth(handler);
      
      await middleware(mockReq, mockRes);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('withRequestValidation', () => {
    it('should reject invalid requests', async () => {
      const mockReq = createMockRequest({
        body: { invalid: true }
      });
      const mockRes = createMockResponse();
      
      const validator = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['Invalid request']
      });
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withRequestValidation(validator);
      const wrappedMiddleware = middleware(handler);
      
      await wrappedMiddleware(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation failed",
        details: ['Invalid request']
      });
      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'INPUT_VALIDATION_FAILURE',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/api/test',
        details: 'Input validation failed: Invalid request'
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow valid requests', async () => {
      const mockReq = createMockRequest({
        body: { valid: true }
      });
      const mockRes = createMockResponse();
      
      const validator = jest.fn().mockReturnValue({
        isValid: true
      });
      
      const handler = jest.fn().mockResolvedValue(undefined);
      const middleware = withRequestValidation(validator);
      const wrappedMiddleware = middleware(handler);
      
      await wrappedMiddleware(mockReq, mockRes);
      
      expect(handler).toHaveBeenCalled();
    });
  });
});