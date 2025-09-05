import '@/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { GambaProvider } from 'gamba-react-v2';
import { GambaPlatformProvider, TokenMetaProvider } from 'gamba-react-ui-v2';
import { 
  PLATFORM_CREATOR_ADDRESS, 
  PLATFORM_CREATOR_FEE, 
  PLATFORM_NAME, 
  PLATFORM_SHARABLE, 
  TOKENLIST 
} from '@/constants';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BASE_SEO_CONFIG } from '@/config';
import { GambaTransactions } from '@/components/GambaTransactions';
import { GameToast } from '@/components/GameToast';
import { GameProvider } from '@/hooks/useGame';
import { GameBundleProvider } from '@/hooks/useGameBundle';
import { ParticleProviderWrapper } from '@/components/ParticleProviderWrapper';
import { ThemeProvider } from 'next-themes';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { GameHistory } from '@/components/GameHistory';
import { 
  ConnectionProvider, 
  WalletModalProvider 
} from '@solana/wallet-adapter-react';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter 
} from '@solana/wallet-adapter-wallets';
import { 
  evmChains, 
  solanaChains, 
  tonChains 
} from "@particle-network/chains";
import { Toaster } from "sonner";
import { PublicKey } from "@solana/web3.js";

function MyApp({ Component, pageProps }: AppProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const evmChainsList = useMemo(() => [
    evmChains.ethereum, 
    evmChains.polygon, 
    evmChains.bsc
  ], []);
  
  const solanaChainsList = useMemo(() => [solanaChains.solana], []);
  const tonChainsList = useMemo(() => [tonChains.ton], []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding', 'true');
  };

  useEffect(() => {
    const storedDisclaimer = localStorage.getItem('disclaimer');
    const storedOnboarding = localStorage.getItem('onboarding');
    
    if (!storedDisclaimer) setShowDisclaimer(true);
    if (!storedOnboarding) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ], []);

  return (
    <>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ParticleProviderWrapper
          wallets={wallets}
          sendTransactionConfig={{
            priorityFee: 200000
          }}
          PLATFORM_CREATOR_ADDRESS={PLATFORM_CREATOR_ADDRESS}
          PLATFORM_CREATOR_FEE={PLATFORM_CREATOR_FEE}
          PLATFORM_NAME={PLATFORM_NAME}
          PLATFORM_SHARABLE={PLATFORM_SHARABLE}
          TOKENLIST={TOKENLIST}
          showDisclaimer={showDisclaimer}
          DisclaimerModal={DisclaimerModal}
          OnboardingModal={OnboardingModal}
          showOnboarding={showOnboarding}
          handleCloseOnboarding={handleCloseOnboarding}
        >
          <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_RPC_ENDPOINT!}>
            <WalletModalProvider>
              <TokenMetaProvider tokens={TOKENLIST}>
                <GambaProvider>
                  <GambaPlatformProvider
                    creator={PLATFORM_CREATOR_ADDRESS}
                    fee={PLATFORM_CREATOR_FEE}
                    jackpotFee={0}
                    referralFee={0}
                    tokenMetas={TOKENLIST}
                  >
                    <GameBundleProvider>
                      <GameProvider>
                        <Header />
                        <div className="min-h-[75vh] mt-20 mb-20">
                          <Component {...pageProps} />
                        </div>
                        <Footer />
                        <GameToast />
                        <GambaTransactions />
                        <GameHistory />
                        <Toaster />
                        {showOnboarding && (
                          <OnboardingModal 
                            isOpen={showOnboarding} 
                            onClose={handleCloseOnboarding} 
                          />
                        )}
                        {showDisclaimer && (
                          <DisclaimerModal 
                            isOpen={showDisclaimer} 
                            onClose={() => setShowDisclaimer(false)} 
                          />
                        )}
                      </GameProvider>
                    </GameBundleProvider>
                  </GambaPlatformProvider>
                </GambaProvider>
              </TokenMetaProvider>
            </WalletModalProvider>
          </ConnectionProvider>
        </ParticleProviderWrapper>
      </ThemeProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
