/**
 * @file Smart Bet API Endpoint
 * @description This API endpoint provides smart bet suggestions using the AI service adapter.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getSmartBetSuggestion } from "../../services/aiAdapter";
import { withEnhancedSecurity, withSensitiveRateLimit, withRequestValidation } from "../../utils/securityMiddleware";
import { enhancedVerifyParticleToken, hashUserId } from "../../utils/particleAuth";
import { performanceMonitor, withPerformanceMonitoring } from "../../utils/performanceMonitor";
import { createSafeQuery } from "../../utils/databaseSecurity";

/**
 * Validates the marketId parameter
 * @param marketId The marketId to validate
 * @returns True if valid, false otherwise
 */
function isValidMarketId(marketId: string): boolean {
  // Market IDs should be alphanumeric with possible dashes/underscores, and reasonable length
  return typeof marketId === 'string' && 
         marketId.length > 0 && 
         marketId.length <= 100 && 
         /^[a-zA-Z0-9\-_]+$/.test(marketId);
}

// Request validator
const smartBetValidator = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isValid: false, errors: ["Missing or invalid authorization header"] };
  }
  
  const { marketId } = req.query;
  
  if (!marketId || typeof marketId !== "string" || !isValidMarketId(marketId)) {
    return { isValid: false, errors: ["Missing or invalid marketId"] };
  }
  
  return { isValid: true };
};

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
    userId = await enhancedVerifyParticleToken(
      token, 
      req.socket.remoteAddress, 
      req.headers['user-agent'] as string
    );
    
    // Log the request with a hashed user ID for security
    const hashedUserId = hashUserId(userId);
    console.log(`Smart bet request from user: ${hashedUserId}`);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const { marketId } = req.query;

  // Validate marketId
  if (!marketId || typeof marketId !== "string" || !isValidMarketId(marketId)) {
    return res.status(400).json({ message: "Missing or invalid marketId" });
  }

  try {
    // Add a timeout to prevent hanging requests
    const suggestionPromise = getSmartBetSuggestion(marketId, userId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
    );
    
    const suggestion = await Promise.race([suggestionPromise, timeoutPromise]) as any;

    if (suggestion) {
      // Add security headers to prevent caching of sensitive data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).json(suggestion);
    } else {
      return res
        .status(404)
        .json({ message: "No smart bet suggestion found for this market." });
    }
  } catch (error: any) {
    console.error("Error in Smart Bet API:", error);
    
    // Differentiate between timeout and other errors
    if (error.message === 'Request timeout') {
      return res.status(408).json({ message: "Request timeout" });
    }
    
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Apply enhanced security and performance monitoring
export default withPerformanceMonitoring(
  withRequestValidation(smartBetValidator)(
    withEnhancedSecurity(withSensitiveRateLimit(handler))
  )
);