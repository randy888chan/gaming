import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import PlinkoGame from "../../src/games/Plinko";
import {
  GambaUi,
  useCurrentPool,
  useCurrentToken,
  useSound,
  useWagerInput,
} from "gamba-react-ui-v2";
import { useGamba } from "gamba-react-v2";

const mockReset = jest.fn();
const mockRun = jest.fn();

jest.mock("../../src/games/Plinko/game", () => {
  const actual = jest.requireActual("../../src/games/Plinko/game");
  return {
    ...actual,
    Plinko: jest.fn().mockImplementation(() => {
      return {
        reset: mockReset,
        run: mockRun,
        getBodies: jest.fn(() => []),
        cleanup: jest.fn(),
        width: 100,
        height: 100,
      };
    }),
  };
});

// Mock Gamba hooks
jest.mock("gamba-react-v2", () => ({
  useGamba: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    result: jest.fn(() => Promise.resolve({ payout: 0, multiplier: 0 })),
  })),
}));

jest.mock("gamba-react-ui-v2", () => {
  const React = jest.requireActual("react");
  return {
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
      Canvas: ({
        render,
      }: {
        render: (
          args: {
            ctx: CanvasRenderingContext2D;
            size: { width: number; height: number };
          },
          clock: any
        ) => void;
      }) => {
        const canvasRef = React.useRef<HTMLCanvasElement>(null);
        React.useEffect(() => {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            render({ ctx, size: { width: 800, height: 600 } }, {});
          }
        }, [render]);
        return <canvas data-testid="plinko-canvas" ref={canvasRef} />;
      },
      Switch: ({
        checked,
        onChange,
        disabled,
      }: {
        checked: boolean;
        onChange: (checked: boolean) => void;
        disabled?: boolean;
      }) => (
        <input
          type="checkbox"
          data-testid="plinko-switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
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
  };
});

// Mock GambaPlayButton as it's used in PlinkoGame
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

describe("Plinko Game Component Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSound as jest.Mock).mockReturnValue({
      play: jest.fn(),
      sounds: { music: { player: { stop: jest.fn() } } },
    });
    (useWagerInput as jest.Mock).mockReturnValue([1, jest.fn()]);
  });

  test("renders PlinkoGame component", () => {
    (useGamba as jest.Mock).mockReturnValue({ isPlaying: false });
    render(<PlinkoGame />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByTestId("plinko-canvas")).toBeInTheDocument();
  });

  test("simulates placing a bet and winning", async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
    });
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      result: jest.fn().mockResolvedValue({ payout: 20, multiplier: 2 }),
    });

    render(<PlinkoGame />);

    const playButton = screen.getByTestId("gamba-play-button");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledWith({
        wager: 1,
        bet: expect.any(Array),
      });
    });

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRun).toHaveBeenCalledWith(2);
    });
  });

  test("simulates placing a bet and losing", async () => {
    const mockPlay = jest.fn();
    (GambaUi.useGame as jest.Mock).mockReturnValue({
      play: mockPlay,
    });
    (useGamba as jest.Mock).mockReturnValue({
      isPlaying: false,
      result: jest.fn().mockResolvedValue({ payout: 0, multiplier: 0.5 }),
    });

    render(<PlinkoGame />);

    const playButton = screen.getByTestId("gamba-play-button");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledWith({
        wager: 1,
        bet: expect.any(Array),
      });
    });

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRun).toHaveBeenCalledWith(0.5);
    });
  });

  test("simulates toggling degen mode", async () => {
    render(<PlinkoGame />);
    const degenSwitch = screen.getByTestId("plinko-switch");
    expect(degenSwitch).not.toBeChecked();

    act(() => {
      fireEvent.click(degenSwitch);
    });

    expect(degenSwitch).toBeChecked();
  });
});
