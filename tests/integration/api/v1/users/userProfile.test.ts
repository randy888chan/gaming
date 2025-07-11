import { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../../src/pages/api/v1/users/index";
import type { D1Database } from "@cloudflare/workers-types";

interface Env extends Record<string, unknown> {
  DB: D1Database;
}

// Define mock implementation that satisfies both D1Database and Jest mock requirements
const mockD1Impl = {
  prepare: jest.fn().mockImplementation(() => mockD1Impl),
  bind: jest.fn().mockImplementation((...params) => mockD1Impl),
  all: jest.fn().mockResolvedValue({ results: [] }),
  first: jest.fn().mockResolvedValue(null),
  run: jest.fn().mockResolvedValue({ success: true }),
  batch: jest.fn().mockResolvedValue([]),
  exec: jest.fn().mockResolvedValue({ count: 0, duration: 0 }),
  withSession: jest.fn().mockReturnThis(),
  dump: jest.fn().mockResolvedValue(new ArrayBuffer(0))
};

// Create typed mock that satisfies both D1Database and Jest mock
const mockD1Database: D1Database & {
  prepare: jest.Mock;
  bind: jest.Mock;
  all: jest.Mock;
  first: jest.Mock;
  run: jest.Mock;
  batch: jest.Mock;
  exec: jest.Mock;
  withSession: jest.Mock;
  dump: jest.Mock;
} = mockD1Impl as any;

describe("User Profile API - D1 Integration", () => {
  let req: Partial<NextApiRequest & { env: { DB: D1Database } }>;
  let res: Partial<NextApiResponse>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    status = jest.fn().mockReturnThis();
    json = jest.fn();
    res = { status, json };
    req = {
      method: "GET",
      headers: {
        authorization: "Bearer mock-id-token",
      },
      env: {
        DB: mockD1Database,
        NODE_ENV: 'test'
      } as Env,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user profile if found", async () => {
    mockD1Database.all.mockResolvedValueOnce({
      results: [
        {
          user_id: "mock-user-id-from-token",
          username: "testuser",
          email: "test@example.com",
          avatar_url: "http://example.com/avatar.png",
          privacy_settings: JSON.stringify({ publicProfile: true }),
          created_at: "2023-01-01T00:00:00Z",
          last_login: "2023-07-11T00:00:00Z",
        },
      ],
    });

    await handler(req as any, res as any);

    expect(mockD1Database.prepare).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT\s+user_id,\s+username,\s+email,\s+avatar_url,\s+privacy_settings,\s+created_at,\s+last_login\s+FROM\s+user_profiles\s+WHERE\s+user_id\s+=\s+\?/
      )
    );
    expect(mockD1Database.bind).toHaveBeenCalledWith("mock-user-id-from-token");
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "mock-user-id-from-token",
        username: "testuser",
        email: "test@example.com",
        privacy_settings: { publicProfile: true },
      })
    );
  });

  it("should return 404 if user profile not found", async () => {
    mockD1Database.all.mockResolvedValueOnce({ results: [] });

    await handler(req as any, res as any);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: "User profile not found" });
  });

  it("should return 401 if no authorization token is provided", async () => {
    req.headers!.authorization = undefined;

    await handler(req as any, res as any);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      message: "Unauthorized: No token provided",
    });
  });

  it("should return 405 if method is not GET", async () => {
    req.method = "POST";

    await handler(req as any, res as any);

    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
  });

  it("should handle database errors gracefully", async () => {
    mockD1Database.all.mockRejectedValueOnce(
      new Error("Database connection error")
    );

    await handler(req as any, res as any);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  it("should parse privacy_settings even if it is not valid JSON", async () => {
    mockD1Database.all.mockResolvedValueOnce({
      results: [
        {
          user_id: "mock-user-id-from-token",
          username: "testuser",
          email: "test@example.com",
          avatar_url: "http://example.com/avatar.png",
          privacy_settings: "invalid-json", // Invalid JSON string
          created_at: "2023-01-01T00:00:00Z",
          last_login: "2023-07-11T00:00:00Z",
        },
      ],
    });

    await handler(req as any, res as any);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "mock-user-id-from-token",
        privacy_settings: {}, // Should be an empty object due to parsing error
      })
    );
  });
});
