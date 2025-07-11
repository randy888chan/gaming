// src/components/game/Leaderboard.tsx

import React from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
}

export function Leaderboard({ title, entries }: LeaderboardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left text-gray-400">Rank</th>
            <th className="text-left text-gray-400">Username</th>
            <th className="text-left text-gray-400">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank} className="border-t border-gray-700">
              <td className="py-2 text-white">{entry.rank}</td>
              <td className="py-2 text-white">{entry.username}</td>
              <td className="py-2 text-white">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
