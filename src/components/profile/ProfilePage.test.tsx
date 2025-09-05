import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './ProfilePage';

// Mock the fetch API
global.fetch = jest.fn();

describe('ProfilePage', () => {
  const mockUserProfile = {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    recentActivity: {
      tournamentsPlayed: 5
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<ProfilePage />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('renders profile information when fetch succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserProfile)
    });

    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });
    
    expect(screen.getByText('0x1234567890abcdef1234567890abcdef12345678')).toBeInTheDocument();
    expect(screen.getByText('Tournaments Played: 5')).toBeInTheDocument();
  });

  it('renders no profile found message when user profile is null', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    });

    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('No user profile found.')).toBeInTheDocument();
    });
  });
});