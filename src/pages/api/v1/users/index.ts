// This is a placeholder for Cloudflare D1 types. In a real project, you would
// install `@cloudflare/workers-types` and configure your tsconfig.json to include them.
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    all(): Promise<{ results: any[]; meta: any }>;
    run(): Promise<{ meta: any }>;
    first<T = any>(colName?: string): Promise<T | null>;
  }
}
import type { NextApiRequest, NextApiResponse } from "next";
import { creditConfigService } from "../../../services/CreditConfigService";
import { withEnhancedSecurity, withSensitiveRateLimit, withRequestValidation } from "../../../utils/securityMiddleware";
import { enhancedVerifyParticleToken, hashUserId } from "../../../utils/particleAuth";
import { performanceMonitor, withPerformanceMonitoring } from "../../../utils/performanceMonitor";
import { createSafeQuery } from "../../../utils/databaseSecurity";

// Define a type for the Cloudflare D1 database binding
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    all(): Promise<{ results: any[]; meta: any }>;
    run(): Promise<{ meta: any }>;
    first<T = any>(colName?: string): Promise<T | null>;
  }
}

interface Env {
  DB: D1Database;
  [key: string]: any; // Add index signature to allow other properties
}

interface D1NextApiRequest extends NextApiRequest {
  env: Env;
}

// Helper function to validate wallet address format
function isValidWalletAddress(address: string): boolean {
  // Check for valid Ethereum address format
  if (address.startsWith("0x") && address.length === 42) {
    // Basic hex check
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  // Check for valid Solana address format (Base58)
  if (address.length >= 32 && address.length <= 44) {
    // Basic Base58 check
    return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
  }
  return false;
}

// Helper function to validate particle user ID format
function isValidParticleUserId(id: string): boolean {
  // Particle user IDs are typically UUIDs or alphanumeric strings
  return typeof id === 'string' && id.length > 0 && id.length < 100 && /^[a-zA-Z0-9-_]+$/.test(id);
}

// Helper function to sanitize wallet address
function sanitizeWalletAddress(address: string): string {
  // Remove any whitespace
  return address.trim();
}

// Request validator for GET requests
const getUserValidator = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isValid: false, errors: ["Missing or invalid authorization header"] };
  }
  return { isValid: true };
};

// Request validator for POST requests
const createUserValidator = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isValid: false, errors: ["Missing or invalid authorization header"] };
  }
  
  const { walletAddress, action } = req.body;
  
  if (!walletAddress) {
    return { isValid: false, errors: ["Wallet address is required"] };
  }
  
  const sanitizedWalletAddress = sanitizeWalletAddress(walletAddress);
  if (!isValidWalletAddress(sanitizedWalletAddress)) {
    return { isValid: false, errors: ["Invalid wallet address format"] };
  }
  
  if (action && action !== "claim-first-play-credits") {
    return { isValid: false, errors: ["Invalid action"] };
  }
  
  return { isValid: true };
};

