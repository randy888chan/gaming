import React from "react";

interface Team {
  id: string;
  tournament_id: string;
  name: string;
  players: string[];
}

interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  team1_id: string | null;
  team2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  next_match_id: string | null;
}

interface TournamentBracketProps {
  teams: Team[];
  matches: Match[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  teams,
  matches,
}) => {
  // For MVP, a very basic rendering of matches. This is a dummy change to trigger TS re-evaluation.
  // A full bracket rendering would involve more complex logic to arrange matches by round and connect them.

  if (!matches || matches.length === 0) {
    return <div>No matches to display for this tournament yet.</div>;
  }

  // Group matches by round
  const matchesByRound: { [key: number]: Match[] } = matches.reduce(
    (acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    },
    {} as { [key: number]: Match[] }
  );

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return "TBD";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  return (
    <div className="tournament-bracket">
      <h2>Tournament Bracket</h2>
      {Object.keys(matchesByRound)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((roundNum) => (
          <div key={roundNum} className="round">
            <h3>Round {roundNum}</h3>
            {matchesByRound[parseInt(roundNum)].map((match) => (
              <div key={match.id} className="match">
                <p>Match {match.match_number}</p>
                <p>
                  {getTeamName(match.team1_id)} vs {getTeamName(match.team2_id)}
                </p>
                {match.winner_id && (
                  <p>Winner: {getTeamName(match.winner_id)}</p>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default TournamentBracket;
