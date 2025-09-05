import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface ReferralStats {
  referredCount: number;
  totalEarned: number;
  unpaidBalance: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // In a real implementation, you would fetch referral stats from the database
    // For now, we'll return mock data
    const mockStats: ReferralStats = {
      referredCount: 5,
      totalEarned: 25.50,
      unpaidBalance: 12.75,
    };
    
    return res.status(200).json({ success: true, stats: mockStats });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);