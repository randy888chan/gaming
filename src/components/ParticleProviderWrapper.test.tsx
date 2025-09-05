/**
 * Test for ParticleProviderWrapper component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the required modules
jest.mock("@particle-network/connectkit", () => ({
  ConnectKitProvider: ({ children }: any) => <div data-testid="connectkit-provider">{children}</div>,
  createConfig: jest.fn().mockReturnValue({}),
}));

jest.mock("@particle-network/connectkit/auth", () => ({
  authWalletConnectors: jest.fn().mockReturnValue({}),
}));

jest.mock("@particle-network/connectkit/wallet", () => ({
  wallet: jest.fn().mockReturnValue({}),
  EntryPosition: {
    BR: 'BR',
  },
}));

jest.mock("@solana/wallet-adapter-react", () => ({
  WalletProvider: ({ children }: any) => <div data-testid="wallet-provider">{children}</div>,
}));

jest.mock("@particle-network/chains", () => ({
  SolanaChain: jest.fn(),
  Ethereum: {},
  ZetaChainTestnet: {},
}));

jest.mock("gamba-react-v2", () => ({
  SendTransactionProvider: ({ children }: any) => <div data-testid="send-transaction-provider">{children}</div>,
}));

jest.mock("next/dynamic", () => (func: any) => {
  const Component = func().then((mod: any) => mod.TokenMetaProvider);
  return function MockTokenMetaProvider({ children }: any) {
    return <div data-testid="token-meta-provider">{children}</div>;
  };
});

jest.mock("@/constants", () => ({
  TOKENLIST: {},
}));

describe('ParticleProviderWrapper', () => {
  const mockProps = {
    children: <div>Test Children</div>,
    wallets: [],
    sendTransactionConfig: {},
    PLATFORM_CREATOR_ADDRESS: 'creator-address',
    PLATFORM_CREATOR_FEE: 0.01,
    PLATFORM_JACKPOT_FEE: 0.02,
    PLATFORM_REFERRAL_FEE: 0.03,
    BASE_SEO_CONFIG: {},
    LIVE_EVENT_TOAST: true,
    showDisclaimer: false,
    DisclaimerModal: () => <div>Disclaimer Modal</div>,
    OnboardingModal: () => <div>Onboarding Modal</div>,
    showOnboarding: false,
    handleCloseOnboarding: jest.fn(),
  };

  it('should render without crashing', async () => {
    const { ParticleProviderWrapper } = await import('./ParticleProviderWrapper');
    
    render(<ParticleProviderWrapper {...mockProps} />);
    
    expect(screen.getByTestId('connectkit-provider')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-provider')).toBeInTheDocument();
    expect(screen.getByTestId('token-meta-provider')).toBeInTheDocument();
    expect(screen.getByTestId('send-transaction-provider')).toBeInTheDocument();
  });

  it('should render children', async () => {
    const { ParticleProviderWrapper } = await import('./ParticleProviderWrapper');
    
    render(<ParticleProviderWrapper {...mockProps} />);
    
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('should call createConfig with correct parameters', async () => {
    const { createConfig } = await import("@particle-network/connectkit");
    
    const { ParticleProviderWrapper } = await import('./ParticleProviderWrapper');
    
    render(<ParticleProviderWrapper {...mockProps} />);
    
    expect(createConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: expect.any(String),
        clientKey: expect.any(String),
        appId: expect.any(String),
      })
    );
  });
});