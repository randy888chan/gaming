import { createMocks } from 'node-mocks-http';
import handler from './teams';
import * as authMiddleware from '@/utils/authMiddleware';

// Mock the auth middleware
jest.mock('@/utils/authMiddleware', () => ({
  withAuth: jest.fn((handler) => handler)
}));

describe('/api/v1/tournaments/teams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return tournament teams for GET request with valid tournamentId', async () => {
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
      teams: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          tournamentId: '1',
          name: expect.any(String),
          players: expect.any(Array),
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

  it('should create a new team for POST request with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tournamentId: '1',
        name: 'New Team',
        players: ['user1', 'user2'],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      team: expect.objectContaining({
        id: expect.any(String),
        tournamentId: '1',
        name: 'New Team',
        players: ['user1', 'user2'],
      }),
    });
  });

  it('should return 400 for POST request with missing data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tournamentId: '1',
        name: 'New Team',
        // missing players
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required fields: tournamentId, name, players',
    });
  });

  it('should return 405 for non-GET/POST methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});