import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SlotsGame from '../../src/games/Slots';
import { GambaUi, useCurrentPool, useCurrentToken, useSound, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';
import { SLOT_ITEMS } from '../../src/games/Slots/constants';

// Mock Gamba hooks
jest.mock('gamba-react-v2', () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0, token: 'SOL' })),
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
    Responsive: ({ children }: { children: React.ReactNode }) => <div data-testid="gamba-ui-responsive">{children}</div>,
    EffectTest: ({ src }: { src: string }) => <div data-testid="effect-test" style={{ backgroundImage: `url(${src})` }}></div>,
    useGame: jest.fn(() => ({ // Moved useGame back inside GambaUi
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0, token: 'SOL' })),
    })),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
    maxPayout: 1000,
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: 'SOL',
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: {
      spin: { player: { stop: jest.fn() } },
      reveal: { player: { stop: jest.fn() } },
      revealLegendary: { player: { stop: jest.fn() } },
      win: { player: { stop: jest.fn() } },
      lose: { player: { stop: jest.fn() } },
      play: { player: { stop: jest.fn() } },
    },
  })),
  useWagerInput: jest.fn(() => [1, jest.fn()]), // Default mock for useWagerInput
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Mock GambaPlayButton as it's used in SlotsGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid={`gamba-play-button-${text.toLowerCase().replace(/\s+/g, '-')}`} disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

// Mock internal components
jest.mock('../../src/games/Slots/Slot', () => ({
  Slot: ({ item, revealed, good }: { item: any, revealed: boolean, good: boolean }) => (
    <div data-testid={`slot-${item?.image?.split('/').pop()?.split('.')[0] || Math.random()}`} data-revealed={revealed} data-good={good}>
      {item?.image || 'slot-item'}
    </div>
  ),
}));

jest.mock('../../src/games/Slots/ItemPreview', () => ({
  ItemPreview: ({ betArray }: { betArray: number[] }) => (
    <div data-testid="item-preview">Item Preview</div>
  ),
}));

// Mock utils functions
jest.mock('../../src/games/Slots/utils', () => {
  console.log('[TEST MOCK] Slots/utils factory executing'); // Log when this factory runs
  const actualConstants = jest.requireActual('../../src/games/Slots/constants');
  return {
    generateBetArray: jest.fn(() => {
      console.log('[TEST MOCK] generateBetArray actually called, returning [1,0,0]');
      return [1, 0, 0];
    }),
    getSlotCombination: jest.fn((numSlots, multiplier, bet) => {
      const { SLOT_ITEMS } = actualConstants; // Ensure it's defined for this scope
      const mockSlotItemsFallback = [
        { id: 'fb0', name: 'FallbackGamba', image: 'g0.png', multiplier: 0 },
        { id: 'fb1', name: 'FallbackSolana', image: 's1.png', multiplier: 0 }
      ];
      if (multiplier > 0) {
        const winningItem = SLOT_ITEMS.find(item => item.multiplier === multiplier) || SLOT_ITEMS[0] || mockSlotItemsFallback[0];
        return Array(numSlots).fill(winningItem);
      }
      return Array(numSlots).fill(SLOT_ITEMS.find(item => item.multiplier === 0) || mockSlotItemsFallback[1]);
    }),
  };
}); // Single semicolon

describe('Slots Game Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: {
        spin: { player: { stop: jest.fn() } },
        reveal: { player: { stop: jest.fn() } },
        revealLegendary: { player: { stop: jest.fn() } },
        win: { player: { stop: jest.fn() } },
        lose: { player: { stop: jest.fn() } },
        play: { player: { stop: jest.fn() } },
      },
    });
    // (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]); // Removed as it's now in top-level mock
    // No longer need to set generateBetArray mock here as it's defaulted in the top-level mock
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders SlotsGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<SlotsGame />);
    expect(screen.getByTestId('gamba-play-button-spin')).toBeInTheDocument();
    expect(screen.getByTestId('item-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId(/slot-/).length).toBe(3); // NUM_SLOTS is 3
  });

  test('simulates a winning spin', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 100, multiplier: 10, token: 'SOL' })), // Simulate win
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    // generateBetArray mock is now at top-level

    // Mock getSlotCombination to return a winning combination
    jest.mocked(require('../../src/games/Slots/utils').getSlotCombination).mockReturnValue(Array(3).fill(SLOT_ITEMS[0])); // NUM_SLOTS is 3

    render(<SlotsGame />);

    const spinButton = screen.getByTestId('gamba-play-button-spin');
    expect(spinButton).not.toBeDisabled(); // Check if button is enabled before click
    await act(async () => {
      fireEvent.click(spinButton);
    });

    expect(mockPlayGame).toHaveBeenCalledWith({
      wager: 1,
      bet: [1,0,0], // Expect the bet array used
    });

    // Advance timers to simulate spin and reveal animations
    act(() => {
      jest.advanceTimersByTime(5000); // SPIN_DELAY + (NUM_SLOTS * REVEAL_SLOT_DELAY) + FINAL_DELAY
    });

    expect(screen.getByText(/Payout:/)).toBeInTheDocument();
    expect(screen.getByTestId('effect-test')).toBeInTheDocument(); // Check for win effect
  });

  test('simulates a losing spin', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0, token: 'SOL' })), // Simulate lose
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    // generateBetArray mock is now at top-level

    // Mock getSlotCombination to return a losing combination
    jest.mocked(require('../../src/games/Slots/utils').getSlotCombination).mockReturnValue(Array(3).fill(SLOT_ITEMS[1])); // NUM_SLOTS is 3

    render(<SlotsGame />);

    const spinButton = screen.getByTestId('gamba-play-button-spin');
    expect(spinButton).not.toBeDisabled(); // Check if button is enabled before click
    await act(async () => {
      fireEvent.click(spinButton);
    });

    expect(mockPlayGame).toHaveBeenCalledWith({
      wager: 1,
      bet: expect.any(Array),
    });

    // Advance timers to simulate spin and reveal animations
    act(() => {
      jest.advanceTimersByTime(5000); // SPIN_DELAY + (NUM_SLOTS * REVEAL_SLOT_DELAY) + FINAL_DELAY
    });

    expect(screen.getByText(/Payout:/)).toBeInTheDocument();
    expect(screen.queryByTestId('effect-test')).not.toBeInTheDocument(); // No win effect
  });
});