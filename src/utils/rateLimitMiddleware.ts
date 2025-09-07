import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { logSecurityEvent } from "./securityAudit";

// Standard rate limiter
const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per 1 minute
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after a minute.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use a combination of IP and user agent for more granular rate limiting
    return (req.ip || req.socket.remoteAddress || 'unknown') + req.headers['user-agent'];
  },
  handler: (req, res) => {
    // Log rate limit exceeded event
    logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      endpoint: req.url,
      details: 'Standard rate limit exceeded'
    });
    
    res
      .status(429)
      .json({
        success: false,
        error: "Too many requests, please try again later.",
      });
  },
});

// Slow down middleware to add delay when approaching rate limit
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 15, // Allow 15 requests per window, then start slowing down
  delayMs: 200, // Add 200ms of delay per request above delayAfter
  keyGenerator: (req) => {
    // Use a combination of IP and user agent for more granular speed limiting
    return (req.ip || req.socket.remoteAddress || 'unknown') + req.headers['user-agent'];
  },
});

// Enhanced rate limiter for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 requests per 15 minutes for sensitive operations
  message: {
    success: false,
    error: "Too many requests to this sensitive endpoint. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  keyGenerator: (req) => {
    // For sensitive operations, use more specific identification
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7); // Use token as key
    }
    return (req.ip || req.socket.remoteAddress || 'unknown') + req.headers['user-agent']; // Fallback to IP + user agent
  },
  handler: (req, res) => {
    // Log rate limit exceeded event for sensitive endpoint
    logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      endpoint: req.url,
      details: 'Sensitive endpoint rate limit exceeded',
      severity: 'HIGH'
    });
    
    res
      .status(429)
      .json({
        success: false,
        error: "Too many requests to this sensitive endpoint. Please try again after 15 minutes.",
      });
  },
});

// IP-based rate limiter for brute force protection
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: {
    success: false,
    error: "Too many requests from this IP address. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown', // Use IP address only
  handler: (req, res) => {
    // Log rate limit exceeded event for IP-based limiting
    logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      endpoint: req.url,
      details: 'IP-based rate limit exceeded',
      severity: 'HIGH'
    });
    
    res
      .status(429)
      .json({
        success: false,
        error: "Too many requests from this IP address. Please try again after 15 minutes.",
      });
  },
});

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply IP-based rate limiting first
    await new Promise<void>((resolve, reject) => {
      ipLimiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    }).catch((error) => {
      console.error("IP rate limit middleware error:", error);
      return; // Exit the handler as response is already sent
    });

    if (res.headersSent) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      standardLimiter(req, res, (result: any) => {
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

    await new Promise<void>((resolve, reject) => {
      speedLimiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    }).catch((error) => {
      console.error("Speed limit middleware error:", error);
      return; // Exit the handler as response is already sent
    });

    if (res.headersSent) {
      return;
    }

    return handler(req, res);
  };
}

export function withSensitiveRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply IP-based rate limiting first
    await new Promise<void>((resolve, reject) => {
      ipLimiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    }).catch((error) => {
      console.error("IP rate limit middleware error:", error);
      return; // Exit the handler as response is already sent
    });

    if (res.headersSent) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      sensitiveLimiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    }).catch((error) => {
      console.error("Sensitive rate limit middleware error:", error);
      return; // Exit the handler as response is already sent
    });

    if (res.headersSent) {
      return;
    }

    return handler(req, res);
  };
}