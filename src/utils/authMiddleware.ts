import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
      // Verify the token using your Particle Network JWT secret
      jwt.verify(
        token,
        process.env.PARTICLE_NETWORK_JWT_SECRET || "mock-jwt-secret"
      );
      // In a real application, you might also check for specific roles or permissions here
      // For now, any valid Particle Network token is considered authenticated for admin access.
    } catch (error) {
      console.error("Token verification failed:", error);
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
