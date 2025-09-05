/**
 * Test for TokenSelect component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the gamba-react-ui-v2 library
jest.mock('gamba-react-ui-v2', () => ({
  GambaPlatformContext: {
    Provider: ({ children }: any) => <div>{children}</div>,
  },
  GambaUi: {
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="gamba-button">
        {children}
      </button>
    ),
    Switch: ({ checked, onChange }: any) => (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid="priority-fee-switch"
      />
    ),
    TextInput: ({ value, onChange }: any) => (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="priority-fee-input"
      />
    ),
  },
  TokenValue: ({ amount }: any) => <span data-testid="token-value">{amount}</span>,
  useCurrentPool: () => ({
    publicKey: { toString: () => 'pool-key' },
    jackpotBalance: 1000000,
    poolFee: 5,
    liquidity: 5000000,
    minWager: 1000,
    maxPayout: 100000,
  }),
  useCurrentToken: () => ({
    image: '/token.png',
    symbol: 'TEST',
    name: 'Test Token',
    mint: 'test-mint',
  }),
  useTokenBalance: () => ({
    balance: 1000000,
    bonusBalance: 50000,
  }),
}));

// Mock other dependencies
jest.mock('../constants', () => ({
  TOKENLIST: {
    token1: {
      mint: 'token1-mint',
      name: 'Token 1',
      symbol: 'TKN1',
      image: '/token1.png',
    },
    token2: {
      mint: 'token2-mint',
      name: 'Token 2',
      symbol: 'TKN2',
      image: '/token2.png',
    },
  },
}));

jest.mock('@/hooks/useUserStore', () => ({
  useUserStore: () => ({
    isPriorityFeeEnabled: false,
    priorityFee: 1000,
    set: jest.fn(),
  }),
}));

jest.mock('./GambaPlayButton', () => {
  return function MockGambaPlayButton({ text, onClick }: any) {
    return (
      <button onClick={onClick} data-testid="gamba-play-button">
        {text}
      </button>
    );
  };
});

jest.mock('./Modal', () => {
  return function MockModal({ children, onClose }: any) {
    return (
      <div data-testid="modal">
        {children}
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    );
  };
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TokenSelect', () => {
  it('should render without crashing', async () => {
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    expect(screen.getByTestId('gamba-button')).toBeInTheDocument();
  });

  it('should display token balance', async () => {
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    expect(screen.getByTestId('token-value')).toBeInTheDocument();
  });

  it('should open modal when button is clicked', async () => {
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    fireEvent.click(screen.getByTestId('gamba-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('should display available tokens in modal', async () => {
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    fireEvent.click(screen.getByTestId('gamba-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Token 1')).toBeInTheDocument();
      expect(screen.getByText('Token 2')).toBeInTheDocument();
    });
  });

  it('should handle token selection', async () => {
    const mockSetPool = jest.fn();
    
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: mockSetPool } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    fireEvent.click(screen.getByTestId('gamba-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Token 1'));
    
    expect(mockSetPool).toHaveBeenCalledWith('token1-mint');
  });

  it('should handle priority fee toggle', async () => {
    const { default: TokenSelect } = await import('./TokenSelect');
    
    render(
      <GambaPlatformContext.Provider value={{ setPool: jest.fn() } as any}>
        <TokenSelect />
      </GambaPlatformContext.Provider>
    );
    
    fireEvent.click(screen.getByTestId('gamba-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    const switchElement = screen.getByTestId('priority-fee-switch');
    fireEvent.click(switchElement);
    
    expect(switchElement).toBeInTheDocument();
  });
});