import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketList from './MarketList';

// Mock the Particle Network hooks
jest.mock('@particle-network/connectkit', () => ({
  useAccount: () => ({
    address: '0x1234567890abcdef1234567890abcdef12345678',
    isConnected: true
  })
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the fetch API
global.fetch = jest.fn();

describe('MarketList', () => {
  const mockMarkets = [
    {
      id: '1',
      title: 'Will it rain tomorrow?',
      volume: 10000,
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      outcomes: [
        { name: 'Yes', probability: 0.6 },
        { name: 'No', probability: 0.4 }
      ],
      category: 'Weather',
      status: 'active'
    },
    {
      id: '2',
      title: 'Election Results',
      volume: 50000,
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      outcomes: [
        { name: 'Candidate A', probability: 0.55 },
        { name: 'Candidate B', probability: 0.45 }
      ],
      category: 'Politics',
      status: 'active'
    }
  ];

  const mockSmartBetSuggestion = {
    marketId: '1',
    outcome: 'Yes',
    suggestedBetAmount: 50,
    confidenceScore: 0.8,
    reasoning: 'High confidence based on weather patterns'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<MarketList />);
    expect(screen.getByText('Loading markets...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error Loading Markets/)).toBeInTheDocument();
    });
  });

  it('renders markets when fetch succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, markets: mockMarkets })
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Election Results')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
  });

  it('filters markets by category', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, markets: mockMarkets })
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    // Filter by Weather category
    const categoryFilter = screen.getByLabelText('Filter by category');
    fireEvent.click(categoryFilter);
    const weatherOption = screen.getByText('Weather');
    fireEvent.click(weatherOption);

    expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    expect(screen.queryByText('Election Results')).not.toBeInTheDocument();
  });

  it('filters markets by status', async () => {
    const resolvedMarket = {
      ...mockMarkets[0],
      status: 'resolved'
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, markets: [mockMarkets[0], resolvedMarket] })
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    // Filter by active status
    const statusFilter = screen.getByLabelText('Filter by status');
    fireEvent.click(statusFilter);
    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);

    expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    expect(screen.queryByText('Election Results')).toBeInTheDocument();
  });

  it('sorts markets by volume', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, markets: mockMarkets })
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    // Sort by volume descending
    const sortBy = screen.getByLabelText('Sort markets');
    fireEvent.click(sortBy);
    const volumeDescOption = screen.getByText('Volume: High to Low');
    fireEvent.click(volumeDescOption);

    // The order should be maintained as Election Results has higher volume
    const marketCards = screen.getAllByRole('heading', { level: 1 });
    expect(marketCards[0]).toHaveTextContent('Election Results');
    expect(marketCards[1]).toHaveTextContent('Will it rain tomorrow?');
  });

  it('searches markets by query', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, markets: mockMarkets })
    });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    // Search for "Election"
    const searchInput = screen.getByLabelText('Search prediction markets');
    fireEvent.change(searchInput, { target: { value: 'Election' } });

    expect(screen.getByText('Election Results')).toBeInTheDocument();
    expect(screen.queryByText('Will it rain tomorrow?')).not.toBeInTheDocument();
  });

  it('gets smart bet suggestion', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, markets: [mockMarkets[0]] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSmartBetSuggestion)
      });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    const smartBetButton = screen.getByText('Get Smart Bet');
    fireEvent.click(smartBetButton);

    await waitFor(() => {
      expect(screen.getByText(/AI Suggestion: Bet on "Yes"/)).toBeInTheDocument();
    });
  });

  it('shows error when getting smart bet suggestion fails', async () => {
    // Mock window.alert
    const mockAlert = jest.fn();
    window.alert = mockAlert;

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, markets: [mockMarkets[0]] })
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

    render(<MarketList />);
    
    await waitFor(() => {
      expect(screen.getByText('Will it rain tomorrow?')).toBeInTheDocument();
    });

    const smartBetButton = screen.getByText('Get Smart Bet');
    fireEvent.click(smartBetButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to get smart bet suggestion. Please try again.');
    });
  });
});