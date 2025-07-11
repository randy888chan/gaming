import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import TournamentBracket from "../../components/tournament/TournamentBracket";

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
}

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

const TournamentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch tournament details
        const tournamentResponse = await fetch(`/api/v1/tournaments?id=${id}`);
        if (!tournamentResponse.ok) {
          throw new Error(`HTTP error! status: ${tournamentResponse.status}`);
        }
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData);

        // Fetch teams for the tournament
        const teamsResponse = await fetch(
          `/api/v1/tournaments/teams?tournament_id=${id}`
        );
        if (!teamsResponse.ok) {
          throw new Error(`HTTP error! status: ${teamsResponse.status}`);
        }
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);

        // Fetch matches for the tournament
        const matchesResponse = await fetch(
          `/api/v1/tournaments/matches?tournament_id=${id}`
        );
        if (!matchesResponse.ok) {
          throw new Error(`HTTP error! status: ${matchesResponse.status}`);
        }
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading tournament details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tournament) {
    return <div>Tournament not found.</div>;
  }

  return (
    <div>
      <Head>
        <title>{tournament.name} Bracket</title>
      </Head>
      <main>
        <h1>{tournament.name}</h1>
        <p>Format: {tournament.format}</p>
        <p>Status: {tournament.status}</p>

        <TournamentBracket teams={teams} matches={matches} />
      </main>
    </div>
  );
};

export default TournamentDetailPage;
