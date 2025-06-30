import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import RouletteGame from '../../src/games/Roulette';
import { GambaUi, useCurrentPool, useCurrentToken, useSound, useTokenBalance } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';
import { bet, clearChips, results, selectedChip, totalChipValue } from '../../src/games/Roulette/signals';

// Mock Gamba hooks
jest.mock('gamba-react-v2', () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 0 })),
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
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 0 })),
    })),
    Select: ({ options, value, onChange, label }: { options: any[], value: any, onChange: (value: any) => void, label: (value: any) => React.ReactNode }) => (
      <select data-testid="roulette-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{label(opt)}</option>
        ))}
      </select>
    ),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
    maxPayout: 1000,
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: 'SOL',
    baseWager: 100,
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: { music: { player: { stop: jest.fn() } } },
  })),
  useTokenBalance: jest.fn(() => ({
    balance: 1000,
    bonusBalance: 0,
  })),
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Mock GambaPlayButton as it's used in RouletteGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid="gamba-play-button" disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

import { signal } from '@preact/signals-react';

// Mock internal components/signals
jest.mock('../../src/games/Roulette/signals', () => {
  const actual = jest.requireActual('../../src/games/Roulette/signals');
  const { signal } = jest.requireActual('@preact/signals-react');
  return {
    ...actual,
    bet: signal([]),
    clearChips: jest.fn(() => {
      actual.chipPlacements.value = {};
    }),
    results: signal([]),
    selectedChip: signal(1),
    totalChipValue: signal(0),
    addResult: jest.fn((result: number) => {
      actual.results.value = [...actual.results.value, result];
    }),
    addChips: jest.fn((id: string, amount: number) => {
      actual.chipPlacements.value = {
        ...actual.chipPlacements.value,
        [id]: (actual.chipPlacements.value[id] || 0) + amount,
      };
    }),
  };
});

jest.mock('../../src/games/Roulette/Table', () => ({
  Table: () => <div data-testid="roulette-table" onClick={() => {
    // Simulate placing a chip on a number (e.g., number 1)
    jest.requireMock('../../src/games/Roulette/signals').addChips('number-1', jest.requireMock('../../src/games/Roulette/signals').selectedChip.value);
  }}>Mock Roulette Table</div>,
}));

jest.mock('../../src/games/Roulette/Chip', () => ({
  Chip: ({ value }: { value: number }) => <span data-testid="chip-value">{value}</span>,
}));

describe('Roulette Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    // Reset signals before each test
    jest.requireMock('../../src/games/Roulette/signals').bet.value = [];
    jest.requireMock('../../src/games/Roulette/signals').results.value = [];
    jest.requireMock('../../src/games/Roulette/signals').selectedChip.value = 1;
    jest.requireMock('../../src/games/Roulette/signals').totalChipValue.value = 0;
    jest.requireMock('../../src/games/Roulette/signals').chipPlacements.value = {}; // Reset chip placements
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders RouletteGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<RouletteGame />);
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByTestId('roulette-table')).toBeInTheDocument();
  });

  test('simulates placing a bet and playing', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 0 })),
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<RouletteGame />);

    // Simulate placing a chip on the table (e.g., by clicking on the mocked table)
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    const playButton = screen.getByText('Play');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlayGame).toHaveBeenCalledWith({
      bet: expect.any(Array),
      wager: expect.any(Number),
    });
  });

  test('simulates clearing chips', async () => {
    render(<RouletteGame />);

    // Simulate placing a chip
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    // The totalChipValue is a computed signal, so we need to access its value
    expect(jest.requireMock('../../src/games/Roulette/signals').totalChipValue.value).toBeGreaterThan(0);

    const clearButton = screen.getByText('Clear');
    await act(async () => {
      fireEvent.click(clearButton);
    });

    expect(jest.requireMock('../../src/games/Roulette/signals').clearChips).toHaveBeenCalled();
    expect(jest.requireMock('../../src/games/Roulette/signals').totalChipValue.value).toBe(0); // Verify chips are cleared
  });

  test('simulates game win', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 200, resultIndex: 1 })), // Simulate win on number 1
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<RouletteGame />);

    // Simulate placing a chip on number 1
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    const playButton = screen.getByText('Play');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect result to be added and win sound played
    expect(jest.requireMock('../../src/games/Roulette/signals').results.value).toContain(1);
    // Further assertions for visual win indication would go here
  });

  test('simulates game lose', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 5 })), // Simulate lose (result is 5, but bet was on 1)
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<RouletteGame />);

    // Simulate placing a chip on number 1
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    const playButton = screen.getByText('Play');
    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect result to be added and lose sound played
    expect(jest.requireMock('../../src/games/Roulette/signals').results.value).toContain(5);
    // Further assertions for visual lose indication would go here
  });
});