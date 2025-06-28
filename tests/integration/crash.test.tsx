import { render, screen, fireEvent } from '@testing-library/react';
import CrashGame from '../../src/games/Crash';
import { GambaUi, useCurrentPool, useCurrentToken, useSound, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

// Mock Gamba hooks
jest.mock('gamba-react-v2', () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0 })),
  })),
}));

jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    Portal: ({ children }: { children: React.ReactNode }) => children,
    WagerInput: ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
      return {
        'data-testid': 'wager-input',
        value: value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
      };
    },
    useGame: jest.fn(() => ({
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    })),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: 'SOL',
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: { music: { player: { stop: jest.fn() } } },
  })),
  useWagerInput: jest.fn(() => [1, jest.fn()]),
  TokenValue: ({ amount }: { amount: number }) => ({ children: amount }),
}));

describe('Crash Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders CrashGame component', () => {
    render(<CrashGame />);
    expect(screen.getByText('Place Bet')).toBeInTheDocument();
    expect(screen.getByText('Cash Out')).toBeInTheDocument();
  });

  test('simulates placing a bet', async () => {
    const mockPlay = jest.fn();
    const mockResult = jest.fn(() => Promise.resolve({ payout: 0 }));
    
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      play: mockPlay,
      result: mockResult,
    });

    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: mockResult,
    });

    render(<CrashGame />);

    const wagerInput = screen.getByTestId('wager-input');
    fireEvent.change(wagerInput, { target: { value: '10' } });

    const placeBetButton = screen.getByText('Place Bet');
    fireEvent.click(placeBetButton);

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: [2] }); // Assuming default multiplier target is 2
    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });

  test('simulates game crash', async () => {
    const mockPlay = jest.fn();
    const mockResult = jest.fn(() => Promise.resolve({ payout: 0 })); // Simulate crash (payout 0)

    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: true,
      play: mockPlay,
      result: mockResult,
    });

    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: mockResult,
    });

    render(<CrashGame />);

    const placeBetButton = screen.getByText('Place Bet');
    fireEvent.click(placeBetButton);

    // Simulate game ending (crash)
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow async operations to complete

    expect(screen.getByText(/x/)).toHaveStyle('color: #ff0000'); // Multiplier text turns red on crash
  });

  test('simulates game win', async () => {
    const mockPlay = jest.fn();
    const mockResult = jest.fn(() => Promise.resolve({ payout: 20 })); // Simulate win (payout > 0)

    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: true,
      play: mockPlay,
      result: mockResult,
    });

    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: mockResult,
    });

    render(<CrashGame />);

    const placeBetButton = screen.getByText('Place Bet');
    fireEvent.click(placeBetButton);

    // Simulate game ending (win)
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow async operations to complete

    expect(screen.getByText(/x/)).toHaveStyle('color: #00ff00'); // Multiplier text turns green on win
  });
});