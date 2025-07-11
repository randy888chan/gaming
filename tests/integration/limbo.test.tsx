import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import LimboGame from "../../src/games/Limbo";
import {
  GambaUi,
  useCurrentPool,
  useCurrentToken,
  useSound,
  useWagerInput,
} from "gamba-react-ui-v2";
import { useGamba } from "gamba-react-v2";

// Mock Gamba hooks
jest.mock("gamba-react-v2", () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0 })),
  })),
}));

jest.mock("gamba-react-ui-v2", () => ({
  GambaUi: {
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="portal">{children}</div>
    ),
    WagerInput: ({
      value,
      onChange,
    }: {
      value: number;
      onChange: (value: number) => void;
    }) => (
      <input
        data-testid="wager-input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(Number(e.target.value))
        }
      />
    ),
    Button: ({
      children,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    useGame: jest.fn(() => ({
      play: jest.fn(),
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0 })),
    })),
    Responsive: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-wrapper">{children}</div>
    ),
  },
  useCurrentPool: jest.fn(() => ({
    token: "SOL",
  })),
  useCurrentToken: jest.fn(() => ({
    symbol: "SOL",
  })),
  useSound: jest.fn(() => ({
    play: jest.fn(),
    sounds: { music: { player: { stop: jest.fn() } } },
  })),
  useWagerInput: jest.fn(() => [1, jest.fn()]),
  TokenValue: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Mock GambaPlayButton as it's used in LimboGame
jest.mock("@/components/GambaPlayButton", () => ({
  __esModule: true,
  default: ({
    disabled,
    onClick,
    text,
  }: {
    disabled?: boolean;
    onClick: () => void;
    text: string;
  }) => (
    <button
      data-testid="gamba-play-button"
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  ),
}));

// Mock Slider component
jest.mock("../../src/games/Limbo/slide", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    disabled,
  }: {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
  }) => (
    <input
      type="range"
      data-testid="limbo-slider"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
    />
  ),
}));

describe("Limbo Game Component Integration Tests", () => {
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
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test("renders LimboGame component", () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<LimboGame />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByTestId("limbo-slider")).toBeInTheDocument();
    expect(screen.getByTestId("multiplier-display")).toBeInTheDocument();
  });

  test("simulates changing target multiplier", async () => {
    render(<LimboGame />);
    const slider = screen.getByTestId("limbo-slider");
    await act(async () => {
      fireEvent.change(slider, { target: { value: "50" } });
    });
    expect(screen.getByText("50x")).toBeInTheDocument();
  });

  test("simulates placing a bet and winning", async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 20, multiplier: 25 })), // Simulate win
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<LimboGame />);

    const slider = screen.getByTestId("limbo-slider");
    await act(async () => {
      fireEvent.change(slider, { target: { value: "20" } });
    });

    const playButton = screen.getByTestId("gamba-play-button");
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({
      wager: 1,
      bet: expect.any(Array),
    });

    // Advance timers to simulate animation and result
    act(() => {
      jest.advanceTimersByTime(3000); // 500ms initial delay + 2500ms animation duration
    });

    await waitFor(() => {
      expect(screen.getByTestId("multiplier-display")).toHaveStyle(
        "color: #10B981"
      );
    });
  });

  test("simulates placing a bet and losing", async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 15 })), // Simulate lose
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<LimboGame />);

    const slider = screen.getByTestId("limbo-slider");
    await act(async () => {
      fireEvent.change(slider, { target: { value: "20" } });
    });

    const playButton = screen.getByTestId("gamba-play-button");
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({
      wager: 1,
      bet: expect.any(Array),
    });

    // Advance timers to simulate animation and result
    act(() => {
      jest.advanceTimersByTime(3000); // 500ms initial delay + 2500ms animation duration
    });

    await waitFor(() => {
      expect(screen.getByTestId("multiplier-display")).toHaveStyle(
        "color: #EF4444"
      );
    });
  });
});
