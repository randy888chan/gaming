import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MinesGame from '../../src/games/Mines';
import { GambaUi, useCurrentPool, useCurrentToken, useSound, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

// Mock Gamba hooks
jest.mock('gamba-react-v2', () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0 })),
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
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0 })),
    })),
    Select: ({ options, value, onChange, label }: { options: any[], value: any, onChange: (value: any) => void, label: (value: any) => React.ReactNode }) => (
      <select data-testid="mines-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{label(opt)}</option>
        ))}
      </select>
    ),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: 'SOL',
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: {
      tick: { player: { stop: jest.fn() } },
      step: { player: { loop: false, stop: jest.fn() } }, // Mock loop property
      explode: { player: { stop: jest.fn() } },
      win: { player: { stop: jest.fn() } },
      finish: { player: { stop: jest.fn() } },
    },
  })),
  useWagerInput: jest.fn(() => [1, jest.fn()]),
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Mock GambaPlayButton as it's used in MinesGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid="gamba-play-button" disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

describe('Mines Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: {
        tick: { player: { stop: jest.fn() } },
        step: { player: { loop: false, stop: jest.fn() } },
        explode: { player: { stop: jest.fn() } },
        win: { player: { stop: jest.fn() } },
        finish: { player: { stop: jest.fn() } },
      },
    });
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders MinesGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<MinesGame />);
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Mines:')).toBeInTheDocument();
  });

  test('simulates starting a game and revealing a gold cell', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 10, profit: 9, multiplier: 10 })), // Simulate win
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<MinesGame />);

    const playButton = screen.getByText('Play');
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Click on a cell to reveal it
    const cell = screen.getAllByRole('button')[0]; // Assuming the first button is a cell
    await act(async () => {
      fireEvent.click(cell);
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(screen.getByText('+9')).toBeInTheDocument(); // Check for profit display
  });

  test('simulates starting a game and hitting a mine', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0, profit: 0, multiplier: 0 })), // Simulate lose
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<MinesGame />);

    const playButton = screen.getByText('Play');
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Click on a cell to reveal it
    const cell = screen.getAllByRole('button')[0]; // Assuming the first button is a cell
    await act(async () => {
      fireEvent.click(cell);
    });

    expect(mockPlay).toHaveBeenCalled();
    // Expect the game to reset or show a "lose" state.
    // This will depend on how MinesGame visually indicates a loss.
    // For now, we'll check if the "Play" button reappears or if a "Reset" button is visible.
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('simulates changing the number of mines', async () => {
    render(<MinesGame />);

    const mineSelect = screen.getByTestId('mines-select');
    await act(async () => {
      fireEvent.change(mineSelect, { target: { value: '5' } }); // Change to 5 mines
    });

    expect(screen.getByText('5 Mines')).toBeInTheDocument();
  });
});