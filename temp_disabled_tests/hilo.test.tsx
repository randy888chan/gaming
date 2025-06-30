import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import HiLoGame from '../../src/games/HiLo';
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

// Mock GambaPlayButton as it's used in HiLoGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid="gamba-play-button" disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

describe('HiLo Game Component Integration Tests', () => {
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

  test('renders HiLoGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<HiLoGame logo="/games/hilo/logo.png" />);
    expect(screen.getByText('HiLo')).toBeInTheDocument();
    expect(screen.getByText('Higher')).toBeInTheDocument();
    expect(screen.getByText('Lower')).toBeInTheDocument();
  });

  test('simulates placing a bet on Higher', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText('Higher');
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: expect.any(Array) }); // Bet array will contain the selected card and prediction
  });

  test('simulates game win (Higher)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 20 })), // Simulate win
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText('Higher');
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect win condition to be visually represented
    expect(screen.getByText(/You won!/i)).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });

  test('simulates game lose (Higher)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })), // Simulate lose
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText('Higher');
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect lose condition to be visually represented
    expect(screen.getByText(/You lost!/i)).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });
});