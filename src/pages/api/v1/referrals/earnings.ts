import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface EarningsData {
  totalEarned: number;
  unpaidBalance: number;
  lastUpdated: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // In a real implementation, you would fetch earnings data from the database
    // For now, we'll return mock data
    const mockEarnings: EarningsData = {
      totalEarned: 25.50,
      unpaidBalance: 12.75,
      lastUpdated: new Date().toISOString(),
    };
    
    return res.status(200).json({ success: true, earnings: mockEarnings });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);