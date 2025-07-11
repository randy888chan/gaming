// src/pages/api/pSeo/cron.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generatePSeoContent } from "../../../workers/pSeoGenerator";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This is a simplified example. In a real application, you'd want to secure this endpoint
  // to ensure only your scheduled job can trigger it (e.g., by checking a secret token).
  if (req.method === "POST") {
    try {
      await generatePSeoContent();
      res
        .status(200)
        .json({
          message: "Daily pSEO content generation triggered successfully.",
        });
    } catch (error) {
      console.error("Error triggering daily pSEO content generation:", error);
      res
        .status(500)
        .json({ message: "Failed to trigger daily pSEO content generation." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
