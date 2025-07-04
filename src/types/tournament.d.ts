export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players?: Player[];
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextMatchTeamSlot: 'team1' | 'team2' | null;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  matches: Match[];
  teams: Team[];
}