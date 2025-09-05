import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameToast from './useGameEvent';

// Mock gamba-core-v2
jest.mock('gamba-core-v2', () => ({
  BPS_PER_WHOLE: 10000
}));

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  TokenValue: ({ amount }: any) => <span>{amount}</span>,
  useTokenMeta: () => ({
    image: '/token-image.png',
    name: 'Test Token',
    symbol: 'TEST'
  })
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid="play-link">
      {children}
    </a>
  );
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock useGambaEventListener hook
const mockUseGambaEventListener = jest.fn();
jest.mock('gamba-react-v2', () => ({
  useGambaEventListener: mockUseGambaEventListener,
  useWallet: () => ({
    publicKey: { toString: () => 'test-user-public-key' }
  })
}));

// Mock extractMetadata utility
jest.mock('@/utils/RecentPlay', () => ({
  extractMetadata: () => ({
    game: { id: 'test-game', meta: { name: 'Test Game' } }
  })
}));

describe('useGameEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers GameSettled event listener', () => {
    render(<GameToast />);
    
    expect(mockUseGambaEventListener).toHaveBeenCalledWith('GameSettled', expect.any(Function));
  });

  it('shows success toast for winning game events', () => {
    const mockEvent = {
      signature: 'test-signature',
      data: {
        user: { toBase58: () => 'different-user-public-key' },
        wager: { toNumber: () => 100 },
        payout: { toNumber: () => 200 },
        jackpotPayoutToUser: { toNumber: () => 0 },
        bet: [20000],
        resultIndex: { toNumber: () => 0 },
        tokenMint: 'test-token-mint',
        creator: { toBase58: () => 'test-creator' }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    render(<GameToast />);
    
    expect(screen.getByText('different-user-public-key')).toBeInTheDocument();
    expect(screen.getByText('WON')).toBeInTheDocument();
  });

  it('shows error toast for losing game events', () => {
    const mockEvent = {
      signature: 'test-signature',
      data: {
        user: { toBase58: () => 'different-user-public-key' },
        wager: { toNumber: () => 100 },
        payout: { toNumber: () => 0 },
        jackpotPayoutToUser: { toNumber: () => 0 },
        bet: [0],
        resultIndex: { toNumber: () => 0 },
        tokenMint: 'test-token-mint',
        creator: { toBase58: () => 'test-creator' }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    render(<GameToast />);
    
    expect(screen.getByText('different-user-public-key')).toBeInTheDocument();
    expect(screen.getByText('LOST')).toBeInTheDocument();
  });

  it('does not show toast for events from the same user', () => {
    const mockEvent = {
      signature: 'test-signature',
      data: {
        user: { toBase58: () => 'test-user-public-key' },
        wager: { toNumber: () => 100 },
        payout: { toNumber: () => 200 },
        jackpotPayoutToUser: { toNumber: () => 0 },
        bet: [20000],
        resultIndex: { toNumber: () => 0 },
        tokenMint: 'test-token-mint',
        creator: { toBase58: () => 'test-creator' }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    render(<GameToast />);
    
    expect(screen.queryByText('test-user-public-key')).not.toBeInTheDocument();
  });

  it('renders jackpot payout when present', () => {
    const mockEvent = {
      signature: 'test-signature',
      data: {
        user: { toBase58: () => 'different-user-public-key' },
        wager: { toNumber: () => 100 },
        payout: { toNumber: () => 200 },
        jackpotPayoutToUser: { toNumber: () => 50 },
        bet: [20000],
        resultIndex: { toNumber: () => 0 },
        tokenMint: 'test-token-mint',
        creator: { toBase58: () => 'test-creator' }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    render(<GameToast />);
    
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('renders verify and play buttons', () => {
    const mockEvent = {
      signature: 'test-signature',
      data: {
        user: { toBase58: () => 'different-user-public-key' },
        wager: { toNumber: () => 100 },
        payout: { toNumber: () => 200 },
        jackpotPayoutToUser: { toNumber: () => 0 },
        bet: [20000],
        resultIndex: { toNumber: () => 0 },
        tokenMint: 'test-token-mint',
        creator: { toBase58: () => 'test-creator' }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    render(<GameToast />);
    
    expect(screen.getByText('Verify')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
  });
});