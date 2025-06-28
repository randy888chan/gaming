import { useRouter } from 'next/router';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameGrid } from '@/components/game/GameGrid';
import { GameCard } from '@/components/game/GameCard';
import CrashGame from '@/games/Crash';

// Mock Next.js router

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

// Mock game context
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
  // Add required app property
  app: function MockGame() {
    return <div>Mock Game</div>;
  },
  // Add required props property
  props: {},
};

describe('Game Components Integration Tests', () => {
  test('GameGrid renders all games', () => {
    render(<GameGrid />);
    
    // Verify all game cards are rendered
    expect(screen.getByText('Crash')).toBeInTheDocument();
    expect(screen.getByText('Dice')).toBeInTheDocument();
    expect(screen.getByText('Roulette')).toBeInTheDocument();
    expect(screen.getByText('Slots')).toBeInTheDocument();
  });

  test('GameCard click navigates to game', () => {
    render(<GameCard game={mockGameBundle} />);
    
    // Find by test ID since text might be wrapped
    const gameCard = screen.getByTestId(`game-card-${mockGameBundle.id}`);
    fireEvent.click(gameCard);
    
    expect(useRouter().push)
      .toHaveBeenCalledWith('/play/crash');
  });

  test('Crash game renders and handles interaction', () => {
    render(<CrashGame />);
    
    // Verify game elements are present
    expect(screen.getByText('Place Bet')).toBeInTheDocument();
    expect(screen.getByText('Cash Out')).toBeInTheDocument();
    
    // Simulate placing a bet
    fireEvent.click(screen.getByText('Place Bet'));
    
    // Verify bet was placed
    // This expectation might need adjustment based on actual behavior
    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });
});