const handler = async (
  req: D1NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    try {
      // Replace mock authentication with actual Particle Network token verification
      const particleUserId = await enhancedVerifyParticleToken(
        idToken, 
        req.socket.remoteAddress, 
        req.headers['user-agent'] as string
      );
      
      // Log with hashed user ID for security
      const hashedUserId = hashUserId(particleUserId);
      console.log(`User profile request from: ${hashedUserId}`);

      const DB = req.env.DB;

      // Use safe query construction
      const safeQuery = createSafeQuery(
        `SELECT particle_user_id, username, riskTolerance, preferredGames, notificationSettings, smartBet, lastLogin, createdAt
         FROM user_preferences
         WHERE particle_user_id = ?`,
        [particleUserId]
      );

      const { results: userPreferences } = await DB.prepare(safeQuery.query)
        .bind(...safeQuery.params)
        .all();

      if (userPreferences.length === 0) {
        return res.status(404).json({ message: "User preferences not found" });
      }

      const userProfile = userPreferences[0];

      if (typeof userProfile.preferredGames === "string") {
        try {
          userProfile.preferredGames = JSON.parse(userProfile.preferredGames);
        } catch (parseError) {
          console.error("Error parsing preferredGames:", parseError);
          userProfile.preferredGames = [];
        }
      }
      if (typeof userProfile.notificationSettings === "string") {
        try {
          userProfile.notificationSettings = JSON.parse(userProfile.notificationSettings);
        } catch (parseError) {
          console.error("Error parsing notificationSettings:", parseError);
          userProfile.notificationSettings = {};
        }
      }

      // Add security headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).json(userProfile);
    } catch (error: any) {
      console.error("Error fetching user preferences:", error);
      return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
  } else if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    try {
      // Verify the Particle Network token before processing the request
      const particleUserId = await enhancedVerifyParticleToken(
        idToken, 
        req.socket.remoteAddress, 
        req.headers['user-agent'] as string
      );
      
      const { walletAddress, action } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Sanitize and validate wallet address format
      const sanitizedWalletAddress = sanitizeWalletAddress(walletAddress);
      if (!isValidWalletAddress(sanitizedWalletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address format" });
      }

      // Log with hashed user ID for security
      const hashedUserId = hashUserId(particleUserId);
      console.log(`User action request from: ${hashedUserId}, action: ${action}`);

      if (action === "claim-first-play-credits") {
        try {
          // Use safe query construction
          const userQuery = createSafeQuery(
            "SELECT * FROM users WHERE walletAddress = ?",
            [sanitizedWalletAddress]
          );
          
          // Direct database query instead of using missing UserService
          const user = await req.env.DB.prepare(userQuery.query)
            .bind(...userQuery.params)
            .first();

          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }

          if (user.claimedFirstPlayCredits) {
            return res.status(200).json({ message: "First play credits already claimed" });
          }

          const firstPlayConfig = await creditConfigService.getConfig("first-play-free");

          if (!firstPlayConfig || typeof firstPlayConfig.rules.amount !== 'number') {
            return res.status(500).json({ error: "First play credit configuration not found or invalid" });
          }

          const newCredits = user.credits + firstPlayConfig.rules.amount;

          // Use safe query construction
          const updateQuery = createSafeQuery(
            "UPDATE users SET credits = ?, claimedFirstPlayCredits = ? WHERE walletAddress = ?",
            [newCredits, 1, sanitizedWalletAddress]
          );

          await req.env.DB.prepare(updateQuery.query)
            .bind(...updateQuery.params)
            .run();

          return res.status(200).json({ message: "First play credits claimed successfully", newCredits });
        } catch (error) {
          console.error("Error claiming first play credits:", error);
          return res.status(500).json({ error: "Failed to claim first play credits" });
        }
      } else {
        try {
          // Use safe query construction
          const existingUserQuery = createSafeQuery(
            "SELECT * FROM users WHERE walletAddress = ?",
            [sanitizedWalletAddress]
          );
          
          const existingUser = await req.env.DB.prepare(existingUserQuery.query)
            .bind(...existingUserQuery.params)
            .first();

          if (existingUser) {
            return res.status(200).json({ user: existingUser, message: "User already exists" });
          }

          // Use safe query construction
          const insertQuery = createSafeQuery(
            "INSERT INTO users (walletAddress, credits) VALUES (?1, ?2) RETURNING *",
            [sanitizedWalletAddress, 0]
          );

          const newUser = await req.env.DB.prepare(insertQuery.query)
            .bind(...insertQuery.params)
            .first();

          return res.status(200).json({ user: newUser, message: "User created successfully" });
        } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({ error: "Failed to create user" });
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      return res.status(401).json({ error: "Unauthorized: " + error.message });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// Apply enhanced security and performance monitoring
// Use sensitive rate limiting for user endpoints as they involve database operations
export default withPerformanceMonitoring(
  withRequestValidation(createUserValidator)(
    withRequestValidation(getUserValidator)(
      withEnhancedSecurity(withSensitiveRateLimit(handler))
    )
  )
);