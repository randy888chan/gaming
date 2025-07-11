import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per 1 minute
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after a minute.",
  },
  handler: (req, res) => {
    res
      .status(429)
      .json({
        success: false,
        error: "Too many requests, please try again later.",
      });
  },
  keyGenerator: (req) => {
    // Use a combination of IP and user ID for more granular rate limiting if authenticated
    // For now, just use IP
    return req.ip || "unknown";
  },
});

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    }).catch((error) => {
      console.error("Rate limit middleware error:", error);
      return; // Exit the handler as response is already sent
    });

    if (res.headersSent) {
      return;
    }

    return handler(req, res);
  };
}
