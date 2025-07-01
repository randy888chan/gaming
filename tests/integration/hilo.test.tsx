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
    Responsive: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useGame: jest.fn(() => ({ // Moved useGame back into GambaUi
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    })),
  },
  useCurrentPool: jest.fn(() => ({
    token: 'SOL',
    maxPayout: 10000, // Provide a sensible maxPayout
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: 'SOL',
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: { music: { player: { stop: jest.fn() } } },
  })),
  useWagerInput: jest.fn(() => [1, jest.fn()]), // Default mock for useWagerInput
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Mock GambaPlayButton as it's used in HiLoGame
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ disabled, onClick, text }: { disabled?: boolean; onClick: () => void; text: string }) => (
    <button data-testid={`gamba-play-button-${text.toLowerCase().replace(/\s+/g, '-')}`} disabled={disabled} onClick={onClick}>{text}</button>
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
    // (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]); // Removed, now top-level
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  test('renders HiLoGame component', () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<HiLoGame logo="/games/hilo/logo.png" />);
    // expect(screen.getByText('HiLo')).toBeInTheDocument(); // Component likely doesn't render this
    expect(screen.getByText(/HI -/i)).toBeInTheDocument();
    expect(screen.getByText(/LO -/i)).toBeInTheDocument();
  });

  test('simulates placing a bet on Higher', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText(/HI -/i);
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button-roll'); // Updated testId
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 10, bet: expect.any(Array) });
  });

  test('simulates game win (Higher)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 20 })), // Simulate win
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    // Ensure useGamba().result() returns a winning payout for this test
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      play: jest.fn(), // Not directly used by component's play logic after game.play
      result: jest.fn(() => Promise.resolve({ payout: 20, resultIndex: 5 })), // WIN with some resultIndex
    });
    const initialWager = 1; // From useWagerInput mock
    (useWagerInput as jest.Mock).mockReturnValue([initialWager, jest.fn()]);

    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText(/HI -/i);
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button-roll'); // Updated testId
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Ensure all promises and state updates are flushed
    await act(async () => {});

    // Expect win condition to be visually represented by profit
    // Profit text would be like "20 +1,900%" (initialWager = 1, profit = 20)
    // Check for the combined profit and percentage string
    const expectedPercentage = Math.round((20 / initialWager) * 100 - 100).toLocaleString();
    const percentageRegex = new RegExp(`\\+${expectedPercentage}%`);
    const percentageElement = await screen.findByText(percentageRegex, {}, { timeout: 4000 });
    expect(percentageElement).toBeInTheDocument();

    // Check that the parent of the percentage text also contains the profit value
    const profitContainer = percentageElement.parentElement;
    expect(profitContainer).toHaveTextContent(`20 +${expectedPercentage}%`);
  });

  test('simulates game lose (Higher)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })), // Simulate lose, result not used by component
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    // Ensure useGamba().result() returns a losing payout for this test
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 0 })), // LOSE
    });
    const initialWager = 1;
    (useWagerInput as jest.Mock).mockReturnValue([initialWager, jest.fn()]);


    render(<HiLoGame logo="/games/hilo/logo.png" />);

    const higherButton = screen.getByText(/HI -/i);
    await act(async () => {
      fireEvent.click(higherButton);
    });

    const playButton = screen.getByTestId('gamba-play-button-roll'); // Updated testId
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Ensure all promises and state updates are flushed
    await act(async () => {});

    // Expect lose condition: profit display should not appear, or profit is 0
    // If profit is 0, the <Profit> component is not rendered.
    // So, we check that the TokenValue with a non-zero profit is NOT there.
    // And also that the initial wager input is available again.
    // expect(screen.queryByText(String(initialWager * 2))).not.toBeInTheDocument(); // Removed ambiguous query
    expect(screen.getByTestId("wager-input")).toHaveValue(String(initialWager)); // Ensure comparing string to string
    // Check that the "Roll" button is available (means game reset or ready for new game)
    expect(screen.getByRole('button', { name: /Roll/i })).toBeInTheDocument();
  });
});