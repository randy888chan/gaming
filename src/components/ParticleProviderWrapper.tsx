"use client";

import React, { useMemo } from "react";
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import { wallet, EntryPosition } from "@particle-network/connectkit/wallet";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { TOKENLIST } from "@/constants";
import { SolanaChain, Ethereum } from "@particle-network/chains";
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
  OnboardingModal: React.ComponentType<{ isOpen: boolean; onClose: () => void }>;
  showOnboarding: boolean;
  handleCloseOnboarding: () => void;
}

export const ParticleProviderWrapper: React.FC<ParticleProviderWrapperProps> = ({
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
        Ethereum,
        new SolanaChain({
          id: 101, // Mainnet-beta
          name: 'Solana',
          rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        }),
        // Example for ZetaChain Athens 3 Testnet (EVM)
        // You'll need to ensure Particle Network supports ZetaChain or use a generic EVM configuration if available.
        // For now, let's represent it with a generic EVM structure if Particle allows custom EVM chains.
        // This might need adjustment based on Particle's exact ZetaChain support.
        // Looking at https://developers.particle.network/guides/integrations/partners/zetachain
        // and https://www.zetachain.com/docs/reference/network/api/
        // Particle Connect Kit might not have a pre-defined ZetaChain object.
        // We will use a generic EVM configuration if Particle supports it,
        // otherwise, we might need to wait for official support or use Particle's Wallet SDK more directly for ZetaChain.
        // For now, let's assume we can add it like other EVM chains if we have the chainId and rpcUrl.
        // ZetaChain Athens 3 Testnet: Chain ID 7001
        // RPC: https://zetachain-athens-evm.blockpi.network/v1/rpc/public
        // This is a placeholder, actual integration might require specific Particle Network adapter for ZetaChain
        // or using their generic EVM capabilities.
        {
          id: 7001,
          name: 'ZetaChain Athens 3',
          network: 'zetachain-athens-3',
          nativeCurrency: { name: 'ZETA', decimals: 18, symbol: 'aZETA' },
          rpcUrls: {
            default: { http: [process.env.NEXT_PUBLIC_ZETA_TESTNET_RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
            public: { http: [process.env.NEXT_PUBLIC_ZETA_TESTNET_RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
          },
          blockExplorers: {
            default: { name: 'ZetaScan', url: 'https://athens3.explorer.zetachain.com' },
          },
          testnet: true,
        }
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