/**
 * Particle Auth utilities tests
 */

import { verifyParticleToken, hashUserId, enhancedVerifyParticleToken } from './particleAuth';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { logSecurityEvent } from './securityAudit';

// Mock the security audit logger
jest.mock('./securityAudit', () => ({
  logSecurityEvent: jest.fn()
}));

// Mock environment variables
process.env.PARTICLE_NETWORK_JWT_SECRET = 'test-secret';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hashed-user-id')
  }))
}));

describe('Particle Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyParticleToken', () => {
    it('should throw error when JWT secret is not configured', async () => {
      delete process.env.PARTICLE_NETWORK_JWT_SECRET;
      
      await expect(verifyParticleToken('test-token'))
        .rejects
        .toThrow('PARTICLE_NETWORK_JWT_SECRET is not configured');
        
      process.env.PARTICLE_NETWORK_JWT_SECRET = 'test-secret';
    });

    it('should throw error for invalid token format', async () => {
      await expect(verifyParticleToken('short'))
        .rejects
        .toThrow('Invalid token format');
        
      await expect(verifyParticleToken('a'.repeat(1001)))
        .rejects
        .toThrow('Invalid token format');
    });

    it('should throw error for expired tokens', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        particle_user_id: 'test-user',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      }));
      
      await expect(verifyParticleToken('valid-token'))
        .rejects
        .toThrow('Token has expired');
    });

    it('should throw error for tokens issued in the future', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        particle_user_id: 'test-user',
        iat: Math.floor(Date.now() / 1000) + 120 // Issued 2 minutes in the future
      }));
      
      await expect(verifyParticleToken('valid-token'))
        .rejects
        .toThrow('Token issued in the future');
    });

    it('should throw error when particle user ID is not found', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({}));
      
      await expect(verifyParticleToken('valid-token'))
        .rejects
        .toThrow('Particle user ID not found in token');
    });

    it('should throw error for invalid particle user ID format', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        particle_user_id: 'invalid user id with spaces'
      }));
      
      await expect(verifyParticleToken('valid-token'))
        .rejects
        .toThrow('Invalid particle user ID format');
    });

    it('should return particle user ID for valid tokens', async () => {
      const particleUserId = 'test-user-id';
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        particle_user_id: particleUserId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }));
      
      const result = await verifyParticleToken('valid-token');
      expect(result).toBe(particleUserId);
    });
  });

  describe('hashUserId', () => {
    it('should create a hash of the user ID', () => {
      const userId = 'test-user-id';
      const hashed = hashUserId(userId);
      expect(hashed).toBe('hashed-user-id');
      expect(createHash).toHaveBeenCalledWith('sha256');
    });
  });

  describe('enhancedVerifyParticleToken', () => {
    it('should log successful authentication', async () => {
      const particleUserId = 'test-user-id';
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        particle_user_id: particleUserId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }));
      
      const result = await enhancedVerifyParticleToken(
        'valid-token',
        '127.0.0.1',
        'test-user-agent'
      );
      
      expect(result).toBe(particleUserId);
      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'AUTH_SUCCESS',
        userId: 'hashed-user-id',
        ipAddress: '127.0.0.1',
        userAgent: 'test-user-agent',
        details: 'Token verification successful'
      });
    });

    it('should log authentication failure', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      await expect(enhancedVerifyParticleToken(
        'invalid-token',
        '127.0.0.1',
        'test-user-agent'
      )).rejects.toThrow('Invalid or expired Particle Network token');
      
      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'AUTH_FAILURE',
        ipAddress: '127.0.0.1',
        userAgent: 'test-user-agent',
        details: 'Token verification failed: Invalid or expired Particle Network token',
        severity: 'HIGH'
      });
    });
  });
});