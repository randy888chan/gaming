import type { NextApiRequest, NextApiResponse } from "next";
import { D1Database } from "@cloudflare/workers-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const db = process.env.DB as D1Database;
      // Perform a simple query to check the database connection
      await db.prepare("SELECT 1").first();
      res.status(200).json({ status: "healthy", database: "connected" });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({ status: "unhealthy", database: "disconnected", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
