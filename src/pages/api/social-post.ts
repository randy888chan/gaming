import type { NextApiRequest, NextApiResponse } from "next";
import { withEnhancedSecurity, withRequestValidation } from "../../utils/securityMiddleware";
import { performanceMonitor, withPerformanceMonitoring } from "../../utils/performanceMonitor";
import { createSafeQuery } from "../../utils/databaseSecurity";

interface SocialPosterPayload {
  contentId: string;
  platforms: ("twitter" | "facebook")[];
  scheduleAt: string; // ISO 8601 string
}

// Helper function to validate content ID
function isValidContentId(contentId: string): boolean {
  return typeof contentId === 'string' && contentId.length > 0 && contentId.length <= 100;
}

// Helper function to validate platforms array
function isValidPlatforms(platforms: any): platforms is ("twitter" | "facebook")[] {
  if (!Array.isArray(platforms)) return false;
  return platforms.every(platform => platform === "twitter" || platform === "facebook");
}

// Helper function to validate ISO 8601 date string
function isValidISODate(dateString: string): boolean {
  if (typeof dateString !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(dateString) && !isNaN(Date.parse(dateString));
}

// Helper function to sanitize content ID to prevent injection attacks
function sanitizeContentId(contentId: string): string {
  // Remove any potentially dangerous characters
  return contentId.replace(/[^a-zA-Z0-9\-_]/g, '');
}

// Request validator
const socialPostValidator = (req: NextApiRequest) => {
  const { contentId, platforms, scheduleAt }: SocialPosterPayload = req.body;

  // Validate contentId
  if (!contentId || !isValidContentId(contentId)) {
    return { isValid: false, errors: ["Missing or invalid contentId"] };
  }

  // Validate platforms
  if (!platforms || !isValidPlatforms(platforms)) {
    return { isValid: false, errors: ["Missing or invalid platforms"] };
  }

  // Validate scheduleAt
  if (!scheduleAt || !isValidISODate(scheduleAt)) {
    return { isValid: false, errors: ["Missing or invalid scheduleAt"] };
  }

  // Additional security: Check if scheduleAt is not too far in the future
  const scheduleTime = new Date(scheduleAt).getTime();
  const maxFutureTime = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days in the future
  if (scheduleTime > maxFutureTime) {
    return { isValid: false, errors: ["scheduleAt cannot be more than 30 days in the future"] };
  }

  return { isValid: true };
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { contentId, platforms, scheduleAt }: SocialPosterPayload = req.body;

    // Validate contentId
    if (!contentId || !isValidContentId(contentId)) {
      return res
        .status(400)
        .json({ success: false, error: "Missing or invalid contentId." });
    }

    // Sanitize contentId
    const sanitizedContentId = sanitizeContentId(contentId);

    // Validate platforms
    if (!platforms || !isValidPlatforms(platforms)) {
      return res
        .status(400)
        .json({ success: false, error: "Missing or invalid platforms." });
    }

    // Validate scheduleAt
    if (!scheduleAt || !isValidISODate(scheduleAt)) {
      return res
        .status(400)
        .json({ success: false, error: "Missing or invalid scheduleAt." });
    }

    // Additional security: Check if scheduleAt is not too far in the future
    const scheduleTime = new Date(scheduleAt).getTime();
    const maxFutureTime = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days in the future
    if (scheduleTime > maxFutureTime) {
      return res
        .status(400)
        .json({ success: false, error: "scheduleAt cannot be more than 30 days in the future." });
    }

    console.log(`Received social post request for contentId: ${sanitizedContentId}`);
    console.log(`Platforms: ${platforms.join(", ")}`);
    console.log(`Scheduled At: ${scheduleAt}`);

    // In a real application, you would:
    // 1. Fetch content from D1 using contentId
    // 2. Use external APIs (e.g., Twitter API v2, Facebook Graph API) to post content
    // 3. Handle scheduling if 'scheduleAt' is in the future (e.g., with a cron job or message queue)

    // Simulate successful posting
    const postedTo: string[] = [];
    if (platforms.includes("twitter")) {
      console.log(`Simulating post to Twitter for contentId: ${sanitizedContentId}`);
      postedTo.push("twitter");
    }
    if (platforms.includes("facebook")) {
      console.log(`Simulating post to Facebook for contentId: ${sanitizedContentId}`);
      postedTo.push("facebook");
    }

    // Add security headers
    res.setHeader('Cache-Control', 'no-store');
    
    return res.status(200).json({ success: true, postedTo });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Apply enhanced security and performance monitoring
export default withPerformanceMonitoring(
  withRequestValidation(socialPostValidator)(
    withEnhancedSecurity(handler)
  )
);