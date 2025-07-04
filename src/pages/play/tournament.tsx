import React, { useState } from 'react';
import TournamentBracket from '../../components/tournament/TournamentBracket';
import { Tournament, Team, Match } from '../../types/tournament';

const initialTeams: Team[] = [
  { id: 'team1', name: 'Team A' },
  { id: 'team2', name: 'Team B' },
  { id: 'team3', name: 'Team C' },
  { id: 'team4', name: 'Team D' },
  { id: 'team5', name: 'Team E' },
  { id: 'team6', name: 'Team F' },
  { id: 'team7', name: 'Team G' },
  { id: 'team8', name: 'Team H' },
];

const generateSingleEliminationBracket = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  let currentRoundMatches: Match[] = [];
  let round = 1;

  // Initial round (Round of N)
  for (let i = 0; i < teams.length; i += 2) {
    const match: Match = {
      id: `match-${round}-${matches.length + 1}`,
      round: round,
      matchNumber: matches.length + 1,
      team1: teams[i] || null,
      team2: teams[i + 1] || null,
      score1: null,
      score2: null,
      winnerId: null,
      nextMatchId: null,
      nextMatchTeamSlot: null,
    };
    currentRoundMatches.push(match);
    matches.push(match);
  }

  // Subsequent rounds
  while (currentRoundMatches.length > 1) {
    round++;
    const nextRoundMatches: Match[] = [];
    for (let i = 0; i < currentRoundMatches.length; i += 2) {
      const match: Match = {
        id: `match-${round}-${matches.length + 1}`,
        round: round,
        matchNumber: matches.length + 1,
        team1: null,
        team2: null,
        score1: null,
        score2: null,
        winnerId: null,
        nextMatchId: null,
        nextMatchTeamSlot: null,
      };
      nextRoundMatches.push(match);
      matches.push(match);

      // Link previous round matches to this new match
      if (currentRoundMatches[i]) {
        currentRoundMatches[i].nextMatchId = match.id;
        currentRoundMatches[i].nextMatchTeamSlot = 'team1';
      }
      if (currentRoundMatches[i + 1]) {
        currentRoundMatches[i + 1].nextMatchId = match.id;
        currentRoundMatches[i + 1].nextMatchTeamSlot = 'team2';
      }
    }
    currentRoundMatches = nextRoundMatches;
  }

  return matches;
};

const initialTournament: Tournament = {
  id: 'tournament-1',
  name: 'Sample Single Elimination Tournament',
  format: 'single-elimination',
  teams: initialTeams,
  matches: generateSingleEliminationBracket(initialTeams),
};

const TournamentPage: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament>(initialTournament);

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    setTournament(updatedTournament);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Tournament View</h1>
      <TournamentBracket
        tournament={tournament}
        onUpdateTournament={handleUpdateTournament}
      />
    </div>
  );
};

export default TournamentPage;