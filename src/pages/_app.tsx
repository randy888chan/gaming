// src/pages/_app.tsx
import "@/styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import {
  BASE_SEO_CONFIG,
  LIVE_EVENT_TOAST,
  PLATFORM_CREATOR_FEE,
  PLATFORM_JACKPOT_FEE,
  PLATFORM_REFERRAL_FEE,
  TOKENLIST,
} from "../constants";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"; // New import
import { GambaProvider, SendTransactionProvider } from "gamba-react-v2";

import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import Footer from "@/components/layout/Footer";
import GameToast from "@/hooks/useGameEvent";
import dynamic from "next/dynamic";

import { ParticleProviderWrapper } from "@/components/ParticleProviderWrapper";

const GambaPlatformProvider = dynamic(
  () => import("gamba-react-ui-v2").then((mod) => mod.GambaPlatformProvider),
  { ssr: false }
);
import Header from "@/components/layout/Header";
import { PublicKey } from "@solana/web3.js";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

const DynamicTokenMetaProvider = dynamic(
  () => import("gamba-react-ui-v2").then((mod) => mod.TokenMetaProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  const { showDisclaimer, DisclaimerModal } = useDisclaimer();
  const { isPriorityFeeEnabled, priorityFee, set } = useUserStore((state) => ({
    isPriorityFeeEnabled: state.isPriorityFeeEnabled,
    priorityFee: state.priorityFee,
    set: state.set,
  }));

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    console.log('[_app.tsx] onboardingCompleted from localStorage:', onboardingCompleted);
    if (!onboardingCompleted) {
      setShowOnboarding(true);
      console.log('[_app.tsx] Setting showOnboarding to true');
    } else {
      console.log('[_app.tsx] onboardingCompleted found, showOnboarding remains false');
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  const sendTransactionConfig = isPriorityFeeEnabled ? { priorityFee } : {};

  const RPC_ENDPOINT = "https://api.devnet.solana.com";

  const PLATFORM_CREATOR_ADDRESS = new PublicKey(
    process.env.NEXT_PUBLIC_PLATFORM_CREATOR || PublicKey.default.toBase58()
  );

  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider
      endpoint={RPC_ENDPOINT}
      config={{ commitment: "processed" }}
    >
      <WalletModalProvider> {/* Added WalletModalProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ParticleProviderWrapper
            wallets={wallets}
            sendTransactionConfig={sendTransactionConfig}
            PLATFORM_CREATOR_ADDRESS={PLATFORM_CREATOR_ADDRESS}
            PLATFORM_CREATOR_FEE={PLATFORM_CREATOR_FEE}
            PLATFORM_JACKPOT_FEE={PLATFORM_JACKPOT_FEE}
            PLATFORM_REFERRAL_FEE={PLATFORM_REFERRAL_FEE}
            BASE_SEO_CONFIG={BASE_SEO_CONFIG}
            LIVE_EVENT_TOAST={LIVE_EVENT_TOAST}
            showDisclaimer={showDisclaimer}
            DisclaimerModal={DisclaimerModal}
            OnboardingModal={OnboardingModal}
            showOnboarding={showOnboarding}
            handleCloseOnboarding={handleCloseOnboarding}
          >
            <GambaProvider>
              <GambaPlatformProvider
                creator={PLATFORM_CREATOR_ADDRESS}
                defaultCreatorFee={PLATFORM_CREATOR_FEE}
                defaultJackpotFee={PLATFORM_JACKPOT_FEE}
                referral={{
                  fee: PLATFORM_REFERRAL_FEE,
                  prefix: "code",
                }}
              >
                <Header />
                <DefaultSeo {...BASE_SEO_CONFIG} />
                <main className="pt-12">
                <Component {...pageProps} />
                </main>
                <Footer />
                <Toaster
                  position="bottom-right"
                  richColors
                  toastOptions={{
                    style: {
                      backgroundImage:
                        "linear-gradient(to bottom right, #1e3a8a, #6b21a8)",
                    },
                  }}
                />
                {LIVE_EVENT_TOAST && <GameToast />}
                {showDisclaimer && <DisclaimerModal />}
                <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
              </GambaPlatformProvider>
            </GambaProvider>
          </SendTransactionProvider>
        </ParticleProviderWrapper>
      </ThemeProvider>
    </WalletModalProvider> {/* Added WalletModalProvider closing tag */}
    </ConnectionProvider>
  );
}

export default MyApp;
