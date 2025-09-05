import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
}

const matches: Match[] = [
  {
    id: "1",
    tournamentId: "1",
    round: 1,
    matchNumber: 1,
    team1Id: "1",
    team2Id: "2",
    score1: null,
    score2: null,
    winnerId: null,
    nextMatchId: "3",
  },
  {
    id: "2",
    tournamentId: "1",
    round: 1,
    matchNumber: 2,
    team1Id: null,
    team2Id: null,
    score1: null,
    score2: null,
    winnerId: null,
    nextMatchId: "3",
  },
  {
    id: "3",
    tournamentId: "1",
    round: 2,
    matchNumber: 1,
    team1Id: null,
    team2Id: null,
    score1: null,
    score2: null,
    winnerId: null,
    nextMatchId: null,
  },
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { tournamentId } = req.query;
    
    if (!tournamentId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing tournamentId parameter" 
      });
    }
    
    const tournamentMatches = matches.filter(match => match.tournamentId === tournamentId);
    return res.status(200).json({ success: true, matches: tournamentMatches });
  } else if (req.method === "POST") {
    const { tournamentId, round, matchNumber, team1Id, team2Id } = req.body;
    
    if (!tournamentId || !round || !matchNumber) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: tournamentId, round, matchNumber" 
      });
    }
    
    const newMatch: Match = {
      id: (matches.length + 1).toString(),
      tournamentId,
      round,
      matchNumber,
      team1Id: team1Id || null,
      team2Id: team2Id || null,
      score1: null,
      score2: null,
      winnerId: null,
      nextMatchId: null,
    };
    
    matches.push(newMatch);
    
    return res.status(201).json({ success: true, match: newMatch });
  } else if (req.method === "PUT") {
    const { id, score1, score2, winnerId } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required field: id" 
      });
    }
    
    const matchIndex = matches.findIndex(match => match.id === id);
    
    if (matchIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Match not found" 
      });
    }
    
    const updatedMatch = { ...matches[matchIndex] };
    
    if (score1 !== undefined) updatedMatch.score1 = score1;
    if (score2 !== undefined) updatedMatch.score2 = score2;
    if (winnerId !== undefined) updatedMatch.winnerId = winnerId;
    
    matches[matchIndex] = updatedMatch;
    
    return res.status(200).json({ success: true, match: updatedMatch });
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);