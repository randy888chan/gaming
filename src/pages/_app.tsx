import '@/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { GambaProvider } from 'gamba-react-v2';
import { GambaPlatformProvider, TokenMetaProvider } from 'gamba-react-ui-v2';
import { 
  PLATFORM_CREATOR_ADDRESS, 
  PLATFORM_CREATOR_FEE, 
  PLATFORM_NAME, 
  PLATFORM_SHARABLE, 
  TOKENLIST,
  BASE_SEO_CONFIG,
  LIVE_EVENT_TOAST
} from '@/constants';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { ThemeProvider } from 'next-themes';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { 
  ConnectionProvider
} from '@solana/wallet-adapter-react';
import { 
  WalletModalProvider 
} from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter 
} from '@solana/wallet-adapter-wallets';
import { 
  Ethereum, 
  Polygon, 
  BNBChain, 
  Solana
} from "@particle-network/chains";
import { Toaster } from "sonner";
import dynamic from 'next/dynamic';

const DynamicParticleProviderWrapper = dynamic(
  () => import('@/components/ParticleProviderWrapper').then(mod => mod.ParticleProviderWrapper),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const evmChainsList = useMemo(() => [
    Ethereum, 
    Polygon, 
    BNBChain
  ], []);
  
  const solanaChainsList = useMemo(() => [Solana], []);
  const tonChainsList = useMemo(() => [], []);

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
        <DynamicParticleProviderWrapper
          wallets={wallets}
          sendTransactionConfig={{
            priorityFee: 200000
          }}
          PLATFORM_CREATOR_ADDRESS={PLATFORM_CREATOR_ADDRESS}
          PLATFORM_CREATOR_FEE={PLATFORM_CREATOR_FEE}
          PLATFORM_JACKPOT_FEE={0}
          PLATFORM_REFERRAL_FEE={0}
          BASE_SEO_CONFIG={BASE_SEO_CONFIG}
          LIVE_EVENT_TOAST={LIVE_EVENT_TOAST}
          showDisclaimer={showDisclaimer}
          DisclaimerModal={() => null}
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
                    defaultCreatorFee={PLATFORM_CREATOR_FEE}
                    defaultJackpotFee={0}
                  >
                    <Header />
                    <div className="min-h-[75vh] mt-20 mb-20">
                      <Component {...pageProps} />
                    </div>
                    <Footer />
                    <Toaster />
                    {showOnboarding && (
                      <OnboardingModal 
                        isOpen={showOnboarding} 
                        onClose={handleCloseOnboarding} 
                      />
                    )}
                    {showDisclaimer && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                          <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                          <p className="mb-4">
                            This is a gaming platform for entertainment purposes only. 
                            Please play responsibly and understand the risks involved.
                          </p>
                          <button
                            onClick={() => setShowDisclaimer(false)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            I Understand
                          </button>
                        </div>
                      </div>
                    )}
                  </GambaPlatformProvider>
                </GambaProvider>
              </TokenMetaProvider>
            </WalletModalProvider>
          </ConnectionProvider>
        </DynamicParticleProviderWrapper>
      </ThemeProvider>
    </>
  );
}

export default appWithTranslation(MyApp);