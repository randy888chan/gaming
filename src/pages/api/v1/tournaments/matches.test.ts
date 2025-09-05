import { createMocks } from 'node-mocks-http';
import handler from './matches';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/tournaments/matches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return tournament matches for GET request with valid tournamentId', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        tournamentId: '1',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      matches: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          tournamentId: '1',
          round: expect.any(Number),
          matchNumber: expect.any(Number),
        }),
      ]),
    });
  });

  it('should return 400 for GET request with missing tournamentId', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing tournamentId parameter',
    });
  });

  it('should create a new match for POST request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tournamentId: '1',
        round: 1,
        matchNumber: 3,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      match: expect.objectContaining({
        id: expect.any(String),
        tournamentId: '1',
        round: 1,
        matchNumber: 3,
      }),
    });
  });

  it('should return 400 for POST request with missing data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tournamentId: '1',
        round: 1,
        // missing matchNumber
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required fields: tournamentId, round, matchNumber',
    });
  });

  it('should update a match for PUT request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        id: '1',
        score1: 10,
        score2: 5,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      match: expect.objectContaining({
        id: '1',
        score1: 10,
        score2: 5,
      }),
    });
  });

  it('should return 400 for PUT request with missing id', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        // missing id
        score1: 10,
        score2: 5,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required field: id',
    });
  });

  it('should return 404 for PUT request with non-existent match id', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        id: '999', // non-existent id
        score1: 10,
        score2: 5,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Match not found',
    });
  });

  it('should return 405 for non-GET/POST/PUT methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});