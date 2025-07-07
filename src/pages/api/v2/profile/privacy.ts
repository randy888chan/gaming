import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { z } from 'zod';
import { Pool } from 'pg';
import { auditLog } from '../../../../lib/auditLog'; // Assuming audit logging utility

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const privacySettingsSchema = z.object({
  email_visibility: z.boolean().optional(),
  gameplay_statistics_visibility: z.boolean().optional(),
  social_connections_visibility: z.boolean().optional(),
  data_collection_categories: z.record(z.boolean()).optional(), // Granular opt-in/out
});

export default async function privacyHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = session.user.sub; // Auth0 user ID

  switch (req.method) {
    case 'PATCH':
      try {
        // Re-authentication via MFA would be handled by Auth0 before this API call
        // For simplicity, assuming the session is already MFA-authenticated if required.

        const parsedBody = privacySettingsSchema.parse(req.body);

        const result = await pool.query(
          `UPDATE user_profiles
           SET privacy_settings = privacy_settings || $1::jsonb
           WHERE user_id = $2
           RETURNING privacy_settings`,
          [parsedBody, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        await auditLog(userId, 'privacy_settings_update', {
          old_settings: result.rows[0].privacy_settings, // Assuming old settings are returned
          new_settings: parsedBody,
        });

        res.status(200).json({ message: 'Privacy settings updated successfully' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error updating privacy settings:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}