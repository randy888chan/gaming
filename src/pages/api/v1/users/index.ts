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
import { withRateLimit } from "../../../utils/rateLimitMiddleware"; // Use the more robust rate limiting
import { verifyParticleToken } from "../../../utils/particleAuth";

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
      const particleUserId = await verifyParticleToken(idToken);

      const DB = req.env.DB;

      const { results: userPreferences } = await DB.prepare(
        `SELECT particle_user_id, username, riskTolerance, preferredGames, notificationSettings, smartBet, lastLogin, createdAt
         FROM user_preferences
         WHERE particle_user_id = ?`
      )
        .bind(particleUserId)
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
      const particleUserId = await verifyParticleToken(idToken);
      
      const { walletAddress, action } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Validate wallet address format
      if (!isValidWalletAddress(walletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address format" });
      }

      if (action === "claim-first-play-credits") {
        try {
          // Direct database query instead of using missing UserService
          const user = await req.env.DB.prepare(
            "SELECT * FROM users WHERE walletAddress = ?"
          )
            .bind(walletAddress)
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

          await req.env.DB.prepare(
            "UPDATE users SET credits = ?, claimedFirstPlayCredits = ? WHERE walletAddress = ?"
          )
            .bind(newCredits, 1, walletAddress)
            .run();

          return res.status(200).json({ message: "First play credits claimed successfully", newCredits });
        } catch (error) {
          console.error("Error claiming first play credits:", error);
          return res.status(500).json({ error: "Failed to claim first play credits" });
        }
      } else {
        try {
          const existingUser = await req.env.DB.prepare(
            "SELECT * FROM users WHERE walletAddress = ?"
          )
            .bind(walletAddress)
            .first();

          if (existingUser) {
            return res.status(200).json({ user: existingUser, message: "User already exists" });
          }

          const newUser = await req.env.DB.prepare(
            "INSERT INTO users (walletAddress, credits) VALUES (?1, ?2) RETURNING *"
          )
            .bind(walletAddress, 0)
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
  return typeof id === 'string' && id.length > 0 && id.length < 100;
}

// This API route is protected by a robust rate limit.
export default withRateLimit(handler);