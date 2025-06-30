import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import FlipGame from '../../src/games/Flip';
import { GambaUi, useCurrentPool, useCurrentToken, useSound, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

// Mock R3F Canvas
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  Canvas: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Game components that use R3F hooks
jest.mock("../../src/games/Flip/Coin", () => ({
  Coin: ({ onClick, result, flipping, scale, position, rotation }: any) => ( // Added all props to avoid prop type errors
    <div data-testid={result === 0 && !flipping && scale === 0.8 ? "coin-selector-heads" : result === 1 && !flipping && scale === 0.8 ? "coin-selector-tails" : "coin-flipping"} onClick={onClick}>
      <span>MockCoin-{result}-{flipping ? 'flipping' : 'still'}</span>
    </div>
  ),
}));

jest.mock("../../src/games/Flip/Effect", () => ({
  Effect: ({ color }: { color: string}) => <div data-testid={`mock-effect-${color}`} />,
}));

jest.mock("../../src/games/Flip/FlipBanner", () => {
  // BannerWithMessages uses FlashingText internally. FlashingText uses setInterval.
  // To avoid timer issues and simplify, we'll mock BannerWithMessages
  // to just render its messages directly.
  const MockBannerWithMessages = ({ messages }: { messages: string[] }) => (
    <div data-testid="banner-with-messages">
      {/* Render all messages; tests will find the specific one they need (e.g., "You won!") */}
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );

  return {
    BannerWithMessages: MockBannerWithMessages,
    FlipBanner: () => <div data-testid="mock-flip-banner" />, // Keep this mock
  };
});

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

  test('renders FlipGame component', async () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<FlipGame />);
    expect(screen.getByText('Flip')).toBeInTheDocument();
    expect(screen.getByText('Heads')).toBeInTheDocument();
    expect(screen.queryByText('Tails')).not.toBeInTheDocument();

    // Click to toggle to Tails
    fireEvent.click(screen.getByText('Heads'));
    expect(await screen.findByText('Tails')).toBeInTheDocument();
    expect(screen.queryByText('Heads')).not.toBeInTheDocument();

    // Click to toggle back to Heads
    fireEvent.click(screen.getByText('Tails'));
    expect(await screen.findByText('Heads')).toBeInTheDocument();
    expect(screen.queryByText('Tails')).not.toBeInTheDocument();
  });

  test('simulates placing a bet on Heads', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<FlipGame />);

    // Ensure Heads is selected (default)
    expect(screen.getByText('Heads')).toBeInTheDocument();

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 1, bet: [2, 0], metadata: ["heads"] });
  });

  test('simulates placing a bet on Tails', async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<FlipGame />);

    // Click to change to Tails
    const sideToggleButton = screen.getByText('Heads'); // Initially it's Heads
    await act(async () => {
      fireEvent.click(sideToggleButton);
    });
    expect(await screen.findByText('Tails')).toBeInTheDocument(); // Confirm it changed to Tails

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({ wager: 1, bet: [0, 2], metadata: ["tails"] });
  });

  test('simulates game win (Heads)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 20 })), // Simulate win
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    // Ensure useGamba().result() returns a winning payout for this test
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      play: jest.fn(), // Not directly used by component's play logic after game.play
      result: jest.fn(() => Promise.resolve({ payout: 20, resultIndex: 0 })), // WIN
    });

    render(<FlipGame />);

    // Ensure Heads is selected (default)
    expect(screen.getByText('Heads')).toBeInTheDocument();

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Ensure all promises and state updates are flushed before checking for result text
    await act(async () => {});

    // Expect win condition to be visually represented (e.g., win message, increased balance)
    // This will depend on how FlipGame visually indicates a win.
    // For now, we'll check for a generic "win" text if it exists, or a change in balance display.
    // If no specific win text, we might need to inspect the component's internal state or styles.
    // For now, I'll assume a "You won!" text appears or similar.
    expect(await screen.findByText(/You won!/i, {}, { timeout: 3000 })).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });

  test('simulates game lose (Heads)', async () => {
    const mockGame = {
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0 })), // Simulate lose
    };
    (GambaUi.useGame as jest.Mock).mockReturnValue(mockGame);
    // Ensure useGamba().result() returns a losing payout for this test
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0, resultIndex: 1 })), // LOSE
    });

    render(<FlipGame />);

    // Ensure Heads is selected (default)
    expect(screen.getByText('Heads')).toBeInTheDocument();

    const playButton = screen.getByTestId('gamba-play-button');
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Ensure all promises and state updates are flushed before checking for result text
    await act(async () => {});

    // Expect lose condition to be visually represented (e.g., lose message, decreased balance)
    expect(await screen.findByText(/You lost!/i, {}, { timeout: 3000 })).toBeInTheDocument(); // Placeholder, adjust based on actual UI
  });
});