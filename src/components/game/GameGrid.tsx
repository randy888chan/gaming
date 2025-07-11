// src/components/game/GameGrid.tsx

import { GAMES } from "@/games";
import { GameCard } from "./GameCard";
import React from "react";
import { Leaderboard } from "./Leaderboard";

// Example data for the leaderboard
const exampleLeaderboardEntries = [
  { rank: 1, username: "CryptoKing", score: 15000 },
  { rank: 2, username: "GamerX", score: 12000 },
  { rank: 3, username: "BetMaster", score: 10000 },
  { rank: 4, username: "LuckyLuke", score: 8000 },
  { rank: 5, username: "DegenDiva", score: 7500 },
];

export function GameGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {GAMES.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
      <Leaderboard title="Top Players" entries={exampleLeaderboardEntries} />
    </div>
  );
}
