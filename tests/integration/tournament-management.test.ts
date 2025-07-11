import { NextApiRequest, NextApiResponse } from "next";
import {
  D1Database,
  D1Result,
  D1PreparedStatement,
} from "@cloudflare/workers-types";
import tournamentsHandler from "../../src/pages/api/v1/tournaments/index";
import teamsHandler from "../../src/pages/api/v1/tournaments/teams";
import matchesHandler from "../../src/pages/api/v1/tournaments/matches";

// Mock D1Database for testing
const mockDb: D1Database = {
  prepare: jest.fn((query: string) => {
    const preparedStatement: Partial<D1PreparedStatement> = {
      bind: jest.fn((...args: any[]) => {
        const boundStatement: Partial<D1PreparedStatement> = {
          all: jest.fn(async () => {
            if (query.includes("SELECT * FROM tournaments WHERE id = ?")) {
              const id = args[0];
              if (id === "test-tournament-1") {
                return {
                  results: [
                    {
                      id: "test-tournament-1",
                      name: "Test Tournament",
                      format: "Single Elimination",
                      status: "Active",
                    },
                  ],
                  success: true,
                  meta: {
                    duration: 0,
                    last_row_id: 0,
                    changes: 0,
                    served_by: "mock",
                    internal_ms: 0,
                    rows_read: 0,
                    rows_written: 0,
                    size_after: 0,
                    changed_db: false,
                  },
                } as D1Result;
              }
            } else if (query.includes("SELECT * FROM teams WHERE id = ?")) {
              const id = args[0];
              if (id === "test-team-1") {
                return {
                  results: [
                    {
                      id: "test-team-1",
                      tournament_id: "test-tournament-1",
                      name: "Team A",
                      players: "[]",
                    },
                  ],
                  success: true,
                  meta: {
                    duration: 0,
                    last_row_id: 0,
                    changes: 0,
                    served_by: "mock",
                    internal_ms: 0,
                    rows_read: 0,
                    rows_written: 0,
                    size_after: 0,
                    changed_db: false,
                  },
                } as D1Result;
              }
            } else if (
              query.includes("SELECT * FROM teams WHERE tournament_id = ?")
            ) {
              const tournament_id = args[0];
              if (tournament_id === "test-tournament-1") {
                return {
                  results: [
                    {
                      id: "test-team-1",
                      tournament_id: "test-tournament-1",
                      name: "Team A",
                      players: "[]",
                    },
                  ],
                  success: true,
                  meta: {
                    duration: 0,
                    last_row_id: 0,
                    changes: 0,
                    served_by: "mock",
                    internal_ms: 0,
                    rows_read: 0,
                    rows_written: 0,
                    size_after: 0,
                    changed_db: false,
                  },
                } as D1Result;
              }
            } else if (query.includes("SELECT * FROM matches WHERE id = ?")) {
              const id = args[0];
              if (id === "test-match-1") {
                return {
                  results: [
                    {
                      id: "test-match-1",
                      tournament_id: "test-tournament-1",
                      round: 1,
                      match_number: 1,
                      team1_id: "test-team-1",
                      team2_id: null,
                      score1: null,
                      score2: null,
                      winner_id: null,
                      next_match_id: null,
                    },
                  ],
                  success: true,
                  meta: {
                    duration: 0,
                    last_row_id: 0,
                    changes: 0,
                    served_by: "mock",
                    internal_ms: 0,
                    rows_read: 0,
                    rows_written: 0,
                    size_after: 0,
                    changed_db: false,
                  },
                } as D1Result;
              }
            } else if (
              query.includes("SELECT * FROM matches WHERE tournament_id = ?")
            ) {
              const tournament_id = args[0];
              if (tournament_id === "test-tournament-1") {
                return {
                  results: [
                    {
                      id: "test-match-1",
                      tournament_id: "test-tournament-1",
                      round: 1,
                      match_number: 1,
                      team1_id: "test-team-1",
                      team2_id: null,
                      score1: null,
                      score2: null,
                      winner_id: null,
                      next_match_id: null,
                    },
                  ],
                  success: true,
                  meta: {
                    duration: 0,
                    last_row_id: 0,
                    changes: 0,
                    served_by: "mock",
                    internal_ms: 0,
                    rows_read: 0,
                    rows_written: 0,
                    size_after: 0,
                    changed_db: false,
                  },
                } as D1Result;
              }
            }
            return {
              results: [],
              success: true,
              meta: {
                duration: 0,
                last_row_id: 0,
                changes: 0,
                served_by: "mock",
                internal_ms: 0,
                rows_read: 0,
                rows_written: 0,
                size_after: 0,
                changed_db: false,
              },
            } as D1Result;
          }),
          first: jest.fn(async () => {
            if (query.includes("SELECT * FROM tournaments WHERE id = ?")) {
              const id = args[0];
              if (id === "test-tournament-1") {
                return {
                  id: "test-tournament-1",
                  name: "Test Tournament",
                  format: "Single Elimination",
                  status: "Active",
                };
              }
            } else if (query.includes("SELECT * FROM teams WHERE id = ?")) {
              const id = args[0];
              if (id === "test-team-1") {
                return {
                  id: "test-team-1",
                  tournament_id: "test-tournament-1",
                  name: "Team A",
                  players: "[]",
                };
              }
            } else if (query.includes("SELECT * FROM matches WHERE id = ?")) {
              const id = args[0];
              if (id === "test-match-1") {
                return {
                  id: "test-match-1",
                  tournament_id: "test-tournament-1",
                  round: 1,
                  match_number: 1,
                  team1_id: "test-team-1",
                  team2_id: null,
                  score1: null,
                  score2: null,
                  winner_id: null,
                  next_match_id: null,
                };
              }
            }
            return null;
          }),
          run: jest.fn(async () => ({
            success: true,
            meta: {
              duration: 0,
              last_row_id: 0,
              changes: 0,
              served_by: "mock",
              internal_ms: 0,
              rows_read: 0,
              rows_written: 0,
              size_after: 0,
              changed_db: false,
            },
          })) as any,
        };
        return boundStatement as D1PreparedStatement;
      }),
      all: jest.fn(async () => {
        if (query.includes("SELECT * FROM tournaments")) {
          return {
            results: [
              {
                id: "test-tournament-1",
                name: "Test Tournament",
                format: "Single Elimination",
                status: "Active",
              },
              {
                id: "test-tournament-2",
                name: "Another Tournament",
                format: "Round Robin",
                status: "Upcoming",
              },
            ],
            success: true,
            meta: {
              duration: 0,
              last_row_id: 0,
              changes: 0,
              served_by: "mock",
              internal_ms: 0,
              rows_read: 0,
              rows_written: 0,
              size_after: 0,
              changed_db: false,
            },
          } as D1Result;
        } else if (query.includes("SELECT * FROM teams")) {
          return {
            results: [
              {
                id: "test-team-1",
                tournament_id: "test-tournament-1",
                name: "Team A",
                players: "[]",
              },
              {
                id: "test-team-2",
                tournament_id: "test-tournament-1",
                name: "Team B",
                players: "[]",
              },
            ],
            success: true,
            meta: {
              duration: 0,
              last_row_id: 0,
              changes: 0,
              served_by: "mock",
              internal_ms: 0,
              rows_read: 0,
              rows_written: 0,
              size_after: 0,
              changed_db: false,
            },
          } as D1Result;
        } else if (query.includes("SELECT * FROM matches")) {
          return {
            results: [
              {
                id: "test-match-1",
                tournament_id: "test-tournament-1",
                round: 1,
                match_number: 1,
                team1_id: "test-team-1",
                team2_id: null,
                score1: null,
                score2: null,
                winner_id: null,
                next_match_id: null,
              },
              {
                id: "test-match-2",
                tournament_id: "test-tournament-1",
                round: 1,
                match_number: 2,
                team1_id: "test-team-2",
                team2_id: null,
                score1: null,
                score2: null,
                winner_id: null,
                next_match_id: null,
              },
            ],
            success: true,
            meta: {
              duration: 0,
              last_row_id: 0,
              changes: 0,
              served_by: "mock",
              internal_ms: 0,
              rows_read: 0,
              rows_written: 0,
              size_after: 0,
              changed_db: false,
            },
          } as D1Result;
        }
        return {
          results: [],
          success: true,
          meta: {
            duration: 0,
            last_row_id: 0,
            changes: 0,
            served_by: "mock",
            internal_ms: 0,
            rows_read: 0,
            rows_written: 0,
            size_after: 0,
            changed_db: false,
          },
        } as D1Result;
      }),
      run: jest.fn(async () => ({
        success: true,
        meta: {
          duration: 0,
          last_row_id: 0,
          changes: 0,
          served_by: "mock",
          internal_ms: 0,
          rows_read: 0,
          rows_written: 0,
          size_after: 0,
          changed_db: false,
        },
      })) as any,
    };
    return preparedStatement as D1PreparedStatement;
  }),
  batch: jest.fn(async () => ({
    success: true,
    results: [],
    meta: {
      duration: 0,
      last_row_id: 0,
      changes: 0,
      served_by: "mock",
      internal_ms: 0,
      rows_read: 0,
      rows_written: 0,
      size_after: 0,
      changed_db: false,
    },
  })) as any,
  exec: jest.fn(async () => ({
    success: true,
    results: [],
    meta: {
      duration: 0,
      last_row_id: 0,
      changes: 0,
      served_by: "mock",
      internal_ms: 0,
      rows_read: 0,
      rows_written: 0,
      size_after: 0,
      changed_db: false,
    },
  })) as any,
  withSession: jest.fn(() => mockDb) as any,
  dump: jest.fn(async () => new ArrayBuffer(0)) as any,
};

