import jwt from "jsonwebtoken";

/**
 * Verifies a Particle Network JWT token and extracts the user ID
 * @param token The JWT token to verify
 * @returns The particle_user_id if verification is successful
 * @throws Error if verification fails
 */
export async function verifyParticleToken(token: string): Promise<string> {
  try {
    // Verify the token using your Particle Network JWT secret
    const decoded = jwt.verify(
      token,
      process.env.PARTICLE_NETWORK_JWT_SECRET || "mock-jwt-secret"
    ) as { particle_user_id?: string; sub?: string };
    
    // Extract the particle_user_id from the decoded token
    // Particle Network typically uses 'sub' or 'particle_user_id' field
    const particleUserId = decoded.particle_user_id || decoded.sub;
    
    if (!particleUserId) {
      throw new Error("Particle user ID not found in token");
    }
    
    return particleUserId;
  } catch (error) {
    console.error("Particle token verification failed:", error);
    throw new Error("Invalid or expired Particle Network token");
  }
}