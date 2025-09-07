// src/pages/api/pSeo/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generatePSEOContent } from "../../../services/aiAdapter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await generatePSEOContent();
      res
        .status(200)
        .json({ message: "pSEO content generation initiated successfully." });
    } catch (error) {
      console.error("Error initiating pSEO content generation:", error);
      res
        .status(500)
        .json({ message: "Failed to initiate pSEO content generation." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
