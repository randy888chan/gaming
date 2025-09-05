import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TournamentBracket from './TournamentBracket';

describe('TournamentBracket', () => {
  const mockTournament = {
    id: '1',
    name: 'Test Tournament',
    teams: [
      { id: 'team1', name: 'Team 1' },
      { id: 'team2', name: 'Team 2' },
      { id: 'team3', name: 'Team 3' },
      { id: 'team4', name: 'Team 4' }
    ],
    matches: [
      {
        id: 'match1',
        round: 1,
        matchNumber: 1,
        team1: { id: 'team1', name: 'Team 1' },
        team2: { id: 'team2', name: 'Team 2' },
        score1: null,
        score2: null,
        winnerId: null
      },
      {
        id: 'match2',
        round: 1,
        matchNumber: 2,
        team1: { id: 'team3', name: 'Team 3' },
        team2: { id: 'team4', name: 'Team 4' },
        score1: null,
        score2: null,
        winnerId: null
      },
      {
        id: 'match3',
        round: 2,
        matchNumber: 1,
        team1: null,
        team2: null,
        score1: null,
        score2: null,
        winnerId: null
      }
    ]
  };

  const mockOnUpdateTournament = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tournament name', () => {
    render(<TournamentBracket tournament={mockTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
  });

  it('renders matches grouped by rounds', () => {
    render(<TournamentBracket tournament={mockTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    // Check that rounds are displayed
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    
    // Check that matches are displayed
    expect(screen.getByText('Match 1')).toBeInTheDocument();
    expect(screen.getByText('Match 2')).toBeInTheDocument();
    expect(screen.getByText('Match 1')).toBeInTheDocument(); // Second round match
    
    // Check that teams are displayed
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Team 3')).toBeInTheDocument();
    expect(screen.getByText('Team 4')).toBeInTheDocument();
  });

  it('renders TBD for matches without teams', () => {
    render(<TournamentBracket tournament={mockTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    // Check that TBD is displayed for matches without teams
    expect(screen.getAllByText('TBD')).toHaveLength(2);
  });

  it('updates score when input changes', () => {
    render(<TournamentBracket tournament={mockTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    // Find the first score input and change its value
    const scoreInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(scoreInput, { target: { value: '5' } });
    
    // Check that onUpdateTournament was called
    expect(mockOnUpdateTournament).toHaveBeenCalledTimes(1);
  });

  it('displays match status correctly', () => {
    render(<TournamentBracket tournament={mockTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    // Check that pending matches have correct status
    expect(screen.getByText('Pending')).toBeInTheDocument();
    
    // Check that in-progress matches have correct status
    expect(screen.getAllByText('In Progress')).toHaveLength(2);
  });

  it('renders message when no matches are available', () => {
    const emptyTournament = {
      ...mockTournament,
      matches: []
    };
    
    render(<TournamentBracket tournament={emptyTournament} onUpdateTournament={mockOnUpdateTournament} />);
    
    expect(screen.getByText('No matches available for this tournament.')).toBeInTheDocument();
  });
});