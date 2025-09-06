// src/pages/index.tsx
import { GameGrid } from "@/components/game/GameGrid";
import { PLATFORM_REFERRAL_FEE } from "@/constants";
import dynamic from "next/dynamic";

const RecentPlays = dynamic(
  () => import("@/components/game/RecentPlays/RecentPlays"),
  { ssr: false }
);
import { toast } from "sonner";
import { useReferral } from "gamba-react-ui-v2";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <div>
      <h1>Gamba Platform</h1>
      <p>Welcome to the Gamba Platform!</p>
    </div>
  );
}
