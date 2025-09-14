import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
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
    const authHeader = (req as unknown as NextApiRequest).headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.PARTICLE_NETWORK_JWT_SECRET || '') as { particle_user_id?: string; sub?: string };
        const particleUserId = decoded.particle_user_id || decoded.sub;
        if (particleUserId) {
          return particleUserId;
        }
      } catch (error) {
        // Invalid token, fall back to IP + user agent
      }
    }
    return (req.ip || req.socket.remoteAddress || 'unknown') + (req.headers['user-agent'] || '');
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

const applyMiddleware = (middleware: any) => (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve, reject) => {
    middleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await applyMiddleware(ipLimiter)(req, res);
      if (res.headersSent) return;
      await applyMiddleware(standardLimiter)(req, res);
      if (res.headersSent) return;
      await applyMiddleware(speedLimiter)(req, res);
      if (res.headersSent) return;

      return handler(req, res);
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  };
}

export function withSensitiveRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await applyMiddleware(ipLimiter)(req, res);
      if (res.headersSent) return;
      await applyMiddleware(sensitiveLimiter)(req, res);
      if (res.headersSent) return;

      return handler(req, res);
    } catch (error) {
      console.error("Sensitive rate limit middleware error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  };
}
