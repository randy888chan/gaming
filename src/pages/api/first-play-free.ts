import type { NextApiRequest, NextApiResponse } from 'next';
// import { D1Database } from '@cloudflare/workers-types'; // Assuming this type is available or can be mocked
import jwt from 'jsonwebtoken'; // For token verification
declare module 'jsonwebtoken';

// Mock D1 Database for local development/testing
// In a real Cloudflare Worker, D1 would be bound via environment.
const mockD1: any = {
  prepare: (query: string) => ({
    bind: (...args: any[]) => ({
      first: async (colName?: string) => {
        // Simulate user lookup
        if (query.includes('SELECT * FROM users WHERE particle_id = ?')) {
          const [particleId] = args;
          if (particleId === 'mock_existing_user_id') {
            return { particle_id: 'mock_existing_user_id', has_claimed_first_play: 1 };
          }
          if (particleId === 'mock_new_user_id') {
            return null; // Simulate new user
          }
        }
        // Simulate insert/update
        if (query.includes('INSERT INTO users') || query.includes('UPDATE users')) {
          return { success: true, changes: 1 };
        }
        return null;
      },
      all: async () => ({ results: [] }),
      run: async () => ({ success: true, changes: 1 }),
    }),
  }),
  dump: async () => new ArrayBuffer(0),
  batch: async () => [],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { userToken, referralCode } = req.body;

  if (!userToken) {
    return res.status(400).json({ success: false, error: 'User token is required.' });
  }

  // In a real scenario, verify the userToken with Particle Network's SDK or a JWT secret
  // For this example, we'll mock a simple JWT verification.
  let decodedToken: any;
  try {
    // Replace 'YOUR_PARTICLE_NETWORK_JWT_SECRET' with your actual secret
    // This secret should be stored securely, e.g., in environment variables.
    decodedToken = jwt.verify(userToken, process.env.PARTICLE_NETWORK_JWT_SECRET || 'mock-jwt-secret');
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }

  const particleId = decodedToken.account || userToken; // Use account from decoded token or fallback to userToken

  // Access D1 database (mocked for now)
  // In a Cloudflare Worker, `env.DB` would be the D1 binding.
  const DB = (process.env.NODE_ENV === 'development' ? mockD1 : (process.env as any).DB) as any;

  if (!DB) {
    console.error('D1 Database not initialized.');
    return res.status(500).json({ success: false, error: 'Database not available.' });
  }

  try {
    // Check if user exists and has claimed first play
    const userRecord = await DB.prepare('SELECT * FROM users WHERE particle_id = ?')
      .bind(particleId)
      .first();

    if (userRecord && userRecord.has_claimed_first_play) {
      return res.status(200).json({ success: false, error: 'First play free already claimed.' });
    }

    const creditAmount = 0.001; // Example micro-value credit

    if (!userRecord) {
      // Create new user record
      await DB.prepare(
        'INSERT INTO users (particle_id, wallet_address, has_claimed_first_play, referred_by, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
        .bind(particleId, decodedToken.walletAddress || 'unknown', 1, referralCode || null)
        .run();
    } else {
      // Update existing user record
      // Only update referred_by if it's not already set and a referralCode is provided
      if (!userRecord.referred_by && referralCode) {
        await DB.prepare(
          'UPDATE users SET has_claimed_first_play = ?, referred_by = ?, updated_at = CURRENT_TIMESTAMP WHERE particle_id = ?'
        )
          .bind(1, referralCode, particleId)
          .run();
      } else {
        await DB.prepare(
          'UPDATE users SET has_claimed_first_play = ?, updated_at = CURRENT_TIMESTAMP WHERE particle_id = ?'
        )
          .bind(1, particleId)
          .run();
      }
    }

    // Here you would typically interact with your game's credit system
    // For this example, we'll just return success.
    console.log(`User ${particleId} successfully claimed first play free.`);

    return res.status(200).json({ success: true, creditAmount });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}