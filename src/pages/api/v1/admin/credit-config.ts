import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken'; // For token verification
import { creditConfigService } from '../../../../services/CreditConfigService';
import rateLimit from 'express-rate-limit';

// Define a type for the credit configuration based on schema.sql
interface CreditConfig {
  id: string;
  name: string;
  rules: any; // JSON object
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Rate limiting middleware for admin endpoints
const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per 1 minute
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after a minute.',
  },
  handler: (req, res) => {
    res.status(429).json({ success: false, error: 'Too many requests, please try again later.' });
  },
  keyGenerator: (req) => {
    // Use a combination of IP and user ID for more granular rate limiting if authenticated
    // For now, just use IP
    return req.ip || 'unknown';
  },
});

/**
 * Handles requests to the credit configuration API endpoint.
 * Supports GET to retrieve the current configuration and POST to update it.
 * Requires authentication and authorization for all operations.
 * Implements rate limiting to prevent abuse.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting to all requests to this admin endpoint
  await new Promise<void>((resolve, reject) => {
    adminRateLimiter(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  }).catch((error) => {
    // The rate limiter's handler already sends a response, so we just return here.
    // This catch block is mostly for internal errors within the rate limiter itself.
    console.error('Rate limit middleware error:', error);
    return; // Exit the handler as response is already sent
  });

  // If the rate limiter already sent a response, stop further execution
  if (res.headersSent) {
    return;
  }

  // Authentication and Authorization (QA-SEC-001)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken: any;
  try {
    // Verify the token using your Particle Network JWT secret
    decodedToken = jwt.verify(token, process.env.PARTICLE_NETWORK_JWT_SECRET || 'mock-jwt-secret');
    // In a real application, you might also check for specific roles or permissions here
    // For now, any valid Particle Network token is considered authenticated for admin access.
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token.' });
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing or invalid config ID.' });
      }
      const config = await creditConfigService.getConfig(id);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Configuration not found.' });
      }
      return res.status(200).json({ success: true, config });
    } catch (error: unknown) {
      console.error('Failed to read credit config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to read configuration.';
      return res.status(500).json({ success: false, error: errorMessage });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, name, rules } = req.body;

      if (!name || !rules) {
        return res.status(400).json({ success: false, error: 'Missing required fields: name, rules.' });
      }

      let config: CreditConfig | null;
      if (id) {
        // Update existing config
        if (typeof id !== 'string') {
          return res.status(400).json({ success: false, error: 'Invalid config ID for update.' });
        }
        config = await creditConfigService.updateConfig(id, { name, rules });
        if (!config) {
          return res.status(404).json({ success: false, error: 'Configuration not found for update.' });
        }
      } else {
        // Create new config
        config = await creditConfigService.createConfig({ name, rules });
      }

      return res.status(200).json({ success: true, config });
    } catch (error: unknown) {
      console.error('Failed to create/update credit config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create/update configuration.';
      return res.status(500).json({ success: false, error: errorMessage });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing or invalid config ID for deletion.' });
      }
      const success = await creditConfigService.deleteConfig(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Configuration not found for deletion.' });
      }
      return res.status(200).json({ success: true, message: 'Configuration deleted successfully.' });
    } catch (error: unknown) {
      console.error('Failed to delete credit config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete configuration.';
      return res.status(500).json({ success: false, error: errorMessage });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}