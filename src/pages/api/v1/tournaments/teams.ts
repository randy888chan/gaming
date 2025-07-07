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
  console.log(`[API] /api/v1/tournaments/teams - Method: ${req.method}`);
  // Prioritize req.db for testing, fallback to process.env.DB for runtime
  const db = (req as any).db || process.env.DB;

  if (!db) {
    return res.status(500).json({ error: 'Database not configured.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { id, tournament_id } = req.query || {};
        if (id) {
          const team = await db.prepare('SELECT * FROM teams WHERE id = ?').bind(id).first();
          return res.status(200).json(team || null);
        } else if (tournament_id) {
          const { results } = await db.prepare('SELECT * FROM teams WHERE tournament_id = ?').bind(tournament_id).all();
          return res.status(200).json(results);
        } else {
          const { results } = await db.prepare('SELECT * FROM teams').all();
          return res.status(200).json(results);
        }
      } catch (error: any) {
        console.error('API Error in teams GET:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'POST':
      try {
        const { tournament_id, name, players } = req.body;
        if (!tournament_id || !name) {
          return res.status(400).json({ error: 'Missing required fields: tournament_id, name' });
        }
        const playersJson = players ? JSON.stringify(players) : null;
        const { success } = await db.prepare('INSERT INTO teams (tournament_id, name, players) VALUES (?, ?, ?)').bind(tournament_id, name, playersJson).run();
        if (success) {
          return res.status(201).json({ message: 'Team created successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to create team' });
        }
      } catch (error: any) {
        console.error('API Error in teams POST:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'PUT':
      try {
        const { id, name, players } = req.body;
        if (!id || (!name && !players)) {
          return res.status(400).json({ error: 'Missing required fields: id and at least one of name, players' });
        }
        let query = 'UPDATE teams SET';
        const params = [];
        if (name) {
          query += ' name = ?,';
          params.push(name);
        }
        if (players) {
          query += ' players = ?,';
          params.push(JSON.stringify(players));
        }
        query = query.slice(0, -1); // Remove trailing comma
        query += ' WHERE id = ?';
        params.push(id);

        const { success } = await db.prepare(query).bind(...params).run();
        if (success) {
          return res.status(200).json({ message: 'Team updated successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to update team' });
        }
      } catch (error: any) {
        console.error('API Error in teams PUT:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing required field: id' });
        }
        const { success } = await db.prepare('DELETE FROM teams WHERE id = ?').bind(id).run();
        if (success) {
          return res.status(200).json({ message: 'Team deleted successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to delete team' });
        }
      } catch (error: any) {
        console.error('API Error in teams DELETE:', error);
        return res.status(500).json({ error: error.message });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}