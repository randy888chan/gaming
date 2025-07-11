/**
 * @file Smart Bet API Endpoint
 * @description This API endpoint provides smart bet suggestions using the AI service adapter.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getSmartBetSuggestion } from "../../services/aiAdapter";

/**
 * Handles requests to the Smart Bet API endpoint.
 * @param req The NextApiRequest object.
 * @param res The NextApiResponse object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { marketId, userId } = req.query;

  if (!marketId || typeof marketId !== "string") {
    return res.status(400).json({ message: "Missing or invalid marketId" });
  }

  // In a real application, userId would likely come from an authenticated session
  // For this example, we'll allow it as a query parameter for simplicity
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Missing or invalid userId" });
  }

  try {
    const suggestion = await getSmartBetSuggestion(marketId, userId);

    if (suggestion) {
      return res.status(200).json(suggestion);
    } else {
      return res
        .status(404)
        .json({ message: "No smart bet suggestion found for this market." });
    }
  } catch (error) {
    console.error("Error in Smart Bet API:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
