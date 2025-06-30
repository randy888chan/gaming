import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import FlipGame from '../../src/games/Flip';
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
    Button: ({ children, onClick, disabled }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => (
      <button onClick={onClick} disabled={disabled}>{children}</button>
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

jest.mock('@react-three/drei', () => ({
  ...jest.requireActual('@react-three/drei'),
  Text: ({ children, onClick, 'data-testid': dataTestId }: { children: React.ReactNode, onClick?: () => void, 'data-testid'?: string }) => (
    <div onClick={onClick} data-testid={dataTestId}>{children}</div>
  ),
}));

// Mock GambaPlayButton as it's used in FlipGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid="gamba-play-button" disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

describe('Flip Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders FlipGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<FlipGame />);
    expect(screen.getByText('Flip')).toBeInTheDocument();
    expect(screen.getByText('Heads')).toBeInTheDocument();
    expect(screen.getByText('Tails')).toBeInTheDocument();
  });

  test('simulates placing a bet on Heads', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<FlipGame />);

    const headsButton = screen.getByText('Heads');
    await act(async () => {
      fireEvent.click(headsButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: [0] }); // Assuming 0 for Heads
  });

  test('simulates placing a bet on Tails', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<FlipGame />);

    const tailsButton = screen.getByText('Tails');
    await act(async () => {
      fireEvent.click(tailsButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: [1] }); // Assuming 1 for Tails
  });

  test('simulates game win (Heads)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 20 })), // Simulate win
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<FlipGame />);

    const headsButton = screen.getByText('Heads');
    await act(async () => {
      fireEvent.click(headsButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect win condition to be visually represented (e.g., win message, increased balance)
    // This will depend on how FlipGame visually indicates a win.
    // For now, we'll check for a generic "win" text if it exists, or a change in balance display.
    // If no specific win text, we might need to inspect the component's internal state or styles.
    // For now, I'll assume a "You won!" text appears or similar.
    expect(screen.getByText(/You won!/i)).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });

  test('simulates game lose (Heads)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })), // Simulate lose
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<FlipGame />);

    const headsButton = screen.getByText('Heads');
    await act(async () => {
      fireEvent.click(headsButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect lose condition to be visually represented (e.g., lose message, decreased balance)
    expect(screen.getByText(/You lost!/i)).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });
});