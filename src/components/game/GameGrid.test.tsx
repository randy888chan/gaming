import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameGrid } from './GameGrid';

// Mock the games data
jest.mock('@/games', () => ({
  GAMES: [
    { id: 'game1', meta: { name: 'Game 1', background: '#ff0000' } },
    { id: 'game2', meta: { name: 'Game 2', background: '#00ff00' } }
  ]
}));

// Mock the GameCard component
jest.mock('./GameCard', () => ({
  GameCard: ({ game }: any) => (
    <div data-testid={`game-card-${game.id}`}>
      {game.meta.name}
    </div>
  )
}));

// Mock the Leaderboard component
jest.mock('./Leaderboard', () => ({
  Leaderboard: ({ title }: any) => (
    <div data-testid="leaderboard">
      {title}
    </div>
  )
}));

describe('GameGrid', () => {
  it('renders game cards for each game', () => {
    render(<GameGrid />);
    
    expect(screen.getByTestId('game-card-game1')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-game2')).toBeInTheDocument();
    expect(screen.getByText('Game 1')).toBeInTheDocument();
    expect(screen.getByText('Game 2')).toBeInTheDocument();
  });

  it('renders leaderboard with correct title', () => {
    render(<GameGrid />);
    
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top Players')).toBeInTheDocument();
  });

  it('renders grid with correct class names', () => {
    render(<GameGrid />);
    
    const grid = screen.getByText('Game 1').closest('div');
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');
  });
});