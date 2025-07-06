import type { NextApiRequest, NextApiResponse } from 'next';
import { D1Database } from '@cloudflare/workers-types';
import jwt from 'jsonwebtoken';
import { creditConfigService } from '@/services/CreditConfigService';

interface MockD1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: (colName?: string) => Promise<any | null>;
      run: () => Promise<{ success: boolean; changes: number }>;
    };
  };
}

// Mock D1 Database for local development/testing
const mockD1: MockD1Database = {
  prepare: (query: string) => ({
    bind: (...args: any[]) => ({
      first: async (colName?: string) => {
        if (query.includes('SELECT * FROM user_preferences WHERE walletAddress = ?')) {
          const [walletAddress] = args;
          if (walletAddress === 'mock_existing_user_id_claimed') {
            return { walletAddress: 'mock_existing_user_id_claimed', hasClaimedFirstPlay: 1, referralCredits: 0 };
          }
          if (walletAddress === 'mock_existing_user_id_unclaimed') {
            return { walletAddress: 'mock_existing_user_id_unclaimed', hasClaimedFirstPlay: 0, referralCredits: 0 };
          }
          if (walletAddress === 'mock_new_user_id') {
            return null;
          }
        }
        return null;
      },
      run: async () => ({ success: true, changes: 1 }),
    }),
  }),
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { userToken } = req.body;

  if (!userToken) {
    return res.status(400).json({ success: false, error: 'User token is required.' });
  }

  // Validate JWT configuration
  const jwtSecret = process.env.PARTICLE_NETWORK_JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: PARTICLE_NETWORK_JWT_SECRET environment variable is not set');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }
  
  // Validate JWT format (minimum 32 characters)
  if (jwtSecret.length < 32) {
    console.error('FATAL: PARTICLE_NETWORK_JWT_SECRET must be at least 32 characters');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(userToken, jwtSecret);
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }

  const particleId = decodedToken.account || decodedToken.publicAddress;

  // const DB = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? mockD1 : (process.env as any).DB) as D1Database;
  // Use the name `localDevMockD1` for the mock defined in this file to avoid confusion with test's mockD1
  const localDevMockD1 = mockD1;

  let DB_INSTANCE: D1Database;

  if (process.env.NODE_ENV === 'test') {
    // For tests, always use the injected DB from process.env set by the test file
    DB_INSTANCE = (process.env as any).DB as D1Database;
  } else if (process.env.NODE_ENV === 'development') {
    // For local development, can use a local mock or an injected one if available (e.g. from a local wrangler setup)
    // Prioritize injected DB if present, otherwise fall back to the local in-file mock.
    DB_INSTANCE = (process.env as any).DB || localDevMockD1 as any;
  } else {
    // For production (or other environments), expect DB to be provided by the platform environment
    // Assuming the actual binding name might be different, e.g., from wrangler.toml
    DB_INSTANCE = (process.env as any).DB_PLATFORM_BINDING as D1Database;
  }

  const DB = DB_INSTANCE;

  // Ensure DB is initialized

  if (!DB) {
    console.error('D1 Database not initialized or available for the current environment.');
    return res.status(500).json({ success: false, error: 'Database not available for environment.' });
  }

  try {
    const userRecord = await DB.prepare('SELECT * FROM user_preferences WHERE walletAddress = ?')
      .bind(particleId)
      .first();

    if (userRecord && userRecord.hasClaimedFirstPlay) {
      return res.status(200).json({ success: false, error: 'First play free already claimed.' });
    }

    // Try to get config from service first, then fallback to local config
    let firstPlayConfig = await creditConfigService.getConfig('first-play-free');
    
    // Fallback to local config if service unavailable
    if (!firstPlayConfig || typeof firstPlayConfig.rules?.amount !== 'number') {
      try {
        firstPlayConfig = require('@/config/first-play-free.json');
      } catch (e) {
        console.error('Both service and fallback config failed:', e);
        return res.status(500).json({
          success: false,
          error: 'Configuration system failure - contact support'
        });
      }
      
      if (typeof firstPlayConfig!.rules?.amount !== 'number') {
        console.error('Fallback config validation failed');
        return res.status(500).json({
          success: false,
          error: 'Fallback configuration invalid'
        });
      }
    }
    const creditAmount = firstPlayConfig.rules!.amount;

    if (!userRecord) {
      await DB.prepare(
        'INSERT INTO user_preferences (walletAddress, hasClaimedFirstPlay, referralCredits, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
      )
        .bind(particleId, 1, creditAmount)
        .run();
    } else {
      await DB.prepare(
        'UPDATE user_preferences SET hasClaimedFirstPlay = ?, referralCredits = referralCredits + ?, lastLogin = CURRENT_TIMESTAMP WHERE walletAddress = ?'
      )
        .bind(1, creditAmount, particleId)
        .run();
    }

    return res.status(200).json({ success: true, creditAmount });
  } catch (error: any) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return res.status(500).json({ success: false, error: errorMessage });
  }
}