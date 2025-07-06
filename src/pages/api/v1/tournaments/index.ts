import { NextApiRequest, NextApiResponse } from 'next';
import { D1Database } from '@cloudflare/workers-types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prioritize req.db for testing, fallback to process.env.DB for runtime
  const db = (req as any).db || process.env.DB;

  if (!db) {
    return res.status(500).json({ error: 'Database not configured.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query;
        if (id) {
          const { results } = await db.prepare('SELECT * FROM tournaments WHERE id = ?').bind(id).all();
          return res.status(200).json(results[0] || null);
        } else {
          const { results } = await db.prepare('SELECT * FROM tournaments').all();
          return res.status(200).json(results);
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    case 'POST':
      try {
        const { name, format, status } = req.body;
        if (!name || !format || !status) {
          return res.status(400).json({ error: 'Missing required fields: name, format, status' });
        }
        const { success } = await db.prepare('INSERT INTO tournaments (name, format, status) VALUES (?, ?, ?)').bind(name, format, status).run();
        if (success) {
          return res.status(201).json({ message: 'Tournament created successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to create tournament' });
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    case 'PUT':
      try {
        const { id, name, format, status } = req.body;
        if (!id || (!name && !format && !status)) {
          return res.status(400).json({ error: 'Missing required fields: id and at least one of name, format, status' });
        }
        let query = 'UPDATE tournaments SET';
        const params = [];
        if (name) {
          query += ' name = ?,';
          params.push(name);
        }
        if (format) {
          query += ' format = ?,';
          params.push(format);
        }
        if (status) {
          query += ' status = ?,';
          params.push(status);
        }
        query = query.slice(0, -1); // Remove trailing comma
        query += ' WHERE id = ?';
        params.push(id);

        const { success } = await db.prepare(query).bind(...params).run();
        if (success) {
          return res.status(200).json({ message: 'Tournament updated successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to update tournament' });
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing required field: id' });
        }
        const { success } = await db.prepare('DELETE FROM tournaments WHERE id = ?').bind(id).run();
        if (success) {
          return res.status(200).json({ message: 'Tournament deleted successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to delete tournament' });
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}