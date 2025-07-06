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
import type { NextApiRequest, NextApiResponse } from 'next';

interface Env {
  DB: D1Database;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // In a real Cloudflare Workers environment, you would verify the token
    // using a service like Auth0, Firebase Auth (if still using it for auth),
    // or a custom JWT verification. For this example, we'll assume the token
    // is valid and extract a mock UID.
    // const decodedToken = await verifyToken(idToken); // Placeholder for actual token verification
    const uid = 'mock-user-id-from-token'; // Replace with actual UID from decoded token

    // Access Cloudflare D1 database
    // This assumes `req.env.DB` is available, which is typical in a Cloudflare Pages/Workers setup.
    // For Next.js API routes, you might need to pass the D1 binding differently,
    // e.g., via a global object or a custom server setup.
    // For demonstration, we'll use a placeholder for DB access.
    const DB = (process.env as any).DB as D1Database; // This is a simplification for local dev/testing

    // Fetch user preferences from D1
    const { results: userPreferences } = await DB.prepare(
      `SELECT walletAddress, riskTolerance, preferredGames, notificationSettings, hasClaimedFirstPlay, referralCredits, smartBet, lastLogin
       FROM user_preferences
       WHERE walletAddress = ?`
    ).bind(uid).all();

    const userProfile = {
      walletAddress: userPreferences[0]?.walletAddress || 'N/A',
      recentActivity: {
        tournamentsPlayed: 5, // Mock data for now, would query a 'user_activity' table in D1
      },
    };

    return res.status(200).json(userProfile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}