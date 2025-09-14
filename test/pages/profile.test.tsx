import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './profile';

// Mock @particle-network/connectkit
jest.mock('@particle-network/connectkit', () => ({
  useAccount: () => ({
    address: 'test-address',
    isConnected: true
  })
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button 
      onClick={onClick} 
      data-testid={`button-${variant || 'default'}`}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, readOnly, className }: any) => (
    <input 
      value={value} 
      readOnly={readOnly} 
      className={className} 
      data-testid="input"
    />
  )
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon" />,
  Share2: () => <div data-testid="share-icon" />
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  },
  writable: true
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true
});

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders profile page with referral information', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Referral Program')).toBeInTheDocument();
    expect(screen.getByText('Your Referred Users')).toBeInTheDocument();
  });

  it('generates correct referral link', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('http://localhost:3000?ref=test-address');
  });

  it('copies referral link to clipboard when copy button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('button-outline')).toBeInTheDocument();
    });

    const copyButton = screen.getByTestId('button-outline');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000?ref=test-address');
    expect(screen.getByText('Referral link copied to clipboard!')).toBeInTheDocument();
  });

  it('shares referral link when share button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('button-default')).toBeInTheDocument();
    });

    const shareButton = screen.getByTestId('button-default');
    fireEvent.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Join me on Gamba Play!',
      text: 'Use my referral link to get started:',
      url: 'http://localhost:3000?ref=test-address',
    });
  });

  it('falls back to copy when share is not supported', async () => {
    // Mock navigator.share to be undefined
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('button-default')).toBeInTheDocument();
    });

    const shareButton = screen.getByTestId('button-default');
    fireEvent.click(shareButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000?ref=test-address');
  });

  it('displays referral stats when fetched', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100.50, unpaidBalance: 50.25 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('$100.50')).toBeInTheDocument();
    expect(screen.getByText('$50.25')).toBeInTheDocument();
  });

  it('displays referred users when fetched', async () => {
    const mockUsers = [
      { id: '1', username: 'User1', joinDate: '2023-01-01T00:00:00Z' },
      { id: '2', username: 'User2', joinDate: '2023-01-02T00:00:00Z' }
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: mockUsers })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();
  });

  it('shows message when no referred users', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 0, totalEarned: 0, unpaidBalance: 0 } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("You haven't referred any users yet.")).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching referred users', async () => {
    // Mock fetch to delay response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, stats: { referredCount: 5, totalEarned: 100, unpaidBalance: 50 } })
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        json: () => Promise.resolve({ success: true, referredUsers: [] })
      }), 100)));

    render(<ProfilePage />);

    expect(screen.getByText('Loading referred users...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading referred users...')).not.toBeInTheDocument();
    });
  });

  it('shows connect wallet message when not connected', () => {
    jest.mock('@particle-network/connectkit', () => ({
      useAccount: () => ({
        address: null,
        isConnected: false
      })
    }));

    render(<ProfilePage />);

    expect(screen.getByText('Please connect your wallet')).toBeInTheDocument();
    expect(screen.getByText('You need to connect your wallet to view your profile and referral information.')).toBeInTheDocument();
  });
});