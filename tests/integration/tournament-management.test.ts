import { NextApiRequest, NextApiResponse } from 'next';
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import handler from '../../src/pages/api/v1/tournaments/index';
import teamsHandler from '../../src/pages/api/v1/tournaments/teams';
import matchesHandler from '../../src/pages/api/v1/tournaments/matches';
import { D1Database } from '@cloudflare/workers-types';

// Mock D1 Database for testing
const mockDb = {
  prepare: jest.fn(),
  bind: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
};

// Extend D1Database type to include Jest mock functions for `prepare`, `bind`, `all`, `run`
type MockD1Database = D1Database & {
  prepare: jest.Mock;
  bind: jest.Mock;
  all: jest.Mock;
  run: jest.Mock;
};

const typedMockDb: MockD1Database = mockDb as MockD1Database;

describe('Tournament API Endpoints', () => {
  beforeAll(() => {
    // Set the mock DB before all tests run
    (process.env as any).DB = typedMockDb;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation for each test to ensure isolation
    typedMockDb.prepare.mockReturnThis();
    typedMockDb.bind.mockReturnThis();
    typedMockDb.all.mockReset();
    typedMockDb.run.mockReset();
  });

  afterAll(() => {
    // Clean up the mock after all tests are done
    (process.env as any).DB = undefined;
  });

  describe('/api/v1/tournaments', () => {
    it('should create a new tournament', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'POST',
        body: { name: 'Test Tournament', format: 'single-elimination', status: 'upcoming' },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({ message: 'Tournament created successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('INSERT INTO tournaments (name, format, status) VALUES (?, ?, ?)');
      expect(typedMockDb.bind).toHaveBeenCalledWith('Test Tournament', 'single-elimination', 'upcoming');
    });

    it('should get all tournaments', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: '1', name: 'Tournament 1' }] });
      const req = createRequest({ method: 'GET', db: typedMockDb });
      const res = createResponse();
      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: '1', name: 'Tournament 1' }]);
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM tournaments');
    });

    it('should get a tournament by ID', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: '1', name: 'Tournament 1' }] });
      const req = createRequest({ method: 'GET', query: { id: '1' }, db: typedMockDb });
      const res = createResponse();
      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ id: '1', name: 'Tournament 1' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM tournaments WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('1');
    });

    it('should update a tournament', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'PUT',
        body: { id: '1', name: 'Updated Tournament' },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Tournament updated successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('UPDATE tournaments SET name = ? WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('Updated Tournament', '1');
    });

    it('should delete a tournament', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({ method: 'DELETE', query: { id: '1' }, db: typedMockDb });
      const res = createResponse();
      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Tournament deleted successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('DELETE FROM tournaments WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('1');
    });
  });

  describe('/api/v1/tournaments/teams', () => {
    it('should create a new team', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'POST',
        body: { tournament_id: 'tourn1', name: 'Team Alpha', players: ['playerA', 'playerB'] },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await teamsHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({ message: 'Team created successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('INSERT INTO teams (tournament_id, name, players) VALUES (?, ?, ?)');
      expect(typedMockDb.bind).toHaveBeenCalledWith('tourn1', 'Team Alpha', JSON.stringify(['playerA', 'playerB']));
    });

    it('should get all teams', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: 'team1', name: 'Team 1' }] });
      const req = createRequest({ method: 'GET', db: typedMockDb });
      const res = createResponse();
      await teamsHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: 'team1', name: 'Team 1' }]);
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM teams');
    });

    it('should get teams by tournament ID', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: 'team1', tournament_id: 'tourn1', name: 'Team 1' }] });
      const req = createRequest({ method: 'GET', query: { tournament_id: 'tourn1' }, db: typedMockDb });
      const res = createResponse();
      await teamsHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: 'team1', tournament_id: 'tourn1', name: 'Team 1' }]);
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM teams WHERE tournament_id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('tourn1');
    });

    it('should update a team', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'PUT',
        body: { id: 'team1', name: 'Updated Team Name' },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await teamsHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Team updated successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('UPDATE teams SET name = ? WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('Updated Team Name', 'team1');
    });

    it('should delete a team', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({ method: 'DELETE', query: { id: 'team1' }, db: typedMockDb });
      const res = createResponse();
      await teamsHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Team deleted successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('DELETE FROM teams WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('team1');
    });
  });

  describe('/api/v1/tournaments/matches', () => {
    it('should create a new match', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'POST',
        body: { tournament_id: 'tourn1', round: 1, match_number: 1, team1_id: 'teamA', team2_id: 'teamB' },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await matchesHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({ message: 'Match created successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('INSERT INTO matches (tournament_id, round, match_number, team1_id, team2_id) VALUES (?, ?, ?, ?, ?)');
      expect(typedMockDb.bind).toHaveBeenCalledWith('tourn1', 1, 1, 'teamA', 'teamB');
    });

    it('should get all matches', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: 'match1', tournament_id: 'tourn1' }] });
      const req = createRequest({ method: 'GET', db: typedMockDb });
      const res = createResponse();
      await matchesHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: 'match1', tournament_id: 'tourn1' }]);
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM matches');
    });

    it('should get matches by tournament ID', async () => {
      typedMockDb.all.mockResolvedValue({ results: [{ id: 'match1', tournament_id: 'tourn1' }] });
      const req = createRequest({ method: 'GET', query: { tournament_id: 'tourn1' }, db: typedMockDb });
      const res = createResponse();
      await matchesHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: 'match1', tournament_id: 'tourn1' }]);
      expect(typedMockDb.prepare).toHaveBeenCalledWith('SELECT * FROM matches WHERE tournament_id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('tourn1');
    });

    it('should update a match', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({
        method: 'PUT',
        body: { id: 'match1', score1: 10, score2: 5, winner_id: 'teamA' },
        db: typedMockDb, // Attach mock DB to request
      });
      const res = createResponse();
      await matchesHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Match updated successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('UPDATE matches SET score1 = ?, score2 = ?, winner_id = ? WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith(10, 5, 'teamA', 'match1');
    });

    it('should delete a match', async () => {
      typedMockDb.run.mockResolvedValue({ success: true });
      const req = createRequest({ method: 'DELETE', query: { id: 'match1' }, db: typedMockDb });
      const res = createResponse();
      await matchesHandler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Match deleted successfully' });
      expect(typedMockDb.prepare).toHaveBeenCalledWith('DELETE FROM matches WHERE id = ?');
      expect(typedMockDb.bind).toHaveBeenCalledWith('match1');
    });
  });
});