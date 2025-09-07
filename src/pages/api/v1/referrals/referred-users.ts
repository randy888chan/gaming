import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";
import { createSafeQuery } from "@/utils/databaseSecurity";

interface ReferredUser {
  id: string;
  username: string;
  joinDate: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // Extract user ID from the authenticated request
    // The withAuth middleware will have verified the token and added user info
    const particleUserId = (req as any).user?.particle_user_id;
    
    if (!particleUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized: User not found." });
    }

    try {
      // Mock DB for demonstration purposes - in a real implementation, this would connect to your database
      const DB = {
        prepare: (query: string) => ({
          bind: (...values: any[]) => ({
            all: async () => ({ results: [], meta: {} }),
            first: async () => null,
            run: async () => ({ meta: {} })
          })
        })
      } as any;

      // Fetch referred users from the database
      const safeQuery = createSafeQuery(
        `SELECT 
          referred_user_id as id,
          username,
          created_at as joinDate
        FROM referrals 
        WHERE referrer_id = ?
        ORDER BY created_at DESC`,
        [particleUserId]
      );

      // In a real implementation, you would use:
      // const { results } = await DB.prepare(safeQuery.query).bind(...safeQuery.params).all();
      
      // For now, we'll return mock data but with proper structure
      const mockReferredUsers: ReferredUser[] = [
        {
          id: "user1",
          username: "Alice",
          joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "user2",
          username: "Bob",
          joinDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "user3",
          username: "Charlie",
          joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      res.status(200).json({ success: true, referredUsers: mockReferredUsers });
    } catch (error) {
      console.error("Error fetching referred users:", error);
      res.status(500).json({ success: false, error: "Failed to fetch referred users." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);