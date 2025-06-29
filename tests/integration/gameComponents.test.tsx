// tests/integration/gameComponents.test.tsx
import { useRouter } from 'next/router';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameGrid } from '@/components/game/GameGrid';
import { GameCard } from '@/components/game/GameCard';
import { GAMES } from '@/games';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    pathname: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

// Mock Gamba context for components that might use it
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: jest.fn().mockReturnValue({
      game: 'crash',
      setGame: jest.fn(),
    }),
  },
}));

// Mock GameBundle with all required properties
const mockGameBundle = {
  id: 'crash',
  meta: {
    name: 'Crash',
    description: 'Test your luck',
    background: '#000000',
  },
  app: function MockGame() {
    return <div>Mock Game</div>;
  },
  props: {},
};

describe('Game Components Integration Tests', () => {
  test('GameGrid renders game cards', () => {
    render(<GameGrid />);
    // Check if a few games are present
    expect(screen.getByText('Play Crash')).toBeInTheDocument();
    expect(screen.getByText('Play Dice')).toBeInTheDocument();
  });

  test('GameCard click navigates to the correct game page', () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push,
      pathname: '/',
      events: { on: jest.fn(), off: jest.fn() },
    });

    render(<GameCard game={GAMES.find(g => g.id === 'slots')!} />);
    
    const gameCard = screen.getByTestId('game-card-slots');
    fireEvent.click(gameCard);
    
    expect(push).toHaveBeenCalledWith('/play/slots');
  });
});
