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
import { creditConfigService } from "../../services/CreditConfigService";
import { userService } from "../../services/UserService";
import { rateLimitMiddleware } from "../../lib/rateLimit";

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
      const particleUserId = "mock-particle-user-id-from-token";

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
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    const { walletAddress, action } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    if (action === "claim-first-play-credits") {
      try {
        const user = await userService.getUserByWalletAddress(req.env.DB, walletAddress);

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
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// This API route is protected by a basic server-side rate limit.
// For production deployments, it is highly recommended to leverage
// Cloudflare's robust rate limiting features for enhanced security and performance.
export default rateLimitMiddleware(5, 10 * 1000)(handler);
