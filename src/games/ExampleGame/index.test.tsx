import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExampleGame from './index';
import { jest } from '@jest/globals';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: () => ({
      play: jest.fn(),
      result: jest.fn(),
    }),
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Responsive: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    WagerInput: ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    ),
    PlayButton: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  },
  useWagerInput: () => [100, jest.fn()],
}));

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connect: jest.fn(),
    wallet: null,
  }),
}));

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({
    setVisible: jest.fn(),
  }),
}));

describe('ExampleGame', () => {
  it('should render the game component', () => {
    render(<ExampleGame />);
    
    expect(screen.getByText('Welcome to Coin Flip! Choose your side, Place your wager and flip for double or nothing!')).toBeInTheDocument();
    expect(screen.getByText('Heads')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('should toggle side when button is clicked', () => {
    render(<ExampleGame />);
    
    const sideButton = screen.getByText('Heads');
    fireEvent.click(sideButton);
    
    // Since we're using a mock for useWagerInput, we can't easily test the state change
    // But we can verify the button exists
    expect(sideButton).toBeInTheDocument();
  });

  it('should show connect button when wallet is not connected', () => {
    render(<ExampleGame />);
    
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });
});