import { NextApiRequest, NextApiResponse } from 'next';
import { jest } from '@jest/globals';

let mockVerify: jest.Mock;

jest.doMock('jsonwebtoken', () => {
  mockVerify = jest.fn();
  return {
    default: {
      verify: mockVerify,
    },
    verify: mockVerify,
  };
});

import { withAuth, isValidParticleUserId } from './authMiddleware';

describe('authMiddleware', () => {
  let mockRequest: Partial<NextApiRequest>;
  let mockResponse: Partial<NextApiResponse>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockHandler: jest.Mock;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    
    mockRequest = {
      headers: {},
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    
    mockHandler = jest.fn();
    
    // Set up default environment
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'test-secret';
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 when no authorization header is provided', async () => {
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(
      mockRequest as NextApiRequest,
      mockResponse as NextApiResponse
    );
    
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized: No token provided."
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', async () => {
    mockRequest.headers = {
      authorization: 'Basic some-token'
    };
    
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(
      mockRequest as NextApiRequest,
      mockResponse as NextApiResponse
    );
    
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized: No token provided."
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should return 500 when JWT secret is not configured', async () => {
    // Remove the JWT secret from environment
    delete process.env.PARTICLE_NETWORK_JWT_SECRET;
    
    mockRequest.headers = {
      authorization: 'Bearer some-token'
    };
    
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(
      mockRequest as NextApiRequest,
      mockResponse as NextApiResponse
    );
    
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: "Server configuration error: JWT secret not configured."
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', async () => {
    // Mock jwt.verify to throw an error
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    mockRequest.headers = {
      authorization: 'Bearer invalid-token'
    };
    
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(
      mockRequest as NextApiRequest,
      mockResponse as NextApiResponse
    );
    
    // Check that verify was called with correct parameters
    expect(mockVerify).toHaveBeenCalledWith('invalid-token', 'test-secret');
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized: Invalid or expired token."
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should call the handler when token is valid', async () => {
    // Mock jwt.verify to return a valid decoded token
    mockVerify.mockReturnValue({
      particle_user_id: 'testuser123',
      exp: Date.now() / 1000 + 3600, // Expires in 1 hour
      iat: Date.now() / 1000,
    });
    
    mockRequest.headers = {
      authorization: 'Bearer valid-token'
    };
    
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(
      mockRequest as NextApiRequest,
      mockResponse as NextApiResponse
    );
    
    // Check that verify was called with correct parameters
    expect(mockVerify).toHaveBeenCalledWith('valid-token', 'test-secret');
    // Check that the handler was called
    expect(mockHandler).toHaveBeenCalled();
  });
});

describe('isValidParticleUserId', () => {
  it('should return true for valid user IDs', () => {
    expect(isValidParticleUserId('testuser123')).toBe(true);
    expect(isValidParticleUserId('anotheruser')).toBe(true);
    expect(isValidParticleUserId('1234567890')).toBe(true);
  });

  it('should return false for user IDs with special characters', () => {
    expect(isValidParticleUserId('test-user')).toBe(false);
    expect(isValidParticleUserId('test_user')).toBe(false);
    expect(isValidParticleUserId('test.user')).toBe(false);
    expect(isValidParticleUserId('test user')).toBe(false);
  });

  it('should return false for empty or long user IDs', () => {
    expect(isValidParticleUserId('')).toBe(false);
    expect(isValidParticleUserId('a'.repeat(101))).toBe(false);
  });
});
