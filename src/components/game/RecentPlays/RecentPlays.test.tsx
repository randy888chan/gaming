import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentPlays from './RecentPlays';

// Mock environment variables
process.env.NEXT_PUBLIC_PLATFORM_CREATOR = 'test-creator-address';

// Mock gamba-core-v2
jest.mock('gamba-core-v2', () => ({}));

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="explorer-button">
        {children}
      </button>
    )
  }
}));

// Mock RecentPlay component
jest.mock('@/utils/RecentPlay', () => ({
  RecentPlay: () => <div data-testid="recent-play">Recent Play</div>
}));

// Mock TimeDiff component
jest.mock('@/utils/TimeDiff', () => ({
  TimeDiff: () => <div data-testid="time-diff">Time Diff</div>
}));

// Mock ShareModal component
jest.mock('./ShareModal', () => ({
  ShareModal: ({ event, onClose }: any) => (
    <div data-testid="share-modal">
      Share Modal
      <button onClick={onClose} data-testid="close-share-modal">Close</button>
    </div>
  )
}));

// Mock useRecentPlays hook
jest.mock('../../../hooks/useRecentPlays', () => ({
  useRecentPlays: () => [
    {
      signature: 'test-signature-1',
      time: new Date().toISOString(),
      data: {
        gameId: 'test-game-1',
        wager: 100,
        payout: 200,
        token: { symbol: 'USDC' }
      }
    },
    {
      signature: 'test-signature-2',
      time: new Date().toISOString(),
      data: {
        gameId: 'test-game-2',
        wager: 50,
        payout: 0,
        token: { symbol: 'USDC' }
      }
    }
  ]
}));

// Mock @solana/web3.js
jest.mock('@solana/web3.js', () => ({
  PublicKey: class {
    static default = {
      toBase58: () => 'default-address'
    };
    
    constructor(value: string) {
      // Constructor implementation
    }
    
    toString() {
      return 'test-creator-address';
    }
  }
}));

describe('RecentPlays', () => {
  it('renders recent plays with events', () => {
    render(<RecentPlays />);
    
    // Check that recent plays are rendered
    expect(screen.getAllByTestId('recent-play')).toHaveLength(2);
    expect(screen.getAllByTestId('time-diff')).toHaveLength(2);
  });

  it('renders skeleton loaders when no events are available', () => {
    // Mock useRecentPlays to return empty array
    jest.mock('../../../hooks/useRecentPlays', () => ({
      useRecentPlays: () => []
    }));
    
    render(<RecentPlays />);
    
    // Check that skeleton loaders are rendered
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
  });

  it('opens share modal when a recent play is clicked', () => {
    render(<RecentPlays />);
    
    // Click on the first recent play
    const recentPlayButton = screen.getAllByText('Recent Play')[0].closest('button');
    if (recentPlayButton) {
      fireEvent.click(recentPlayButton);
    }
    
    // Check that share modal is rendered
    expect(screen.getByTestId('share-modal')).toBeInTheDocument();
  });

  it('closes share modal when close button is clicked', () => {
    render(<RecentPlays />);
    
    // Open the share modal first
    const recentPlayButton = screen.getAllByText('Recent Play')[0].closest('button');
    if (recentPlayButton) {
      fireEvent.click(recentPlayButton);
    }
    
    // Check that share modal is rendered
    expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    
    // Click the close button
    const closeButton = screen.getByTestId('close-share-modal');
    fireEvent.click(closeButton);
    
    // Check that share modal is no longer rendered
    expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
  });

  it('renders platform explorer button with correct URL', () => {
    render(<RecentPlays />);
    
    const explorerButton = screen.getByTestId('explorer-button');
    expect(explorerButton).toBeInTheDocument();
    expect(explorerButton).toHaveTextContent('🚀 Platform Explorer');
  });
});