import type { NextApiRequest, NextApiResponse } from "next";
import { withEnhancedSecurity, withRequestValidation } from "../../utils/securityMiddleware";
import { enhancedVerifyParticleToken, hashUserId } from "../../utils/particleAuth";
import { performanceMonitor, withPerformanceMonitoring } from "../../utils/performanceMonitor";

interface TrackSharePayload {
  contentId: string;
  eventType: "impression" | "click";
  userId?: string; // Optional, if a logged-in user is sharing
}

// Request validator
const trackShareValidator = (req: NextApiRequest) => {
  const { contentId, eventType } = req.body;
  
  if (!contentId || typeof contentId !== 'string') {
    return { isValid: false, errors: ["Missing or invalid contentId"] };
  }
  
  if (!eventType || (eventType !== "impression" && eventType !== "click")) {
    return { isValid: false, errors: ["Missing or invalid eventType"] };
  }
  
  return { isValid: true };
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { contentId, eventType }: TrackSharePayload = req.body;

    if (!contentId || !eventType) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    // Authenticate the user using Particle Network JWT token (optional for this endpoint)
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        userId = await enhancedVerifyParticleToken(
          token, 
          req.socket.remoteAddress, 
          req.headers['user-agent'] as string
        );
        
        // Log the request with a hashed user ID for security
        const hashedUserId = hashUserId(userId);
        console.log(`Track share request from user: ${hashedUserId}`);
      } catch (error) {
        // If token is invalid, we still allow the request but don't associate it with a user
        console.warn("Invalid token in track share request, proceeding without user association");
      }
    }

    console.log(
      `Received track share request for contentId: ${contentId}, eventType: ${eventType}`
    );
    if (userId) {
      console.log(`User ID: ${hashUserId(userId)}`);
    }

    // In a real application, you would:
    // 1. Connect to Cloudflare D1
    // 2. Update the 'content_metadata' table based on contentId and eventType
    //    - Increment 'impressions' for 'impression' events
    //    - Increment 'clicks' for 'click' events
    // 3. Potentially log the event for analytics
    // 4. If userId is present and this is a referral/incentive-driven share,
    //    trigger logic in the referral system (e.g., src/referral/index.ts)

    console.log(
      `Simulating database update for content_metadata (contentId: ${contentId}, eventType: ${eventType})`
    );

    // Add security headers
    res.setHeader('Cache-Control', 'no-store');
    
    return res
      .status(200)
      .json({
        success: true,
        message: `Tracked ${eventType} for ${contentId}`,
      });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Apply enhanced security and performance monitoring
export default withPerformanceMonitoring(
  withRequestValidation(trackShareValidator)(
    withEnhancedSecurity(handler)
  )
);