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
    useGame: jest.fn(() => ({
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
  useWagerInput: jest.fn(() => [1, jest.fn()]),
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
  Responsive: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EffectTest: ({ src }: { src: string }) => <div data-testid="effect-test" style={{ backgroundImage: `url(${src})` }}></div>,
}));

// Mock GambaPlayButton as it's used in SlotsGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid="gamba-play-button" disabled={disabled} onClick={onClick}>{text}</button>
  ),
}));

// Mock internal components
jest.mock('../../src/games/Slots/Slot', () => ({
  Slot: ({ item, revealed, good }: { item: any, revealed: boolean, good: boolean }) => (
    <div data-testid={`slot-${item.id}`} data-revealed={revealed} data-good={good}>
      {item.name}
    </div>
  ),
}));

jest.mock('../../src/games/Slots/ItemPreview', () => ({
  ItemPreview: ({ betArray }: { betArray: number[] }) => (
    <div data-testid="item-preview">Item Preview</div>
  ),
}));

// Mock utils functions
jest.mock('../../src/games/Slots/utils', () => ({
  generateBetArray: jest.fn(() => [1, 1, 1, 1, 1]), // Default mock bet array
  getSlotCombination: jest.fn((numSlots, multiplier, bet) => {
    const mockSlotItems = [{ id: '0', name: 'Gamba' }, { id: '1', name: 'Solana' }];
    // Simulate a winning combination for testing purposes
    if (multiplier > 0) {
      return Array(numSlots).fill(mockSlotItems[0]); // All same for a win
    }
    return Array(numSlots).fill(mockSlotItems[1]); // Different for a loss
  }),
}));

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
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
    jest.mocked(require('../../src/games/Slots/utils').generateBetArray).mockReturnValue([1, 1, 1, 1, 1]);
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders SlotsGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<SlotsGame />);
    expect(screen.getByText('Spin')).toBeInTheDocument();
    expect(screen.getByTestId('item-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId(/slot-/).length).toBe(5); // Assuming NUM_SLOTS is 5
  });

  test('simulates a winning spin', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 100, multiplier: 10, token: 'SOL' })), // Simulate win
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    // Mock getSlotCombination to return a winning combination
    jest.mocked(require('../../src/games/Slots/utils').getSlotCombination).mockReturnValue(Array(5).fill(SLOT_ITEMS[0]));

    render(<SlotsGame />);

    const spinButton = screen.getByText('Spin');
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
    expect(screen.getByTestId('effect-test')).toBeInTheDocument(); // Check for win effect
  });

  test('simulates a losing spin', async () => {
    const mockPlayGame = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlayGame,
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0, token: 'SOL' })), // Simulate lose
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    // Mock getSlotCombination to return a losing combination
    jest.mocked(require('../../src/games/Slots/utils').getSlotCombination).mockReturnValue(Array(5).fill(SLOT_ITEMS[1]));

    render(<SlotsGame />);

    const spinButton = screen.getByText('Spin');
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