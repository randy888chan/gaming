import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/authMiddleware";

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  createdAt: string;
}

const tournaments: Tournament[] = [
  {
    id: "1",
    name: "Summer Championship",
    format: "single-elimination",
    status: "upcoming",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Winter League",
    format: "double-elimination",
    status: "ongoing",
    createdAt: new Date().toISOString(),
  },
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // Return list of tournaments
    return res.status(200).json({ success: true, tournaments });
  } else if (req.method === "POST") {
    // Create a new tournament
    const { name, format } = req.body;
    
    if (!name || !format) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: name, format" 
      });
    }
    
    const newTournament: Tournament = {
      id: (tournaments.length + 1).toString(),
      name,
      format,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };
    
    tournaments.push(newTournament);
    
    return res.status(201).json({ success: true, tournament: newTournament });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withAuth(handler);