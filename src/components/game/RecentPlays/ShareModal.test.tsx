import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShareModal } from './ShareModal';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock gamba-core-v2
jest.mock('gamba-core-v2', () => ({}));

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  TokenValue: ({ amount }: any) => <span>{amount}</span>,
  useTokenMeta: () => ({
    image: '/token-image.png'
  })
}));

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toBlob: (callback: any) => callback(new Blob())
  }))
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    write: jest.fn(() => Promise.resolve())
  },
  writable: true
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock Modal component
jest.mock('@/components/Modal', () => ({
  Modal: ({ children, onClose }: any) => (
    <div data-testid="share-modal">
      <button onClick={onClose} data-testid="close-modal">Close</button>
      {children}
    </div>
  )
}));

// Mock GambaButton component
jest.mock('@/components/GambaPlayButton', () => ({
  GambaButton: ({ onClick, children }: any) => (
    <button onClick={onClick} data-testid="gamba-button">
      {children}
    </button>
  )
}));

// Mock extractMetadata utility
jest.mock('@/utils/RecentPlay', () => ({
  extractMetadata: () => ({
    game: { id: 'test-game', meta: { name: 'Test Game' } },
    isFallback: false
  })
}));

describe('ShareModal', () => {
  const mockEvent = {
    signature: 'test-signature',
    data: {
      wager: { toNumber: () => 100 },
      payout: { 
        sub: () => ({ toNumber: () => 50 }),
        toNumber: () => 150
      },
      tokenMint: 'test-token-mint'
    },
    time: new Date().toISOString()
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders share modal with game information', () => {
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('calculates profit and percentage change correctly', () => {
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    // Profit = payout - wager = 150 - 100 = 50
    // Percentage change = profit / wager = 50 / 100 = 0.5 = 50%
    expect(screen.getByText('+50.00%')).toBeInTheDocument();
  });

  it('renders wager and payout information', () => {
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    expect(screen.getByText('100')).toBeInTheDocument(); // Wager
    expect(screen.getByText('150')).toBeInTheDocument(); // Payout
    expect(screen.getByText('+50')).toBeInTheDocument(); // Profit
  });

  it('calls onClose when close button is clicked', () => {
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('copies image to clipboard when copy button is clicked', async () => {
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    const copyButton = screen.getByText('Copy as image');
    fireEvent.click(copyButton);
    
    // Wait for async operations to complete
    await screen.findByText('Copy as image');
    
    expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
    expect(screen.getByText('📋 Copied image to clipboard. You can paste it in Twitter or Telegram etc.')).toBeInTheDocument();
  });

  it('navigates to game when play again button is clicked', () => {
    const mockPush = jest.fn();
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: mockPush
      })
    }));
    
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    const playAgainButton = screen.getByText('Play again');
    fireEvent.click(playAgainButton);
    
    expect(mockPush).toHaveBeenCalledWith('/play/test-game');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shares to social media when share buttons are clicked', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ success: true })
    })) as jest.Mock;
    
    render(<ShareModal event={mockEvent} onClose={mockOnClose} />);
    
    // Test Twitter share
    const twitterButton = screen.getByText('Share on Twitter');
    fireEvent.click(twitterButton);
    
    // Wait for async operations to complete
    await screen.findByText('Share on Twitter');
    
    expect(global.fetch).toHaveBeenCalledWith('/api/social-post', expect.any(Object));
    expect(screen.getByText('Successfully shared on twitter!')).toBeInTheDocument();
  });
});