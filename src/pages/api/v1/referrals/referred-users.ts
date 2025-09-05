import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface ReferredUser {
  id: string;
  username: string;
  joinDate: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // In a real implementation, you would fetch referred users from the database
    // For now, we'll return mock data
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
    
    return res.status(200).json({ success: true, referredUsers: mockReferredUsers });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);