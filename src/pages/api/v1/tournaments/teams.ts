import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface Team {
  id: string;
  tournamentId: string;
  name: string;
  players: string[]; // particle_user_ids
}

const teams: Team[] = [
  {
    id: "1",
    tournamentId: "1",
    name: "Team Alpha",
    players: ["user1", "user2"],
  },
  {
    id: "2",
    tournamentId: "1",
    name: "Team Beta",
    players: ["user3", "user4"],
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
    
    const tournamentTeams = teams.filter(team => team.tournamentId === tournamentId);
    return res.status(200).json({ success: true, teams: tournamentTeams });
  } else if (req.method === "POST") {
    const { tournamentId, name, players } = req.body;
    
    if (!tournamentId || !name || !players) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: tournamentId, name, players" 
      });
    }
    
    const newTeam: Team = {
      id: (teams.length + 1).toString(),
      tournamentId,
      name,
      players: Array.isArray(players) ? players : [players],
    };
    
    teams.push(newTeam);
    
    return res.status(201).json({ success: true, team: newTeam });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);