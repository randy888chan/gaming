import React from "react";
// tests/integration/crash.test.tsx
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import CrashGame, { doTheIntervalThing } from "../../src/games/Crash";
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
    result: jest.fn(() => Promise.resolve({ payout: 0 })),
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
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    })),
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

// Mock GambaPlayButton as it's used in CrashGame
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

describe("Crash Game Component Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Centralize common mock setups
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
  });

  afterEach(() => {
    // Wrap timer finalization in act to avoid warnings
    // jest.runOnlyPendingTimers(); // Not reliable with requestAnimationFrame
    jest.useRealTimers();
    // Restore requestAnimationFrame if it was mocked for a specific test
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock requestAnimationFrame
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        const handle = setTimeout(() => cb(Date.now()), 0);
        return handle as unknown as number; // Adjust type as necessary
      });
    jest
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation((handle: number) => {
        clearTimeout(handle);
      });
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
  });

  test("renders CrashGame component", () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<CrashGame />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    // Initial state might be 0.00x or some other placeholder
    expect(screen.getByTestId("current-multiplier")).toHaveTextContent("0.00x");
  });

  test("simulates placing a bet", async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
      result: jest.fn(() => Promise.resolve({ payout: 0 })),
    });
    (useWagerInput as jest.Mock).mockReturnValue([10, jest.fn()]);

    render(<CrashGame />);

    const playButton = screen.getByText("Play");
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(mockPlay).toHaveBeenCalledWith({
      wager: 10,
      bet: expect.any(Array),
    });
  });

  test("simulates game crash", async () => {
    const mockGamePlay = jest.fn();
    const mockGameResult = jest.fn(() => Promise.resolve({ payout: 0 })); // Simulate crash

    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockGamePlay,
      result: mockGameResult,
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    // Mock doTheIntervalThing to control its execution in test
    const mockDoTheIntervalThing = jest.requireActual(
      "../../src/games/Crash"
    ).doTheIntervalThing;

    render(<CrashGame />);

    await act(async () => {
      fireEvent.click(screen.getByText("Play"));
    });

    // Wait for the multiplier to update and reflect the crash state
    await waitFor(
      () => {
        expect(screen.getByTestId("current-multiplier")).toHaveStyle(
          "color: #ff0000"
        );
      },
      { timeout: 2000 }
    ); // Adjust timeout as needed
  });

  test("simulates game win", async () => {
    const mockGamePlay = jest.fn();
    // Simulate a win where payout is greater than 0
    const mockGameResult = jest.fn(() => Promise.resolve({ payout: 20 }));
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockGamePlay,
      result: mockGameResult,
    });
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });

    render(<CrashGame />);

    await act(async () => {
      fireEvent.click(screen.getByText("Play"));
    });

    // Wait for the multiplier to update and reflect the win state
    await waitFor(
      () => {
        // Check for the win color
        expect(screen.getByTestId("current-multiplier")).toHaveStyle(
          "color: #00ff00"
        );
        // Optionally, check if the multiplier value is as expected, e.g., "2.00x" if target was 2
      },
      { timeout: 2000 }
    ); // Adjust timeout as needed
  });
});
