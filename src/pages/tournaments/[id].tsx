import React, { useState, useEffect } from "react";
import TournamentBracket from "../../components/tournament/TournamentBracket";
import { Tournament, Team, Match } from "../../types/tournament";
import { useRouter } from "next/router";

const TournamentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        
        // Fetch tournament details
        const tournamentRes = await fetch(`/api/v1/tournaments?id=${id}`);
        const tournamentData = await tournamentRes.json();
        
        if (!tournamentData.success) {
          throw new Error(tournamentData.error || "Failed to fetch tournament");
        }
        
        const tournament = tournamentData.tournament;
        
        // Fetch teams
        const teamsRes = await fetch(`/api/v1/tournaments/teams?tournamentId=${id}`);
        const teamsData = await teamsRes.json();
        
        if (!teamsData.success) {
          throw new Error(teamsData.error || "Failed to fetch teams");
        }
        
        const teams = teamsData.teams;
        
        // Fetch matches
        const matchesRes = await fetch(`/api/v1/tournaments/matches?tournamentId=${id}`);
        const matchesData = await matchesRes.json();
        
        if (!matchesData.success) {
          throw new Error(matchesData.error || "Failed to fetch matches");
        }
        
        const matches = matchesData.matches;
        
        // Construct tournament object
        const fullTournament: Tournament = {
          id: tournament.id,
          name: tournament.name,
          format: tournament.format,
          status: tournament.status || "upcoming",
          teams,
          matches,
          createdAt: tournament.createdAt || new Date(),
          updatedAt: tournament.updatedAt || new Date(),
        };
        
        setTournament(fullTournament);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching tournament data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id]);

  const handleUpdateTournament = async (updatedTournament: Tournament) => {
    try {
      // Update matches in the backend
      for (const match of updatedTournament.matches) {
        if (match.score1 !== null || match.score2 !== null) {
          await fetch('/api/v1/tournaments/matches', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: match.id,
              score1: match.score1,
              score2: match.score2,
              winnerId: match.winnerId,
            }),
          });
        }
      }
      
      setTournament(updatedTournament);
    } catch (err: any) {
      setError(err.message || "Failed to update tournament");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border-2 border-red-300 rounded-xl w-16 h-16 mb-4 flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tournament Not Found</h1>
          <p className="text-gray-600">The requested tournament could not be found.</p>
        </div>
      </div>
    );
  }

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