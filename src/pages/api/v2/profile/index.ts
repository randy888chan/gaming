import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { z } from 'zod';
import { Pool } from 'pg';
import { encrypt, decrypt } from '../../../../lib/encryption'; // Assuming encryption utility
import { auditLog } from '../../../../lib/auditLog'; // Assuming audit logging utility

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const profileSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
});

export default async function profileHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = session.user.sub; // Auth0 user ID

  switch (req.method) {
    case 'GET':
      try {
        const result = await pool.query(
          `SELECT user_id, username, email, avatar_url, privacy_settings, created_at, last_login
           FROM user_profiles
           WHERE user_id = $1`,
          [userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        const profile = result.rows[0];
        profile.email = decrypt(profile.email); // Decrypt email for display

        res.status(200).json({
          username: profile.username,
          email: profile.email,
          avatar_url: profile.avatar_url,
          account_creation_date: profile.created_at,
          last_login: profile.last_login,
          user_id: profile.user_id,
          authentication_provider: session.user.sub.split('|')[0], // Extract provider from Auth0 sub
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        // Re-authentication via MFA would be handled by Auth0 before this API call
        // For simplicity, assuming the session is already MFA-authenticated if required.

        const parsedBody = profileSchema.parse(req.body);
        const encryptedEmail = encrypt(parsedBody.email);

        const result = await pool.query(
          `UPDATE user_profiles
           SET username = $1, email = $2, avatar_url = $3
           WHERE user_id = $4
           RETURNING *`,
          [parsedBody.username, encryptedEmail, parsedBody.avatar_url, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        await auditLog(userId, 'profile_update', {
          old_username: session.user.username, // Assuming username is in session for old value
          new_username: parsedBody.username,
          old_email: session.user.email, // Assuming email is in session for old value
          new_email: parsedBody.email,
        });

        res.status(200).json({ message: 'Profile updated successfully' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}