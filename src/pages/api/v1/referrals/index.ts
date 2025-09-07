import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";
import { createSafeQuery } from "@/utils/databaseSecurity";

interface ReferralStats {
  referredCount: number;
  totalEarned: number;
  unpaidBalance: number;
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

      // Fetch referral stats from the database
      const safeQuery = createSafeQuery(
        `SELECT 
          COUNT(*) as referredCount,
          COALESCE(SUM(total_earned), 0) as totalEarned,
          COALESCE(SUM(unpaid_balance), 0) as unpaidBalance
        FROM referrals 
        WHERE referrer_id = ?`,
        [particleUserId]
      );

      // In a real implementation, you would use:
      // const { results } = await DB.prepare(safeQuery.query).bind(...safeQuery.params).all();
      
      // For now, we'll return mock data but with proper structure
      const mockStats: ReferralStats = {
        referredCount: 5,
        totalEarned: 25.50,
        unpaidBalance: 12.75,
      };
      
      res.status(200).json({ success: true, stats: mockStats });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch referral stats." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);