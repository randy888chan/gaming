import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken'; // For token verification
import { creditConfigService } from '../../../../services/CreditConfigService';
import { NextApiHandler } from 'next';
import { withAuth } from '../../../../utils/authMiddleware'; // Assuming this path
import { withRateLimit } from '../../../../utils/rateLimitMiddleware'; // Assuming this path

// Define a type for the credit configuration based on schema.sql
interface CreditConfig {
  id: string;
  name: string;
  rules: any; // JSON object
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}


/**
 * Handles requests to the credit configuration API endpoint.
 * Supports GET to retrieve the current configuration and POST to update it.
 * Requires authentication and authorization for all operations.
 * Implements rate limiting to prevent abuse.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Authentication and Authorization (QA-SEC-001) is handled by withAuth middleware

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const configId = typeof id === 'string' ? id : 'default-credit-config'; // Use default if not provided
      
      const config = await creditConfigService.getConfig(configId);
      if (!config) {
        // If no config found, return a default empty config for the frontend to initialize
        return res.status(200).json({
          success: true,
          config: {
            id: configId,
            name: 'Default Credit Configuration',
            rules: {
              enabled: false,
              amount: 0,
              chains: [],
              treasuryWallet: '',
              kmsProvider: '',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
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
  } else if (req.method === 'PUT') { // Add PUT method for updates
    try {
      const { id, name, rules } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing or invalid config ID for update.' });
      }
      if (!name || !rules) {
        return res.status(400).json({ success: false, error: 'Missing required fields: name, rules.' });
      }

      const config = await creditConfigService.updateConfig(id, { name, rules });
      if (!config) {
        return res.status(404).json({ success: false, error: 'Configuration not found for update.' });
      }

      return res.status(200).json({ success: true, config });
    } catch (error: unknown) {
      console.error('Failed to update credit config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration.';
      return res.status(500).json({ success: false, error: errorMessage });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
};

export default withRateLimit(withAuth(handler));