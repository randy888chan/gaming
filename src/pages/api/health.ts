import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // TODO: Implement actual D1 database connection check here
      const dbConnected = true; // Placeholder for database connection status

      if (dbConnected) {
        res.status(200).json({ status: "healthy", database: "connected" });
      } else {
        res.status(500).json({ status: "unhealthy", database: "disconnected" });
      }
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({ status: "unhealthy", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
