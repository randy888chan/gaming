import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameCard } from './GameCard';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid="game-link">
      {children}
    </a>
  );
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/'
  })
}));

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GameBundle: {}
}));

// Mock InsightShard component
jest.mock('@/components/ui/insight-shard', () => ({
  InsightShard: ({ title, value }: any) => (
    <div data-testid={`insight-shard-${title}`}>
      {title}: {value}
    </div>
  )
}));

describe('GameCard', () => {
  const mockGame = {
    id: 'test-game',
    meta: {
      name: 'Test Game',
      background: '#ff0000'
    }
  };

  it('renders game card with correct href', () => {
    render(<GameCard game={mockGame} />);
    
    const link = screen.getByTestId('game-link');
    expect(link).toHaveAttribute('href', '/play/test-game');
  });

  it('renders game card with correct background color', () => {
    render(<GameCard game={mockGame} />);
    
    const gameCard = screen.getByTestId('game-card-test-game');
    expect(gameCard).toHaveStyle('backgroundColor: #ff0000');
  });

  it('renders game name in play button', () => {
    render(<GameCard game={mockGame} />);
    
    expect(screen.getByText('Play Test Game')).toBeInTheDocument();
  });

  it('renders InsightShard components', () => {
    render(<GameCard game={mockGame} />);
    
    expect(screen.getByTestId('insight-shard-Popularity')).toBeInTheDocument();
    expect(screen.getByTestId('insight-shard-RTP')).toBeInTheDocument();
  });

  it('renders with small aspect ratio when not on home page', () => {
    jest.mock('next/router', () => ({
      useRouter: () => ({
        pathname: '/other-page'
      })
    }));
    
    render(<GameCard game={mockGame} />);
    
    const gameCard = screen.getByTestId('game-card-test-game');
    expect(gameCard).toHaveStyle('aspectRatio: 1 / 0.5');
  });

  it('renders with large aspect ratio when on home page', () => {
    jest.mock('next/router', () => ({
      useRouter: () => ({
        pathname: '/'
      })
    }));
    
    render(<GameCard game={mockGame} />);
    
    const gameCard = screen.getByTestId('game-card-test-game');
    expect(gameCard).toHaveStyle('aspectRatio: 1 / 0.6');
  });
});