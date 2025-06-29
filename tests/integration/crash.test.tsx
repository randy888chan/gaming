// tests/integration/crash.test.tsx
import React from 'react';
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
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
    WagerInput: ({ value, onChange }: { value: number, onChange: (value: number) => void }) => (
      <input
        data-testid="wager-input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
      />
    ),
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
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

describe('Crash Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders CrashGame component', () => {
    render(<CrashGame />);
    // Corrected to check for the "Play" button
    expect(screen.getByText('Play')).toBeInTheDocument();
    // Checks for the initial multiplier text
    expect(screen.getByText('0.00x')).toBeInTheDocument();
  });

  test('simulates placing a bet', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
        play: mockPlay,
        result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });

    const setWager = jest.fn();
    (useWagerInput as jest.Mock).mockReturnValue([10, setWager]);

    render(<CrashGame />);

    const playButton = screen.getByText('Play');
    expect(playButton).not.toBeDisabled();
    fireEvent.click(playButton);

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: expect.any(Array) });
  });

  // Note: The win/loss simulation tests are conceptually fine, the main blocker was the ReferenceError.
  // They should pass after adding the React import and fixing the Jest config.
  test('simulates game crash', async () => {
    const mockPlay = jest.fn();
    const mockResult = jest.fn(() => Promise.resolve({ payout: 0 })); // Simulate crash

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

    fireEvent.click(screen.getByText('Play'));
    await new Promise(resolve => setTimeout(resolve, 100)); // wait for state updates

    // The component sets multiplier color to red on loss, this is a valid check
    expect(screen.getByText(/x/)).toHaveStyle('color: #ff0000');
  });

  test('simulates game win', async () => {
    const mockPlay = jest.fn();
    const mockResult = jest.fn(() => Promise.resolve({ payout: 20 })); // Simulate win

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

    fireEvent.click(screen.getByText('Play'));
    await new Promise(resolve => setTimeout(resolve, 100)); // wait for state updates

    // The component sets multiplier color to green on win
    expect(screen.getByText(/x/)).toHaveStyle('color: #00ff00');
  });
});