// Helper function to create mock request and response objects
const createMockReqRes = (method: string, body?: any, query?: any) => {
  const req: Partial<NextApiRequest> = { method, body, query };
  const res: Partial<NextApiResponse> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  // Attach mockDb to req for testing purposes
  (req as any).db = mockDb;
  return { req: req as NextApiRequest, res: res as NextApiResponse };
};

describe("Tournament API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for Tournaments API
  describe("/api/v1/tournaments", () => {
    it("should create a new tournament", async () => {
      const { req, res } = createMockReqRes("POST", {
        name: "New Tournament",
        format: "Single Elimination",
        status: "Upcoming",
      });
      await tournamentsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tournament created successfully" })
      );
    });

    it("should get all tournaments", async () => {
      const { req, res } = createMockReqRes("GET");
      await tournamentsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("should get a single tournament by ID", async () => {
      const { req, res } = createMockReqRes("GET", undefined, {
        id: "test-tournament-1",
      });
      await tournamentsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: "test-tournament-1" })
      );
    });

    it("should update a tournament", async () => {
      const { req, res } = createMockReqRes("PUT", {
        id: "test-tournament-1",
        status: "Active",
      });
      await tournamentsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tournament updated successfully" })
      );
    });

    it("should delete a tournament", async () => {
      const { req, res } = createMockReqRes("DELETE", undefined, {
        id: "test-tournament-1",
      });
      await tournamentsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tournament deleted successfully" })
      );
    });
  });

  // Test for Teams API
  describe("/api/v1/tournaments/teams", () => {
    it("should create a new team", async () => {
      const { req, res } = createMockReqRes("POST", {
        tournament_id: "test-tournament-1",
        name: "New Team",
        players: ["Player 1"],
      });
      await teamsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Team created successfully" })
      );
    });

    it("should get all teams", async () => {
      const { req, res } = createMockReqRes("GET");
      await teamsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("should get teams by tournament ID", async () => {
      const { req, res } = createMockReqRes("GET", undefined, {
        tournament_id: "test-tournament-1",
      });
      await teamsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("should update a team", async () => {
      const { req, res } = createMockReqRes("PUT", {
        id: "test-team-1",
        name: "Updated Team Name",
      });
      await teamsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Team updated successfully" })
      );
    });

    it("should delete a team", async () => {
      const { req, res } = createMockReqRes("DELETE", undefined, {
        id: "test-team-1",
      });
      await teamsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Team deleted successfully" })
      );
    });
  });

  // Test for Matches API
  describe("/api/v1/tournaments/matches", () => {
    it("should create a new match", async () => {
      const { req, res } = createMockReqRes("POST", {
        tournament_id: "test-tournament-1",
        round: 1,
        match_number: 1,
        team1_id: "team-a-id",
        team2_id: "team-b-id",
      });
      await matchesHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Match created successfully" })
      );
    });

    it("should get all matches", async () => {
      const { req, res } = createMockReqRes("GET");
      await matchesHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("should get matches by tournament ID", async () => {
      const { req, res } = createMockReqRes("GET", undefined, {
        tournament_id: "test-tournament-1",
      });
      await matchesHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("should update a match", async () => {
      const { req, res } = createMockReqRes("PUT", {
        id: "test-match-1",
        winner_id: "team-a-id",
        score1: 1,
        score2: 0,
      });
      await matchesHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Match updated successfully" })
      );
    });

    it("should delete a match", async () => {
      const { req, res } = createMockReqRes("DELETE", undefined, {
        id: "test-match-1",
      });
      await matchesHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Match deleted successfully" })
      );
    });
  });
});
