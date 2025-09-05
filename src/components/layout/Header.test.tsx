/**
 * Test for Header component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    asPath: '/',
    locales: ['en', 'es'],
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaPlatformContext: {
    Provider: ({ children }: any) => <div>{children}</div>,
  },
  TokenValue: ({ amount }: any) => <span>{amount}</span>,
  useCurrentPool: () => ({
    publicKey: { toString: () => 'pool-key' },
    jackpotBalance: 1000000,
    poolFee: 5,
    liquidity: 5000000,
    minWager: 1000,
    maxPayout: 100000,
  }),
  useCurrentToken: () => ({
    image: '/token.png',
    symbol: 'TEST',
    name: 'Test Token',
    mint: 'test-mint',
  }),
  useTokenBalance: () => ({
    balance: 1000000,
    bonusBalance: 50000,
  }),
  useReferral: () => ({
    referrerAddress: null,
    isOnChain: false,
    referralStatus: 'inactive',
    referralLink: '',
    copyLinkToClipboard: jest.fn(),
    clearCache: jest.fn(),
  }),
}));

// Mock @particle-network/connectkit
jest.mock('@particle-network/connectkit', () => ({
  useAccount: () => ({
    address: 'test-address',
    connected: true,
  }),
}));

// Mock constants
jest.mock('@/constants', () => ({
  PLATFORM_REFERRAL_FEE: 0.05,
  TOKENLIST: {
    token1: {
      mint: 'token1-mint',
      name: 'Token 1',
      symbol: 'TKN1',
      image: '/token1.png',
    },
    token2: {
      mint: 'token2-mint',
      name: 'Token 2',
      symbol: 'TKN2',
      image: '/token2.png',
    },
  },
}));

// Mock components
jest.mock('@/components/NexusOrb', () => ({
  NexusOrb: ({ label, icon }: any) => (
    <div data-testid="nexus-orb">
      {icon}
      <span>{label}</span>
    </div>
  ),
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-testid="header-button" className={variant}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange }: any) => (
    <input value={value} onChange={onChange} data-testid="header-input" />
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="priority-fee-switch"
    />
  ),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogClose: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/hooks/useUserStore', () => ({
  useUserStore: () => ({
    isPriorityFeeEnabled: false,
    priorityFee: 1000,
    set: jest.fn(),
  }),
}));

jest.mock('@/components/layout/WalletConnectButton', () => ({
  WalletConnectButton: () => <button>Connect Wallet</button>,
}));

jest.mock('lucide-react', () => ({
  Home: () => <div>Home Icon</div>,
  User: () => <div>User Icon</div>,
  BarChart: () => <div>BarChart Icon</div>,
  Gamepad: () => <div>Gamepad Icon</div>,
  Info: () => <div>Info Icon</div>,
  Languages: () => <div>Languages Icon</div>,
  ChevronDown: () => <div>ChevronDown Icon</div>,
  ClipboardCopy: () => <div>ClipboardCopy Icon</div>,
  LogOut: () => <div>LogOut Icon</div>,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Header', () => {
  it('should render without crashing', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('Home Icon')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
    expect(screen.getByText('polymarket')).toBeInTheDocument();
    expect(screen.getByText('games')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('should render language selector', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should render token balance when connected', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('should render bonus balance when available', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('50000')).toBeInTheDocument();
  });

  it('should render jackpot balance when available', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('should render token selector with available tokens', () => {
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <Header />
      </GambaPlatformContext.Provider>
    );
    expect(screen.getByText('TKN1')).toBeInTheDocument();
    expect(screen.getByText('TKN2')).toBeInTheDocument();
  });
});