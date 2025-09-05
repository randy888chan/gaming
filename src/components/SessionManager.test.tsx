/**
 * Test for SessionManager component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the useSession hook
const mockSetSession = jest.fn();
const mockUseSession = jest.fn();

jest.mock('@particle-network/connectkit', () => ({
  useSession: () => mockUseSession(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button 
      onClick={onClick} 
      data-testid="session-button"
      className={variant}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="session-card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => (
    <div data-testid="progress-bar" style={{ width: `${value}%` }} />
  ),
}));

describe('SessionManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSetSession.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render no active session message when session is null', async () => {
    mockUseSession.mockReturnValue({
      session: null,
      setSession: mockSetSession,
    });

    const { default: SessionManager } = await import('./SessionManager');
    
    render(<SessionManager />);
    
    expect(screen.getByText('No active session. Start playing to create a session key for faster transactions.')).toBeInTheDocument();
  });

  it('should render active session information when session exists', async () => {
    const mockSession = {
      expireTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      createTime: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    };

    mockUseSession.mockReturnValue({
      session: mockSession,
      setSession: mockSetSession,
    });

    const { default: SessionManager } = await import('./SessionManager');
    
    render(<SessionManager />);
    
    expect(screen.getByText('Session Key Active')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('should display correct time remaining', async () => {
    const expireTime = Math.floor(Date.now() / 1000) + 3661; // 1 hour, 1 minute, 1 second from now
    const createTime = Math.floor(Date.now() / 1000) - 1800; // 30 minutes ago

    const mockSession = {
      expireTime,
      createTime,
    };

    mockUseSession.mockReturnValue({
      session: mockSession,
      setSession: mockSetSession,
    });

    const { default: SessionManager } = await import('./SessionManager');
    
    render(<SessionManager />);
    
    // Should display "1h 1m" for 3661 seconds
    expect(screen.getByText(/1h 1m/)).toBeInTheDocument();
  });

  it('should call onSessionExpired when session expires', async () => {
    const expireTime = Math.floor(Date.now() / 1000) + 2; // 2 seconds from now
    const createTime = Math.floor(Date.now() / 1000) - 1800; // 30 minutes ago

    const mockSession = {
      expireTime,
      createTime,
    };

    mockUseSession.mockReturnValue({
      session: mockSession,
      setSession: mockSetSession,
    });

    const mockOnSessionExpired = jest.fn();

    const { default: SessionManager } = await import('./SessionManager');
    
    render(<SessionManager onSessionExpired={mockOnSessionExpired} />);
    
    // Advance timers by 3 seconds
    jest.advanceTimersByTime(3000);
    
    expect(mockOnSessionExpired).toHaveBeenCalled();
  });

  it('should call setSession with null when End Session button is clicked', async () => {
    const mockSession = {
      expireTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      createTime: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    };

    mockUseSession.mockReturnValue({
      session: mockSession,
      setSession: mockSetSession,
    });

    const { default: SessionManager } = await import('./SessionManager');
    
    render(<SessionManager />);
    
    const endSessionButton = screen.getByText('End Session');
    fireEvent.click(endSessionButton);
    
    expect(mockSetSession).toHaveBeenCalledWith(null);
  });
});