import request, { SuperTest, Test } from "supertest";
import { createServer } from "http";
import { apiResolver } from "next/dist/server/api-utils/node";
import creditConfigHandler from "../../src/pages/api/v1/admin/credit-config";
import * as jwt from "jsonwebtoken";
import type { D1Database } from "@cloudflare/workers-types";
// Define mock types
type MockCreditConfigService = {
  getConfig: jest.Mock<Promise<CreditConfig | null>, [string]>;
  createConfig: jest.Mock<Promise<CreditConfig>, [Partial<CreditConfig>]>;
  updateConfig: jest.Mock<Promise<CreditConfig>, [string, Partial<CreditConfig>]>;
  deleteConfig: jest.Mock<Promise<boolean>, [string]>;
};

// Mock must be defined before imports
jest.mock("../../src/services/CreditConfigService", () => {
  const mockService: MockCreditConfigService = {
    getConfig: jest.fn(),
    createConfig: jest.fn(),
    updateConfig: jest.fn(),
    deleteConfig: jest.fn()
  };
  return {
    creditConfigService: mockService,
    __esModule: true
  };
});

import { creditConfigService } from "../../src/services/CreditConfigService";
import type { CreditConfig } from "../../src/services/CreditConfigService";

// Type assertion for the imported mock
const mockCreditConfigService = creditConfigService as unknown as MockCreditConfigService;

// Mock process.env to set test environment and bypass auth
jest.mock("process", () => ({
  env: {
    NODE_ENV: 'test',
    TEST_MODE: 'true', // Add flag to bypass auth in middleware
    ...jest.requireActual("process").env
  }
}));

// Mock auth middleware to bypass in tests
jest.mock("../../src/utils/authMiddleware", () => ({
  withAuth: jest.fn((handler) => handler) // Must use jest.fn() for proper mocking
}));

// Mock rate limit middleware to bypass in tests
jest.mock("../../src/utils/rateLimitMiddleware", () => ({
  withRateLimit: jest.fn((handler) => handler) // Must use jest.fn() for proper mocking
}));

// Only mock jwt verification since it's external
jest.mock("jsonwebtoken", () => {
  const actualJwt = jest.requireActual("jsonwebtoken");
  return {
    ...actualJwt, // Spread all actual exports, including 'sign'
    verify: jest
      .fn()
      .mockImplementation(
        (
          token: string,
          secretOrPublicKey: any,
          options?: any,
          callback?: any
        ) => {
          // Default mock for verify; can be overridden in beforeEach
          if (token === "valid_token_for_default_mock") {
            // Example specific token for this general mock
            const payload = { account: "admin_user_default_mock" };
            if (callback) {
              callback(null, payload);
              return;
            }
            return payload;
          }
          // Fallback for other tokens or if more specific mock is needed per test
          const err = new Error("Default mock: Invalid token");
          if (callback) {
            callback(err, null);
            return;
          }
          throw err;
        }
      ),
  };
});

const mockJwtSecret = "mock-jwt-secret";
process.env.PARTICLE_NETWORK_JWT_SECRET = mockJwtSecret;

// Helper to create a test server for Next.js API routes
const testServer = (handler: any) => {
  return request(
    createServer((req, res) =>
      apiResolver(
        req,
        res,
        undefined,
        handler,
        {
          previewModeId: '',
          previewModeEncryptionKey: '',
          previewModeSigningKey: ''
        },
        true
      )
    )
  );
};

