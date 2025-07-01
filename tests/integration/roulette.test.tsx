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
    Select: ({ options, value, onChange, label }: { options: any[], value: any, onChange: (value: any) => void, label: (value: any) => React.ReactNode }) => (
      <select data-testid="roulette-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{label(opt)}</option>
        ))}
      </select>
    ),
    Responsive: ({ children }: { children: React.ReactNode }) => <div data-testid="gamba-ui-responsive">{children}</div>,
    useGame: jest.fn(() => ({ // Correctly placed inside GambaUi
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 0 })),
    })),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
    maxPayout: 50000, // Increased maxPayout
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
    <button data-testid={`gamba-play-button-${text.toLowerCase().replace(/\s+/g, '-')}`} disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

import { signal } from '@preact/signals-react';

// Mock internal components/signals
jest.mock('../../src/games/Roulette/signals', () => {
  const actual = jest.requireActual('../../src/games/Roulette/signals');
  const { signal } = jest.requireActual('@preact/signals-react'); // For selectedChip override

  const mockAddChipsFn = jest.fn((id: string, amount: number) => {
    console.log('[SPY MOCK signals] addChips called with id:', id, 'amount:', amount);
    actual.addChips(id, amount); // Call the REAL addChips
    console.log('[SPY MOCK signals] after actual.addChips, totalChipValue:', actual.totalChipValue.value, 'chipPlacements:', JSON.stringify(actual.chipPlacements.value), 'bet:', JSON.stringify(actual.bet.value));
  });

  const mockClearChipsFn = jest.fn(() => {
    console.log('[SPY MOCK signals] clearChips called');
    actual.clearChips(); // Call the REAL clearChips
    console.log('[SPY MOCK signals] after actual.clearChips, totalChipValue:', actual.totalChipValue.value);
  });

  const mockAddResultFn = jest.fn((result: number) => {
    console.log('[SPY MOCK signals] addResult called with:', result);
    actual.addResult(result); // Call the REAL addResult
  });

  return {
    ...actual, // Spread all actual signals and functions

    // Override only the functions we want to spy on
    addChips: mockAddChipsFn,
    clearChips: mockClearChipsFn,
    addResult: mockAddResultFn,

    // Override selectedChip because the test needs to set its initial value simply
    // All other signals (bet, chipPlacements, results, totalChipValue) will be the ACTUAL signals.
    selectedChip: signal(1),
  };
});

const mockTableAddChipsSpy = jest.fn();

// This mock must be defined AFTER the signals mock.
// The Table mock will use jest.requireMock to get the mocked signals.
jest.mock('../../src/games/Roulette/Table', () => ({
  Table: () => <div data-testid="roulette-table" onClick={() => {
    console.log('[TEST MOCK TABLE] onClick triggered');
    const signals = jest.requireMock('../../src/games/Roulette/signals');
    mockTableAddChipsSpy(signals.selectedChip.value);
    signals.addChips('1', signals.selectedChip.value);
  }}>Mock Roulette Table</div>,
}));

jest.mock('../../src/games/Roulette/Chip', () => ({
  Chip: ({ value }: { value: number }) => <span data-testid="chip-value">{value}</span>,
}));

const mockSignals = jest.requireMock('../../src/games/Roulette/signals');

describe('Roulette Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTableAddChipsSpy.mockClear(); // Clear spy calls
    jest.useFakeTimers();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    // Reset signals before each test
    mockSignals.selectedChip.value = 1;
    // Call our fully mocked clearChips to reset everything else to a known state
    mockSignals.clearChips();
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders RouletteGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<RouletteGame />);
    expect(screen.getByTestId('gamba-play-button-play')).toBeInTheDocument();
    expect(screen.getByTestId('gamba-play-button-clear')).toBeInTheDocument();
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
    const playButton = screen.getByTestId('gamba-play-button-play');
    expect(playButton).toBeDisabled(); // Should be disabled initially as totalChipValue is 0

    // Simulate placing a chip on the table (e.g., by clicking on the mocked table)
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable); // This calls addChips, totalChipValue becomes 1
    });

    // Wait for the Play button to become enabled and wager to update
    // totalChipValue becomes 10000. wager = (10000 * 100) / 10000 = 100.
    await waitFor(() => {
      expect(playButton).not.toBeDisabled();
      const wagerDisplay = screen.getByText('Wager').previousSibling; // This gets the TokenValue span
      expect(wagerDisplay).toHaveTextContent('100'); // Adjusted expected wager display
    });

    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlayGame).toHaveBeenCalledWith({
      bet: expect.any(Array), // bet content will be complex due to distribution, expect.any(Array) is fine for now
      wager: 100, // Adjusted expected wager
    });
  });

  test('simulates clearing chips', async () => {
    render(<RouletteGame />);

    // Simulate placing a chip
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    // totalChipValue should be 10000 after one chip (amount 1) is placed, due to scaling in distributedChips
    console.log('[TEST] Before addChips assertion, totalChipValue:', mockSignals.totalChipValue.value);
    expect(mockSignals.totalChipValue.value).toBe(10000); // Adjusted expected totalChipValue

    const clearButton = screen.getByTestId('gamba-play-button-clear');
    await act(async () => {
      fireEvent.click(clearButton);
    });
    console.log('[TEST] After clearChips click, totalChipValue immediately after act:', mockSignals.totalChipValue.value);

    await waitFor(() => {
      expect(mockSignals.totalChipValue.value).toBe(0);
    });
    console.log('[TEST] After waitFor, totalChipValue:', mockSignals.totalChipValue.value);


    expect(mockSignals.clearChips).toHaveBeenCalled();
    expect(mockTableAddChipsSpy).toHaveBeenCalledTimes(1); // Check if table click happened only once
    // expect(mockSignals.totalChipValue.value).toBe(0); // Covered by waitFor
  });

  test('simulates game win', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 200, resultIndex: 1 })), // Simulate win on number 1
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<RouletteGame />);
    const playButton = screen.getByTestId('gamba-play-button-play');

    // Simulate placing a chip on number 1
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    await waitFor(() => expect(playButton).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect result to be added and win sound played
    expect(mockSignals.results.value).toContain(1);
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
    const playButton = screen.getByTestId('gamba-play-button-play');

    // Simulate placing a chip on number 1
    const rouletteTable = screen.getByTestId('roulette-table');
    await act(async () => {
      fireEvent.click(rouletteTable);
    });

    await waitFor(() => expect(playButton).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(playButton);
    });

    act(() => jest.runAllTimers());

    // Expect result to be added and lose sound played
    expect(mockSignals.results.value).toContain(5);
    // Further assertions for visual lose indication would go here
  });
});