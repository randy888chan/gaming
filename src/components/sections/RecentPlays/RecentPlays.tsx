// src/components/sections/RecentPlays/RecentPlays.tsx

import { BPS_PER_WHOLE, GambaTransaction } from "gamba-core-v2";
import { GambaUi, TokenValue, useTokenMeta } from "gamba-react-ui-v2";
import React, { useMemo, useState } from "react";

import { PLATFORM_EXPLORER_URL } from "../../../../config";
import { ShareModal } from "./ShareModal";
import { extractMetadata } from "@/utils/utils";
import { useRecentPlays } from "../../../hooks/useRecentPlays";

function TimeDiff({ time, suffix = "ago" }: { time: number; suffix?: string }) {
  const diff = Date.now() - time;
  const timeString = useMemo(() => {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours >= 1) {
      return `${hours}h ${suffix}`;
    }
    if (minutes >= 1) {
      return `${minutes}m ${suffix}`;
    }
    return "Just now";
  }, [diff, suffix]);

  return <span>{timeString}</span>;
}

function RecentPlay({ event }: { event: GambaTransaction<"GameSettled"> }) {
  const data = event.data;
  const token = useTokenMeta(data.tokenMint);

  const multiplier = data.bet[data.resultIndex.toNumber()] / BPS_PER_WHOLE;
  const wager = data.wager.toNumber();
  const payout = multiplier * wager;
  const profit = payout - wager;

  const { game } = extractMetadata(event);

  if (!game) {
    return null;
  }

  return (
    <>
      <img
        src={`/games/${game.id}/logo.png`}
        alt={`Splash for ${game.meta.name}`}
        width={64}
      />
      <div className="text-[#a079ff]">
        {data.user.toBase58().substring(0, 4)}...
      </div>
      <div className="hidden md:inline">{profit >= 0 ? " won " : " lost "}</div>
      <div
        className={`flex gap-2 items-center rounded-lg p-1 ${
          profit > 0 ? "bg-green-200/50" : "bg-white/10"
        }`}
      >
        <img src={token.image} width={24} className="rounded-full" />
        <TokenValue amount={Math.abs(profit)} mint={data.tokenMint} />
      </div>
      <div className="hidden md:flex flex-col">
        {profit > 0 && <div>({multiplier.toFixed(2)}x)</div>}
        {data.jackpotPayoutToUser.toNumber() > 0 && (
          <div className="animate-jackpotGradient flex gap-2 items-center text-black rounded-lg p-1">
            +
            <TokenValue
              mint={data.tokenMint}
              amount={data.jackpotPayoutToUser.toNumber()}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default function RecentPlays() {
  const [platformOnly, setPlatformOnly] = useState(true);
  const events = useRecentPlays(platformOnly);
  const [selectedGame, setSelectedGame] =
    useState<GambaTransaction<"GameSettled"> | null>(null);

  const togglePlatformView = () => setPlatformOnly(!platformOnly);

  return (
    <div className="w-full relative flex flex-col gap-2.5">
      <div className="mb-4 flex justify-center">
        <div className="flex items-center gap-4">
          
          {/* <GambaUi.Button
            onClick={() => setPlatformOnly(false)}
            main={!platformOnly}
          >
            All Gamba Events
          </GambaUi.Button> */}

          {/* <GambaUi.Switch
            checked={!platformOnly}
            onChange={togglePlatformView}
          /> */}
          
          {/* <GambaUi.Button
            onClick={() => setPlatformOnly(true)}
            main={platformOnly}
          >
            Platform Only
          </GambaUi.Button> */}
         
        </div>
      </div>

      {selectedGame && (
        <ShareModal
          event={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
      {events.length === 0 &&
        Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-lg animate-Skeleton bg-gray-300"
          ></div>
        ))}
      {events.map((tx, index) => (
        <button
          key={tx.signature + "-" + index}
          onClick={() => setSelectedGame(tx)}
          className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0f121b] hover:bg-[#131724] justify-between"
        >
          <div className="flex items-center gap-2">
            <RecentPlay event={tx} />
          </div>
          <TimeDiff time={tx.time} />
        </button>
      ))}
      {/* <GambaUi.Button
        main
        onClick={() =>
          window.open(
            platformOnly ? PLATFORM_EXPLORER_URL : "https://explorer.gamba.so/",
          )
        }
      >
        {platformOnly ? "🚀 Platform Explorer" : "🚀 Gamba Explorer"}
      </GambaUi.Button> */}
    </div>
  );
}
