import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

interface Team {
  id: string;
  tournament_id: string;
  name: string;
  players: string[];
  avatarUrl?: string; // Added for participant avatars
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
  status: "upcoming" | "live" | "completed"; // Added for status indicator
  startTime: Date; // Added for start time
  odds?: { team1: number; team2: number }; // Added for odds display
}

interface TournamentBracketProps {
  teams: Team[];
  matches: Match[];
  isLoading?: boolean; // Added for loading state
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  teams,
  matches,
  isLoading = false,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const getTeam = (teamId: string | null) => {
    if (!teamId) return null;
    return teams.find((t) => t.id === teamId);
  };

  const getTeamName = (teamId: string | null) => {
    const team = getTeam(teamId);
    return team ? team.name : "TBD";
  };

  const getTeamAvatar = (teamId: string | null) => {
    const team = getTeam(teamId);
    return team?.avatarUrl || "/placeholder-avatar.png"; // Placeholder avatar
  };

  const handleMatchClick = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Tournament Bracket</h2>
        <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
          {[...Array(3)].map((_, roundIdx) => (
            <div key={roundIdx} className="flex-shrink-0 w-64 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              {[...Array(4)].map((_, matchIdx) => (
                <Card key={matchIdx} className="w-full">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Tournament Bracket</h2>
        <p>No active tournaments to display yet.</p>
        {/* TODO: Add link to create tournament */}
      </div>
    );
  }

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

  const sortedRoundNumbers = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const getStatusColor = (status: Match["status"]) => {
    switch (status) {
      case "upcoming":
        return "text-blue-500";
      case "live":
        return "text-green-500";
      case "completed":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tournament Bracket</h2>
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
        {sortedRoundNumbers.map((roundNum) => (
          <div key={roundNum} className="flex-shrink-0 w-64">
            <h3 className="text-xl font-semibold mb-2">Round {roundNum}</h3>
            <div className="space-y-4">
              {matchesByRound[roundNum].map((match) => (
                <Card
                  key={match.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    match.winner_id ? "border-green-500" : ""
                  }`}
                  onClick={() => handleMatchClick(match.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={getTeamAvatar(match.team1_id)} />
                          <AvatarFallback>
                            {getTeamName(match.team1_id).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getTeamName(match.team1_id)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {match.score1 !== null ? match.score1 : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={getTeamAvatar(match.team2_id)} />
                          <AvatarFallback>
                            {getTeamName(match.team2_id).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getTeamName(match.team2_id)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {match.score2 !== null ? match.score2 : "-"}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <p className={getStatusColor(match.status)}>
                        Status: {match.status}
                      </p>
                      <p>
                        Time: {match.startTime.toLocaleTimeString()} -{" "}
                        {match.startTime.toLocaleDateString()}
                      </p>
                      {match.odds && (
                        <p>
                          Odds: {match.odds.team1} / {match.odds.team2}
                        </p>
                      )}
                      {match.winner_id && (
                        <p className="font-semibold text-green-600">
                          Winner: {getTeamName(match.winner_id)}
                        </p>
                      )}
                    </div>
                    {expandedMatchId === match.id && (
                      <div className="mt-4">
                        <Button className="w-full">Place Bet</Button>
                        {/* TODO: Add more detailed match info here */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;
