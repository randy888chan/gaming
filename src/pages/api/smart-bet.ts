/**
 * @file Smart Bet API Endpoint
 * @description This API endpoint provides smart bet suggestions using the AI service adapter.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getSmartBetSuggestion } from "../../services/aiAdapter";
import { withRateLimit } from "../../utils/rateLimitMiddleware";
import { verifyParticleToken } from "../../utils/particleAuth";

/**
 * Handles requests to the Smart Bet API endpoint.
 * @param req The NextApiRequest object.
 * @param res The NextApiResponse object.
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Authenticate the user using Particle Network JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  let userId: string;
  try {
    userId = await verifyParticleToken(token);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const { marketId } = req.query;

  // Validate marketId
  if (!marketId || typeof marketId !== "string" || marketId.length > 100) {
    return res.status(400).json({ message: "Missing or invalid marketId" });
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

export default withRateLimit(handler);