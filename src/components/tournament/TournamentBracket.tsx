import React from 'react';
import { Tournament, Match, Team } from '../../types/tournament';

interface TournamentBracketProps {
  tournament: Tournament;
  onUpdateTournament: (updatedTournament: Tournament) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournament, onUpdateTournament }) => {
  // Group matches by round
  const matchesByRound: Record<number, Match[]> = {};
  
  tournament.matches.forEach(match => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
  });

  // Sort matches within each round by match number
  Object.keys(matchesByRound).forEach(round => {
    matchesByRound[parseInt(round)].sort((a, b) => a.matchNumber - b.matchNumber);
  });

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  // Function to get team name or placeholder
  const getTeamDisplay = (team: Team | null) => {
    if (!team) return 'TBD';
    return team.name;
  };

  // Function to determine match status
  const getMatchStatus = (match: Match) => {
    if (match.winnerId) return 'completed';
    if (match.team1 && match.team2) return 'in-progress';
    return 'pending';
  };

  // Handle score updates
  const handleScoreUpdate = (matchId: string, teamSlot: 'team1' | 'team2', score: number) => {
    const updatedMatches = tournament.matches.map(match => {
      if (match.id === matchId) {
        const updatedMatch = { ...match };
        if (teamSlot === 'team1') {
          updatedMatch.score1 = score;
        } else {
          updatedMatch.score2 = score;
        }
        
        // Determine winner if both scores are set
        if (updatedMatch.score1 !== null && updatedMatch.score2 !== null) {
          updatedMatch.winnerId = updatedMatch.score1 > updatedMatch.score2 
            ? updatedMatch.team1?.id || null 
            : updatedMatch.team2?.id || null;
        }
        
        return updatedMatch;
      }
      return match;
    });

    // Update next match with winner
    const updatedTournament = { ...tournament, matches: updatedMatches };
    onUpdateTournament(updatedTournament);
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{tournament.name}</h2>
      
      {rounds.length === 0 ? (
        <div className="text-center py-8">
          <p>No matches available for this tournament.</p>
        </div>
      ) : (
        <div className="flex space-x-8 min-w-max">
          {rounds.map(round => (
            <div key={round} className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold text-center mb-4">
                {round === rounds.length ? 'Final' : `Round ${round}`}
              </h3>
              
              <div className="space-y-8">
                {matchesByRound[round].map(match => (
                  <div 
                    key={match.id} 
                    className={`border rounded-lg p-4 w-64 ${
                      getMatchStatus(match) === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : getMatchStatus(match) === 'in-progress' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Match {match.matchNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        getMatchStatus(match) === 'completed' 
                          ? 'bg-green-200 text-green-800' 
                          : getMatchStatus(match) === 'in-progress' 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-800'
                      }`}>
                        {getMatchStatus(match) === 'completed' ? 'Completed' : 
                         getMatchStatus(match) === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="truncate">{getTeamDisplay(match.team1)}</span>
                        <input
                          type="number"
                          min="0"
                          value={match.score1 ?? ''}
                          onChange={(e) => handleScoreUpdate(
                            match.id, 
                            'team1', 
                            e.target.value ? parseInt(e.target.value) : 0
                          )}
                          className="w-16 p-1 border rounded text-center"
                          disabled={!match.team1 || !match.team2}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="truncate">{getTeamDisplay(match.team2)}</span>
                        <input
                          type="number"
                          min="0"
                          value={match.score2 ?? ''}
                          onChange={(e) => handleScoreUpdate(
                            match.id, 
                            'team2', 
                            e.target.value ? parseInt(e.target.value) : 0
                          )}
                          className="w-16 p-1 border rounded text-center"
                          disabled={!match.team1 || !match.team2}
                        />
                      </div>
                    </div>
                    
                    {match.winnerId && (
                      <div className="mt-2 text-center text-sm font-semibold text-green-600">
                        Winner: {tournament.teams.find(t => t.id === match.winnerId)?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;