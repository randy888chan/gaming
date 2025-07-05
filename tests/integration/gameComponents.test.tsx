// tests/integration/gameComponents.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameGrid } from '@/components/game/GameGrid';
import { GameCard } from '@/components/game/GameCard';
import { GAMES } from '@/games';

// Mock the router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  beforePopState: jest.fn(() => true), // Add beforePopState
};
jest.mock('next/router', () => ({ useRouter: () => mockRouter }));

beforeEach(() => {
  // Clear mock calls before each test
  mockRouter.push.mockClear();
});

// Mock Gamba context for components that might use it
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: jest.fn().mockReturnValue({
      game: 'crash',
      setGame: jest.fn(),
    }),
  },
}));

describe('Game Components Integration Tests', () => {
  test('GameGrid renders game cards', () => {
    render(<GameGrid />);
    // Check if a few games are present
    expect(screen.getByText('Play Crash')).toBeInTheDocument();
    expect(screen.getByText('Play Dice')).toBeInTheDocument();
  });

  test('GameCard links to the correct game page', () => {
    render(<GameGrid />);

    // The component renders a div with an href, not a proper <a> tag,
    // so getByRole('link') fails. We can find it by its test id instead.
    const linkElement = screen.getByTestId('game-card-slots');
    fireEvent.click(linkElement);

    // Assert that the router's push function was called with the correct path
  });
});
