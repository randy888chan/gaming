import { jest } from '@jest/globals';

// Mock jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
  },
}));

describe('particleAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up default environment
    process.env.PARTICLE_NETWORK_JWT_SECRET = 'test-secret';
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should verify a valid token and return particle user ID', async () => {
    const { verifyParticleToken } = await import('./particleAuth');
    const jwt = await import('jsonwebtoken');
    
    // Mock successful verification with particle_user_id
    (jwt.default.verify as jest.Mock).mockReturnValue({
      particle_user_id: 'user-123',
    });

    const result = await verifyParticleToken('valid-token');
    expect(result).toBe('user-123');
    expect(jwt.default.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
  });

  it('should use sub field when particle_user_id is not present', async () => {
    const { verifyParticleToken } = await import('./particleAuth');
    const jwt = await import('jsonwebtoken');
    
    // Mock successful verification with sub field
    (jwt.default.verify as jest.Mock).mockReturnValue({
      sub: 'user-456',
    });

    const result = await verifyParticleToken('valid-token');
    expect(result).toBe('user-456');
    expect(jwt.default.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
  });

  it('should throw error when JWT secret is not configured', async () => {
    const { verifyParticleToken } = await import('./particleAuth');
    
    // Remove the JWT secret from environment
    delete process.env.PARTICLE_NETWORK_JWT_SECRET;
    
    await expect(verifyParticleToken('any-token'))
      .rejects
      .toThrow('PARTICLE_NETWORK_JWT_SECRET is not configured');
  });

  it('should throw error when particle user ID is not found in token', async () => {
    const { verifyParticleToken } = await import('./particleAuth');
    const jwt = await import('jsonwebtoken');
    
    // Mock verification with no user ID fields
    (jwt.default.verify as jest.Mock).mockReturnValue({
      other_field: 'value',
    });

    await expect(verifyParticleToken('valid-token'))
      .rejects
      .toThrow('Invalid or expired Particle Network token');
  });

  it('should throw error when token verification fails', async () => {
    const { verifyParticleToken } = await import('./particleAuth');
    const jwt = await import('jsonwebtoken');
    
    // Mock verification failure
    (jwt.default.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token expired');
    });

    await expect(verifyParticleToken('expired-token'))
      .rejects
      .toThrow('Invalid or expired Particle Network token');
  });
});