import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './index';

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  return function MockRecentPlays() {
    return <div data-testid="recent-plays">Recent Plays</div>;
  };
});

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  useReferral: () => ({
    copyLinkToClipboard: jest.fn()
  })
}));

// Mock @solana/wallet-adapter-react
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: { toString: () => 'test-public-key' }
  })
}));

// Mock @solana/wallet-adapter-react-ui
jest.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({
    setVisible: jest.fn()
  })
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}));

// Mock constants
jest.mock('@/constants', () => ({
  PLATFORM_REFERRAL_FEE: 0.05
}));

// Mock GameGrid component
jest.mock('@/components/game/GameGrid', () => ({
  GameGrid: () => <div data-testid="game-grid">Game Grid</div>
}));

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Welcome to Gamba')).toBeInTheDocument();
  });

  it('renders platform description', () => {
    render(<HomePage />);
    
    expect(screen.getByText('The gambleFi protocol with end-to-end tools for on-chain degeneracy on Solana.')).toBeInTheDocument();
  });

  it('renders referral fee information', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Share your link to earn a 5% fee on each play when players use this platform using your code.')).toBeInTheDocument();
  });

  it('renders copy link button', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<HomePage />);
    
    expect(screen.getByText('👨‍💻 Build your own')).toBeInTheDocument();
    expect(screen.getByText('📖 Gamba Docs')).toBeInTheDocument();
    expect(screen.getByText('🌐 Explorer')).toBeInTheDocument();
    expect(screen.getByText('💬 Join Discord')).toBeInTheDocument();
  });

  it('renders GameGrid component', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('game-grid')).toBeInTheDocument();
  });

  it('renders RecentPlays component', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('recent-plays')).toBeInTheDocument();
  });

  it('calls copyLinkToClipboard when copy link button is clicked', () => {
    const mockCopyLinkToClipboard = jest.fn();
    jest.mock('gamba-react-ui-v2', () => ({
      useReferral: () => ({
        copyLinkToClipboard: mockCopyLinkToClipboard
      })
    }));
    
    render(<HomePage />);
    
    const copyLinkButton = screen.getByText('Copy Link');
    fireEvent.click(copyLinkButton);
    
    expect(mockCopyLinkToClipboard).toHaveBeenCalledTimes(1);
  });

  it('shows success toast when copy link button is clicked', () => {
    const mockToastSuccess = jest.fn();
    jest.mock('sonner', () => ({
      toast: {
        success: mockToastSuccess
      }
    }));
    
    render(<HomePage />);
    
    const copyLinkButton = screen.getByText('Copy Link');
    fireEvent.click(copyLinkButton);
    
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Copied! Share your link to earn a 5% fee when players use this platform'
    );
  });

  it('opens wallet modal when copy link button is clicked and wallet is not connected', () => {
    const mockSetVisible = jest.fn();
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => ({
        publicKey: null
      })
    }));
    
    jest.mock('@solana/wallet-adapter-react-ui', () => ({
      useWalletModal: () => ({
        setVisible: mockSetVisible
      })
    }));
    
    render(<HomePage />);
    
    const copyLinkButton = screen.getByText('Copy Link');
    fireEvent.click(copyLinkButton);
    
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });
});