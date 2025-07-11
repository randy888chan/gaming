// This is a placeholder for Cloudflare D1 types. In a real project, you would
// install `@cloudflare/workers-types` and configure your tsconfig.json to include them.
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    all(): Promise<{ results: any[] }>;
  }
}
import type { NextApiRequest, NextApiResponse } from "next";

// Define a type for the Cloudflare D1 database binding
interface Env {
  DB: D1Database;
}

// Extend Next.js API request to include Cloudflare Workers environment
interface D1NextApiRequest extends NextApiRequest {
  env: Env;
}

export default async function handler(
  req: D1NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // In a real Cloudflare Workers environment, you would verify the token
    // using a service like Auth0, Firebase Auth (if still using it for auth),
    // or a custom JWT verification. For this example, we'll assume the token
    // is valid and extract a mock UID.
    // const decodedToken = await verifyToken(idToken); // Placeholder for actual token verification
    const uid = "mock-user-id-from-token"; // Replace with actual UID from decoded token

    // Access Cloudflare D1 database from the environment
    const DB = req.env.DB;

    // Fetch user profile from D1
    const { results: userProfiles } = await DB.prepare(
      `SELECT user_id, username, email, avatar_url, privacy_settings, created_at, last_login
       FROM user_profiles
       WHERE user_id = ?`
    )
      .bind(uid)
      .all();

    if (userProfiles.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const userProfile = userProfiles[0];

    // Parse privacy_settings if it's a JSON string
    if (typeof userProfile.privacy_settings === "string") {
      try {
        userProfile.privacy_settings = JSON.parse(userProfile.privacy_settings);
      } catch (parseError) {
        console.error("Error parsing privacy_settings:", parseError);
        // Handle parsing error, maybe set to default or log
        userProfile.privacy_settings = {};
      }
    }

    return res.status(200).json(userProfile);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