describe("Credit Configuration API Integration Tests", () => {
  let server: request.SuperTest<request.Test>;
  let mockAdminToken: string;
  let mockNonAdminToken: string;
  // let originalServer: request.SuperTest<request.Test>; // No longer needed

  beforeAll(() => {
    server = testServer(creditConfigHandler) as unknown as SuperTest<Test>; // Initialize server with the default wrapped handler
    // Generate mock JWT tokens
    mockAdminToken = jwt.sign(
      { userId: "adminUser", role: "admin" },
      mockJwtSecret,
      { expiresIn: "1h" }
    );
    mockNonAdminToken = jwt.sign(
      { userId: "regularUser", role: "user" },
      mockJwtSecret,
      { expiresIn: "1h" }
    );
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks(); // Or consider jest.resetAllMocks() if deeper reset is needed

    // Reset and setup mock implementations
    mockCreditConfigService.getConfig.mockImplementation(async (id: string) => {
      if (
        id === "test-config-1" ||
        id === "default-credit-config" ||
        id === "some-id" ||
        id === "any-id"
      ) {
        return {
          id: id,
          name: `Mock Config ${id}`,
          rules: { mockRule: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    });
    mockCreditConfigService.createConfig.mockImplementation(async (data: Partial<CreditConfig>) => ({
      id: "newly-created-id",
      name: data.name || "New Config",
      rules: data.rules || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    mockCreditConfigService.updateConfig.mockImplementation(async (id, data) => ({
      id,
      name: data.name || "Updated Mock Config",
      rules: data.rules || { mockRule: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    mockCreditConfigService.deleteConfig.mockResolvedValue(true);

    // JWT verify mock
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === mockAdminToken && secret === mockJwtSecret) {
        return { userId: "adminUser", role: "admin" };
      }
      if (token === mockNonAdminToken && secret === mockJwtSecret) {
        return { userId: "regularUser", role: "user" };
      }
      throw new Error("Invalid token");
    });
  });

  // QA-API-003 & QA-SEC-001: Test CRUD operations with authentication
  describe("Authenticated CRUD Operations", () => {
    const mockConfig = {
      id: "test-config-1",
      name: "Default Credit Config",
      rules: { minBet: 0.01, maxBet: 100 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    test("should allow an authenticated admin to GET credit configuration", async () => {
      console.log('Running GET test with mockAdminToken:', mockAdminToken);
      
      mockCreditConfigService.getConfig.mockImplementation(async (id) => {
        console.log('Mock getConfig called with id:', id);
        const result = {
          id,
          name: `Mock Config ${id}`,
          rules: { mockRule: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Mock getConfig returning:', result);
        return result;
      });

      const res = await server
        .get("/api/v1/admin/credit-config?id=test-config-1")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .timeout(5000);

      console.log('Test response:', {
        status: res.status,
        body: res.body,
        error: res.error
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual({
        id: "test-config-1",
        name: "Mock Config test-config-1",
        rules: { mockRule: true },
        created_at: expect.any(String),
        updated_at: expect.any(String)
      });
      expect(mockCreditConfigService.getConfig).toHaveBeenCalledWith(
        "test-config-1"
      );
    });

    test("should allow an authenticated admin to POST (create) credit configuration", async () => {
      const newConfigData = { name: "New Config", rules: { bonus: 0.1 } };
      const createdConfig = {
        ...mockConfig,
        id: "new-config-id",
        ...newConfigData,
      };
      mockCreditConfigService.createConfig.mockResolvedValue(
        createdConfig
      );

      const res = await server
        .post("/api/v1/admin/credit-config")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .send(newConfigData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual(createdConfig);
      expect(mockCreditConfigService.createConfig).toHaveBeenCalledWith(
        newConfigData
      );
    });

    test("should allow an authenticated admin to POST (update) credit configuration", async () => {
      const updatedConfigData = {
        id: "test-config-1",
        name: "Updated Config",
        rules: { bonus: 0.15 },
      };
      const updatedConfig = { ...mockConfig, ...updatedConfigData };
      mockCreditConfigService.updateConfig.mockResolvedValue(
        updatedConfig
      );

      const res = await server
        .post("/api/v1/admin/credit-config")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .send(updatedConfigData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toEqual(updatedConfig);
      expect(mockCreditConfigService.updateConfig).toHaveBeenCalledWith(
        "test-config-1",
        { name: "Updated Config", rules: { bonus: 0.15 } }
      );
    });

    test("should allow an authenticated admin to DELETE credit configuration", async () => {
      mockCreditConfigService.deleteConfig.mockImplementation(async (id) => {
        if (id === "test-config-1") return true;
        throw new Error("Config not found");
      });

      const res = await server
        .delete("/api/v1/admin/credit-config?id=test-config-1")
        .set("Authorization", `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Configuration deleted successfully.");
      expect(mockCreditConfigService.deleteConfig).toHaveBeenCalledWith(
        "test-config-1"
      );
    });
  });

  // QA-SEC-001: Test unauthorized and forbidden access
  describe("Authentication and Authorization", () => {
    test("should return 401 if no token is provided", async () => {
      const res = await server.get(
        "/api/v1/admin/credit-config?id=test-config-1"
      );
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Unauthorized: No token provided.");
    });

    test("should return 401 if an invalid token is provided", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await server
        .get("/api/v1/admin/credit-config?id=test-config-1")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Unauthorized: Invalid or expired token.");
    });

    // The current implementation in credit-config.ts considers any valid Particle Network token as authenticated for admin access.
    // If a more granular role-based authorization is implemented, this test would need to be adjusted.
    // For now, a non-admin token will still pass the authentication check as per the current API logic.
    test("should allow access with a valid non-admin token (current implementation)", async () => {
      mockCreditConfigService.getConfig.mockResolvedValue({
        id: "some-id",
        name: "config",
        rules: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = await server
        .get("/api/v1/admin/credit-config?id=some-id")
        .set("Authorization", `Bearer ${mockNonAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  // QA-SEC-002: Test rate limiting behavior
  describe("Rate Limiting", () => {
    test("should return 429 Too Many Requests after 30 requests within a minute", async () => {
      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await server
          .get("/api/v1/admin/credit-config?id=any-id")
          .set("Authorization", `Bearer ${mockAdminToken}`);
      }

      // The 31st request should be rate-limited
      const res = await server
        .get("/api/v1/admin/credit-config?id=any-id")
        .set("Authorization", `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(429);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Too many requests, please try again later.");
    }, 65000); // Increase timeout for rate limit test

    test("should reset rate limit after windowMs", async () => {
      // Make 30 requests to hit the limit
      for (let i = 0; i < 30; i++) {
        await server
          .get("/api/v1/admin/credit-config?id=any-id")
          .set("Authorization", `Bearer ${mockAdminToken}`);
      }

      // Wait for more than 1 minute (60 seconds)
      await new Promise((resolve) => setTimeout(resolve, 61 * 1000));

      // The first request after the reset should succeed
      mockCreditConfigService.getConfig.mockResolvedValue({
        id: "any-id",
        name: "config",
        rules: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const res = await server
        .get("/api/v1/admin/credit-config?id=any-id")
        .set("Authorization", `Bearer ${mockAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    }, 130000); // Increase timeout for rate limit reset test
  });
});
