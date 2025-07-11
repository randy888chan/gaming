import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  entryFee: string;
  entryCurrency: string;
  liquidityPoolName: string;
  polymarketEscrowId?: string;
}

const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("/api/v1/tournaments");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTournaments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Head>
        <title>Tournaments</title>
      </Head>
      <main>
        <h1>Active Tournaments</h1>
        {tournaments.length === 0 ? (
          <p>No active tournaments found.</p>
        ) : (
          <ul>
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link href={`/tournaments/${tournament.id}`}>
                  <a>
                    <h2>{tournament.name}</h2>
                    <p>Format: {tournament.format}</p>
                    <p>Status: {tournament.status}</p>
                    {tournament.entryFee && tournament.entryCurrency && (
                      <p>
                        Entry Fee: {tournament.entryFee}{" "}
                        {tournament.entryCurrency}
                      </p>
                    )}
                    {tournament.liquidityPoolName && (
                      <p>Liquidity Pool: {tournament.liquidityPoolName}</p>
                    )}
                    {tournament.polymarketEscrowId && (
                      <p>
                        Polymarket Escrow ID: {tournament.polymarketEscrowId}
                      </p>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default TournamentsPage;
