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
        const { id, tournament_id } = req.query;
        if (id) {
          const { results } = await db.prepare('SELECT * FROM matches WHERE id = ?').bind(id).all();
          return res.status(200).json(results[0] || null);
        } else if (tournament_id) {
          const { results } = await db.prepare('SELECT * FROM matches WHERE tournament_id = ?').bind(tournament_id).all();
          return res.status(200).json(results);
        } else {
          const { results } = await db.prepare('SELECT * FROM matches').all();
          return res.status(200).json(results);
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    case 'POST':
      try {
        const { tournament_id, round, match_number, team1_id, team2_id } = req.body;
        if (!tournament_id || !round || !match_number) {
          return res.status(400).json({ error: 'Missing required fields: tournament_id, round, match_number' });
        }
        const { success } = await db.prepare('INSERT INTO matches (tournament_id, round, match_number, team1_id, team2_id) VALUES (?, ?, ?, ?, ?)').bind(tournament_id, round, match_number, team1_id, team2_id).run();
        if (success) {
          return res.status(201).json({ message: 'Match created successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to create match' });
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    case 'PUT':
      try {
        const { id, team1_id, team2_id, score1, score2, winner_id, next_match_id } = req.body;
        if (!id || (!team1_id && !team2_id && !score1 && !score2 && !winner_id && !next_match_id)) {
          return res.status(400).json({ error: 'Missing required fields: id and at least one field to update' });
        }
        let query = 'UPDATE matches SET';
        const params = [];
        if (team1_id) {
          query += ' team1_id = ?,';
          params.push(team1_id);
        }
        if (team2_id) {
          query += ' team2_id = ?,';
          params.push(team2_id);
        }
        if (score1) {
          query += ' score1 = ?,';
          params.push(score1);
        }
        if (score2) {
          query += ' score2 = ?,';
          params.push(score2);
        }
        if (winner_id) {
          query += ' winner_id = ?,';
          params.push(winner_id);
        }
        if (next_match_id) {
          query += ' next_match_id = ?,';
          params.push(next_match_id);
        }
        query = query.slice(0, -1); // Remove trailing comma
        query += ' WHERE id = ?';
        params.push(id);

        const { success } = await db.prepare(query).bind(...params).run();
        if (success) {
          return res.status(200).json({ message: 'Match updated successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to update match' });
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
        const { success } = await db.prepare('DELETE FROM matches WHERE id = ?').bind(id).run();
        if (success) {
          return res.status(200).json({ message: 'Match deleted successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to delete match' });
        }
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}