import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { logSecurityEvent } from "./securityAudit";

/**
 * Verifies a Particle Network JWT token and extracts the user ID
 * @param token The JWT token to verify
 * @returns The particle_user_id if verification is successful
 * @throws Error if verification fails
 */
export async function verifyParticleToken(token: string): Promise<string> {
  // Ensure the JWT secret is properly configured
  const jwtSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("PARTICLE_NETWORK_JWT_SECRET is not configured");
  }

  // Additional security: Check token length and format
  if (!token || token.length < 50 || token.length > 1000) {
    throw new Error("Invalid token format");
  }

  try {
    // Verify the token using your Particle Network JWT secret
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as { particle_user_id?: string; sub?: string; exp?: number; iat?: number };
    
    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error("Token has expired");
    }
    
    // Check token issuance time (should not be in the future)
    if (decoded.iat && decoded.iat > Date.now() / 1000 + 60) {
      throw new Error("Token issued in the future");
    }
    
    // Extract the particle_user_id from the decoded token
    // Particle Network typically uses 'sub' or 'particle_user_id' field
    const particleUserId = decoded.particle_user_id || decoded.sub;
    
    if (!particleUserId) {
      throw new Error("Particle user ID not found in token");
    }
    
    // Additional validation: Check if user ID format is valid
    if (!isValidParticleUserId(particleUserId)) {
      throw new Error("Invalid particle user ID format");
    }
    
    return particleUserId;
  } catch (error) {
    console.error("Particle token verification failed:", error);
    throw new Error("Invalid or expired Particle Network token");
  }
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

/**
 * Creates a hash of the user ID for additional security measures
 * @param userId The user ID to hash
 * @returns A hashed version of the user ID
 */
export function hashUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex');
}

/**
 * Enhanced token verification with additional security checks
 * @param token The JWT token to verify
 * @param ipAddress The IP address of the request (optional)
 * @param userAgent The user agent of the request (optional)
 * @returns The particle_user_id if verification is successful
 * @throws Error if verification fails
 */
export async function enhancedVerifyParticleToken(
  token: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<string> {
  try {
    const particleUserId = await verifyParticleToken(token);
    
    // Log successful authentication
    logSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      userId: hashUserId(particleUserId),
      ipAddress,
      userAgent,
      details: 'Token verification successful'
    });
    
    return particleUserId;
  } catch (error) {
    // Log authentication failure
    logSecurityEvent({
      eventType: 'AUTH_FAILURE',
      ipAddress,
      userAgent,
      details: `Token verification failed: ${error.message}`,
      severity: 'HIGH'
    });
    
    throw error;
  }
}