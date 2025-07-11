// src/components/sections/Dashboard/GameCard.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GameBundle } from "gamba-react-ui-v2";
import { InsightShard } from "@/components/ui/insight-shard";
import { Flame, TrendingUp } from "lucide-react";

interface GameCardProps {
  game: GameBundle;
  key?: string | number;
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const small = router.pathname !== "/";
  const imagePath = `/games/${game.id}/logo.png`;
  const backgroundStyle = {
    aspectRatio: small ? "1 / 0.5" : "1 / 0.6",
    backgroundColor: game.meta.background,
  };

  return (
    <Link href={`/play/${game.id}`} passHref>
      <div className="relative">
        {" "}
        {/* Wrapper div */}
        <div
          className="cursor-pointer game-card w-full bg-cover bg-center rounded-lg text-white font-bold text-2xl"
          style={backgroundStyle}
          data-testid={`game-card-${game.id}`}
        >
          <div
            className="background absolute top-0 left-0 w-full h-full bg-size-100 bg-center bg-repeat"
            style={{ backgroundImage: "url(/stuff.png)" }}
          ></div>
          <div
            className="image absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-contain auto"
            style={{ backgroundImage: `url(${imagePath})` }}
          ></div>
          <div className="play absolute right-2 bottom-2 bg-black bg-opacity-40 rounded px-2 py-1 text-sm text-uppercase">
            Play {game.meta.name}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-2 z-10">
          <InsightShard
            title="Popularity"
            value="90%"
            icon={<Flame size={16} />}
            className="!p-2 !text-xs"
          />
          <InsightShard
            title="RTP"
            value="95%"
            icon={<TrendingUp size={16} />}
            className="!p-2 !text-xs"
          />
        </div>
      </div>
    </Link>
  );
}
