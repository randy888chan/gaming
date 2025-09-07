import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { logSecurityEvent } from "./securityAudit";

// Enhanced rate limiter with more granular control
const enhancedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes.",
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
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.url,
      details: 'Rate limit exceeded'
    });
    
    res.status(429).json({
      success: false,
      error: "Too many requests from this IP, please try again after 15 minutes.",
    });
  },
});

// Slow down middleware to add delay when approaching rate limit
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window, then start slowing down
  delayMs: 500, // Add 500ms of delay per request above delayAfter
  keyGenerator: (req) => {
    // Use a combination of IP and user agent for more granular speed limiting
    return (req.ip || req.socket.remoteAddress || 'unknown') + req.headers['user-agent'];
  },
});

// Input validation middleware
export function withInputValidation(
  validator: (body: any, query: any, params: any) => { isValid: boolean; errors?: string[] }
) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const validation = validator(req.body, req.query, req.params);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.errors
      });
    }
    
    next();
  };
}

// Security headers middleware
export function withSecurityHeaders(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:;");
    
    return handler(req, res);
  };
}

// Enhanced authentication middleware with additional security checks
export function withEnhancedAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Log authentication failure
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: 'Missing or invalid authorization header'
      });
      
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    
    // Check token format
    if (!token || token.length < 50) {
      // Log authentication failure
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: 'Invalid token format'
      });
      
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: Invalid token format." });
    }
    
    // Ensure the JWT secret is properly configured
    const jwtSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
    if (!jwtSecret) {
      // Log server configuration error
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: 'Server configuration error: JWT secret not configured'
      });
      
      return res
        .status(500)
        .json({ success: false, error: "Server configuration error: JWT secret not configured." });
    }
    
    // Additional security: Check if request is from a known suspicious IP
    const suspiciousIps = process.env.SUSPICIOUS_IPS?.split(',') || [];
    if (suspiciousIps.includes(req.ip)) {
      // Log suspicious activity
      logSecurityEvent({
        eventType: 'SUSPICIOUS_ACTIVITY',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: 'Request from suspicious IP address'
      });
      
      console.warn(`Blocked request from suspicious IP: ${req.ip}`);
      return res
        .status(403)
        .json({ success: false, error: "Access denied." });
    }

    try {
      // Import jwt dynamically to avoid issues in some environments
      const { verify } = await import("jsonwebtoken");
      
      // Verify the token using your Particle Network JWT secret
      verify(token, jwtSecret);
      // In a real application, you might also check for specific roles or permissions here
      // For now, any valid Particle Network token is considered authenticated for admin access.
    } catch (error) {
      console.error("Token verification failed:", error);
      
      // Log authentication failure
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: `Token verification failed: ${error.message}`
      });
      
      return res
        .status(401)
        .json({
          success: false,
          error: "Unauthorized: Invalid or expired token.",
        });
    }

    return handler(req, res);
  };
}

// Combined middleware for enhanced security
export function withEnhancedSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply rate limiting and speed limiting
    await new Promise<void>((resolve, reject) => {
      enhancedLimiter(req, res, (result: any) => {
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

    // Apply security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Additional security headers
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:;");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return handler(req, res);
  };
}

// Add a new middleware for request validation
export function withRequestValidation(
  validator: (req: NextApiRequest) => { isValid: boolean; errors?: string[] }
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const validation = validator(req);
      
      if (!validation.isValid) {
        // Log input validation failure
        logSecurityEvent({
          eventType: 'INPUT_VALIDATION_FAILURE',
          ipAddress: req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          endpoint: req.url,
          details: `Input validation failed: ${validation.errors?.join(', ')}`
        });
        
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors
        });
      }
      
      return handler(req, res);
    };
  };
}
