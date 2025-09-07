"use client";

import React, { useMemo } from "react";
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/auth-connectors";
import { wallet, EntryPosition } from "@particle-network/wallet-plugin";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { TOKENLIST } from "@/constants";
import { mainnet, zetachainAthensTestnet } from "viem/chains";
import { SendTransactionProvider } from "gamba-react-v2"; // Assuming this is the correct provider
import dynamic from "next/dynamic";

const DynamicTokenMetaProvider = dynamic(
  () => import("gamba-react-ui-v2").then((mod) => mod.TokenMetaProvider),
  { ssr: false }
);

interface ParticleProviderWrapperProps {
  children: React.ReactNode;
  wallets: any[]; // Pass the wallets array from _app.tsx
  sendTransactionConfig: any; // Pass sendTransactionConfig
  PLATFORM_CREATOR_ADDRESS: any; // Pass PLATFORM_CREATOR_ADDRESS
  PLATFORM_CREATOR_FEE: number;
  PLATFORM_JACKPOT_FEE: number;
  PLATFORM_REFERRAL_FEE: number;
  BASE_SEO_CONFIG: any;
  LIVE_EVENT_TOAST: boolean;
  showDisclaimer: boolean;
  DisclaimerModal: React.ComponentType;
  OnboardingModal: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
  }>;
  showOnboarding: boolean;
  handleCloseOnboarding: () => void;
}

export const ParticleProviderWrapper: React.FC<
  ParticleProviderWrapperProps
> = ({
  children,
  wallets,
  sendTransactionConfig,
  PLATFORM_CREATOR_ADDRESS,
  PLATFORM_CREATOR_FEE,
  PLATFORM_JACKPOT_FEE,
  PLATFORM_REFERRAL_FEE,
  BASE_SEO_CONFIG,
  LIVE_EVENT_TOAST,
  showDisclaimer,
  DisclaimerModal,
  OnboardingModal,
  showOnboarding,
  handleCloseOnboarding,
}) => {
  const particleConnectkitConfig = useMemo(() => {
    return createConfig({
      projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
      clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
      appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
      walletConnectors: [
        authWalletConnectors({
          authTypes: ["google", "apple", "twitter", "github"],
        }),
      ],
      plugins: [
        wallet({
          visible: true,
          entryPosition: EntryPosition.BR,
        }),
      ],
      chains: [
        mainnet,
        zetachainAthensTestnet,
      ],
    });
  }, []);

  return (
    <ConnectKitProvider config={particleConnectkitConfig}>
      <WalletProvider autoConnect wallets={wallets}>
        <DynamicTokenMetaProvider tokens={TOKENLIST}>
          <SendTransactionProvider {...sendTransactionConfig}>
            {children}
          </SendTransactionProvider>
        </DynamicTokenMetaProvider>
      </WalletProvider>
    </ConnectKitProvider>
  );
};