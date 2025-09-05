import { NextApiRequest, NextApiResponse } from 'next';
import { jest } from '@jest/globals';

// Mock jsonwebtoken
const mockVerify = jest.fn();

jest.mock('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
  },
  verify: mockVerify,
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<NextApiRequest>;
  let mockResponse: Partial<NextApiResponse>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockHandler: jest.Mock;
  let originalEnv: NodeJS.ProcessEnv;
  let withAuth: any;

  // Import after mocking
  beforeAll(async () => {
    const authModule = await import('./authMiddleware');
    withAuth = authModule.withAuth;
  });

  beforeEach(() => {
    originalEnv = process.env;
    
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    
    mockRequest = {
      headers: {},
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
    // Mock jwt.verify to succeed (no throw)
    mockVerify.mockImplementation(() => {
      // Do nothing, just succeed
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