// tests/integration/gameComponents.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { GameGrid } from "@/components/game/GameGrid";
import { GameCard } from "@/components/game/GameCard";
import { GAMES } from "@/games";

// Mock the router
const mockRouter = {
  push: jest.fn(),
};
jest.mock("next/router", () => ({ useRouter: () => mockRouter }));

beforeEach(() => {
  // Clear mock calls before each test
  mockRouter.push.mockClear();
});

// Mock Gamba context for components that might use it
jest.mock("gamba-react-ui-v2", () => ({
  GambaUi: {
    useGame: jest.fn().mockReturnValue({
      game: "crash",
      setGame: jest.fn(),
    }),
  },
}));

describe("Game Components Integration Tests", () => {
  test("GameGrid renders game cards", () => {
    render(<GameGrid />);
    // Check if a few games are present
    expect(screen.getByText("Play Crash")).toBeInTheDocument();
    expect(screen.getByText("Play Dice")).toBeInTheDocument();
  });

  test("GameCard links to the correct game page", () => {
    render(<GameCard game={GAMES.find((g) => g.id === "slots")!} />);

    const gameCard = screen.getByTestId("game-card-slots");

    // The GameCard should be wrapped in a link. We find the closest <a> tag
    // and verify it has the correct href attribute.
    const linkElement = gameCard.closest("a");
    expect(linkElement).toHaveAttribute("href", "/play/slots");
  });
});
import React, { useState, useEffect } from "react";
import { GambaUi } from "gamba-react-ui-v2";

export const mockSetCurrentMultiplier = jest.fn();
export const mockSetRocketState = jest.fn();

const MockCrashGame = () => {
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [rocketState, setRocketState] = useState<"idle" | "win" | "crash">(
    "idle"
  );

  useEffect(() => {
    mockSetCurrentMultiplier.mockImplementation(setCurrentMultiplier);
    mockSetRocketState.mockImplementation(setRocketState);
  }, []);

  const multiplierColor = (() => {
    if (rocketState === "crash") return "#ff0000";
    if (rocketState === "win") return "#00ff00";
    return "#ffffff";
  })();

  return (
    <>
      <GambaUi.Portal target="screen">
        <div
          data-testid="current-multiplier"
          style={{ color: multiplierColor }}
        >
          {currentMultiplier.toFixed(2)}x
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={1} onChange={jest.fn()} />
        <GambaUi.Button onClick={jest.fn()}>Play</GambaUi.Button>
      </GambaUi.Portal>
    </>
  );
};

export default MockCrashGame;
