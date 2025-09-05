import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Leaderboard } from './Leaderboard';

describe('Leaderboard', () => {
  const mockEntries = [
    { rank: 1, username: 'Player1', score: 1000 },
    { rank: 2, username: 'Player2', score: 900 },
    { rank: 3, username: 'Player3', score: 800 }
  ];

  it('renders leaderboard with title', () => {
    render(<Leaderboard title="Top Players" entries={mockEntries} />);
    
    expect(screen.getByText('Top Players')).toBeInTheDocument();
  });

  it('renders all leaderboard entries', () => {
    render(<Leaderboard title="Top Players" entries={mockEntries} />);
    
    // Check that all entries are rendered
    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
    expect(screen.getByText('Player3')).toBeInTheDocument();
    
    // Check that all ranks are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check that all scores are rendered
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<Leaderboard title="Top Players" entries={mockEntries} />);
    
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Leaderboard title="Top Players" entries={mockEntries} />);
    
    // Check that the main container has the correct classes
    const container = screen.getByText('Top Players').closest('div');
    expect(container).toHaveClass('bg-gray-800', 'p-4', 'rounded-lg', 'shadow-lg');
    
    // Check that the table has the correct class
    const table = screen.getByRole('table');
    expect(table).toHaveClass('min-w-full');
  });
});