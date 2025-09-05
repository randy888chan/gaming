// End-to-end test for user registration and first play journey
// This test simulates a complete user journey from registration to first play

import { createMocks } from 'node-mocks-http';
import * as userService from '../src/services/UserService';
import * as creditConfigService from '../src/services/CreditConfigService';
import * as particleAuth from '../src/utils/particleAuth';
import userApiHandler from '../src/pages/api/v1/users/index';
import creditConfigApiHandler from '../src/pages/api/v1/admin/credit-config';

// Mock the services and utilities
jest.mock('../src/services/UserService', () => ({
  UserService: {
    createUser: jest.fn(),
    getUserByWalletAddress: jest.fn(),
    updateUserCredits: jest.fn(),
  },
}));

jest.mock('../src/services/CreditConfigService', () => ({
  creditConfigService: {
    getConfig: jest.fn(),
  },
}));

jest.mock('../src/utils/particleAuth', () => ({
  verifyParticleToken: jest.fn(),
}));

describe('User Registration and First Play Journey - E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the full user journey: registration -> first play -> credit claim', async () => {
    // Mock user data
    const mockWalletAddress = '0x1234567890123456789012345678901234567890';
    const mockParticleUserId = 'user123';
    const mockToken = 'valid-jwt-token';

    // Mock the particle auth verification
    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue(mockParticleUserId);

    // Mock user service responses
    (userService.UserService.getUserByWalletAddress as jest.Mock).mockResolvedValue(null); // User doesn't exist yet
    (userService.UserService.createUser as jest.Mock).mockResolvedValue({
      walletAddress: mockWalletAddress,
      credits: 0,
      claimedFirstPlayCredits: false,
    });

    // Mock credit config service
    (creditConfigService.creditConfigService.getConfig as jest.Mock).mockResolvedValue({
      id: 'first-play-free',
      name: 'First Play Free Credits',
      rules: {
        amount: 100,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Mock user service update
    (userService.UserService.updateUserCredits as jest.Mock).mockResolvedValue({
      walletAddress: mockWalletAddress,
      credits: 100,
      claimedFirstPlayCredits: true,
    });

    // Step 1: User registration
    const registrationReq = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        walletAddress: mockWalletAddress,
      },
    });

    const registrationRes = createMocks();

    await userApiHandler(registrationReq as any, registrationRes as any);

    expect(registrationRes._getStatusCode()).toBe(200);
    expect(JSON.parse(registrationRes._getData())).toEqual({
      user: expect.objectContaining({
        walletAddress: mockWalletAddress,
        credits: 0,
      }),
      message: 'User created successfully',
    });

    // Verify that the user service was called
    expect(userService.UserService.getUserByWalletAddress).toHaveBeenCalledWith(mockWalletAddress);
    expect(userService.UserService.createUser).toHaveBeenCalledWith({
      walletAddress: mockWalletAddress,
    });

    // Step 2: First play and credit claim
    const creditClaimReq = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        walletAddress: mockWalletAddress,
        action: 'claim-first-play-credits',
      },
    });

    const creditClaimRes = createMocks();

    await userApiHandler(creditClaimReq as any, creditClaimRes as any);

    expect(creditClaimRes._getStatusCode()).toBe(200);
    expect(JSON.parse(creditClaimRes._getData())).toEqual({
      message: 'First play credits claimed successfully',
      newCredits: 100,
    });

    // Verify that the credit config service was called
    expect(creditConfigService.creditConfigService.getConfig).toHaveBeenCalledWith('first-play-free');

    // Verify that the user credits were updated
    expect(userService.UserService.updateUserCredits).toHaveBeenCalledWith(
      mockWalletAddress,
      100,
      true
    );
  });

  it('should handle invalid wallet address during registration', async () => {
    const mockToken = 'valid-jwt-token';

    const registrationReq = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        walletAddress: 'invalid-address',
      },
    });

    const registrationRes = createMocks();

    await userApiHandler(registrationReq as any, registrationRes as any);

    expect(registrationRes._getStatusCode()).toBe(400);
    expect(JSON.parse(registrationRes._getData())).toEqual({
      error: 'Invalid wallet address format',
    });
  });

  it('should handle duplicate user registration', async () => {
    const mockWalletAddress = '0x1234567890123456789012345678901234567890';
    const mockParticleUserId = 'user123';
    const mockToken = 'valid-jwt-token';

    // Mock the particle auth verification
    (particleAuth.verifyParticleToken as jest.Mock).mockResolvedValue(mockParticleUserId);

    // Mock user service to return existing user
    (userService.UserService.getUserByWalletAddress as jest.Mock).mockResolvedValue({
      walletAddress: mockWalletAddress,
      credits: 50,
      claimedFirstPlayCredits: false,
    });

    const registrationReq = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        walletAddress: mockWalletAddress,
      },
    });

    const registrationRes = createMocks();

    await userApiHandler(registrationReq as any, registrationRes as any);

    expect(registrationRes._getStatusCode()).toBe(200);
    expect(JSON.parse(registrationRes._getData())).toEqual({
      user: expect.objectContaining({
        walletAddress: mockWalletAddress,
        credits: 50,
      }),
      message: 'User already exists',
    });
  });
});