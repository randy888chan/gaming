/**
 * Security testing utilities for testing security features
 */

import jwt from "jsonwebtoken";
import { createHash } from "crypto";

/**
 * Generates a mock Particle Network JWT token for testing
 * @param particleUserId The particle user ID to include in the token
 * @param secret The secret to sign the token with
 * @param expiresIn The expiration time for the token
 * @returns A signed JWT token
 */
export function generateMockParticleToken(
  particleUserId: string,
  secret: string = process.env.PARTICLE_NETWORK_JWT_SECRET || 'test-secret',
  expiresIn: string = '1h'
): string {
  const payload = {
    particle_user_id: particleUserId,
    sub: particleUserId,
    exp: Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : 3600),
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Generates a hash of the user ID for testing
 * @param userId The user ID to hash
 * @returns A hashed version of the user ID
 */
export function hashUserIdForTest(userId: string): string {
  return createHash('sha256').update(userId).digest('hex');
}

/**
 * Generates a random wallet address for testing
 * @param type The type of wallet address to generate (ethereum or solana)
 * @returns A random wallet address
 */
export function generateRandomWalletAddress(type: 'ethereum' | 'solana' = 'ethereum'): string {
  if (type === 'ethereum') {
    // Generate a random Ethereum address
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  } else {
    // Generate a random Solana address (Base58)
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }
}

/**
 * Generates a random particle user ID for testing
 * @returns A random particle user ID
 */
export function generateRandomParticleUserId(): string {
  // Generate a random UUID-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Creates a mock request object for testing
 * @param overrides Any properties to override in the mock request
 * @returns A mock request object
 */
export function createMockRequest(overrides: any = {}): any {
  return {
    method: 'GET',
    headers: {
      'authorization': 'Bearer mock-token',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    socket: {
      remoteAddress: '127.0.0.1'
    },
    url: '/api/test',
    query: {},
    body: {},
    ...overrides
  };
}

/**
 * Creates a mock response object for testing
 * @returns A mock response object
 */
export function createMockResponse(): any {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  
  return res;
}