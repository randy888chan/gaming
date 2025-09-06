import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { logSecurityEvent } from "./securityAudit";
import { hashUserId } from "./particleAuth";

export function withAuth(
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
    
    try {
      // Verify the token using your Particle Network JWT secret
      const decoded = jwt.verify(token, jwtSecret) as { particle_user_id?: string; sub?: string; exp?: number; iat?: number };
      
      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new Error("Token has expired");
      }
      
      // Check token issuance time (should not be in the future)
      if (decoded.iat && decoded.iat > Date.now() / 1000 + 60) {
        throw new Error("Token issued in the future");
      }
      
      // Extract the particle_user_id from the decoded token
      const particleUserId = decoded.particle_user_id || decoded.sub;
      
      if (!particleUserId) {
        throw new Error("Particle user ID not found in token");
      }
      
      // Additional validation: Check if user ID format is valid
      if (!isValidParticleUserId(particleUserId)) {
        throw new Error("Invalid particle user ID format");
      }
      
      // Log successful authentication with hashed user ID
      const hashedUserId = hashUserId(particleUserId);
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        userId: hashedUserId,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        details: 'Authentication successful'
      });
      
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
        details: `Token verification failed: ${error.message}`,
        severity: 'HIGH'
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

/**
 * Validates the format of a Particle Network user ID
 * @param id The user ID to validate
 * @returns True if the ID is valid, false otherwise
 */
function isValidParticleUserId(id: string): boolean {
  // Particle user IDs are typically UUIDs or alphanumeric strings
  // This is a basic validation - in production, you might want more specific checks
  return typeof id === 'string' && id.length > 0 && id.length < 100 && /^[a-zA-Z0-9-_]+$/.test(id);
}