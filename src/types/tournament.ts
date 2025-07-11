import { Timestamp } from "firebase/firestore";

export interface Team {
  id: string;
  name: string;
  players: string[]; // Array of user UIDs
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  team1: Team | null;
  team2: Team | null;
  score1?: number;
  score2?: number;
  winnerId?: string; // ID of the winning team
  status: "upcoming" | "ongoing" | "completed";
  nextMatchId?: string; // ID of the subsequent match
  nextMatchTeamSlot?: "team1" | "team2"; // Which slot the winner fills in the next match
}

export interface Tournament {
  id: string;
  name: string;
  format: string; // e.g., 'single-elimination', 'double-elimination'
  status: "upcoming" | "ongoing" | "completed";
  teams: Team[];
  matches: Match[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
