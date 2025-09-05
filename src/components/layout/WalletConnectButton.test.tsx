/**
 * Test for WalletConnectButton component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletConnectButton } from './WalletConnectButton';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'common:connect_wallet' ? 'Connect Wallet' : key,
  }),
}));

// Mock @particle-network/connectkit
jest.mock('@particle-network/connectkit', () => ({
  useConnectKit: () => ({
    openConnectModal: jest.fn(),
  }),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  LogIn: () => <div data-testid="login-icon">Login Icon</div>,
}));

describe('WalletConnectButton', () => {
  it('should render without crashing', () => {
    render(<WalletConnectButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should render login icon', () => {
    render(<WalletConnectButton />);
    expect(screen.getByTestId('login-icon')).toBeInTheDocument();
  });

  it('should call openConnectModal when clicked', () => {
    const mockOpenConnectModal = jest.fn();
    
    jest.mock('@particle-network/connectkit', () => ({
      useConnectKit: () => ({
        openConnectModal: mockOpenConnectModal,
      }),
    }));

    // Re-import the component to get the updated mock
    jest.resetModules();
    const { WalletConnectButton } = require('./WalletConnectButton');
    
    render(<WalletConnectButton />);
    const button = screen.getByText('Connect Wallet');
    fireEvent.click(button);
    
    expect(mockOpenConnectModal).toHaveBeenCalledTimes(1);
  });

  it('should have correct CSS classes', () => {
    render(<WalletConnectButton />);
    const button = screen.getByText('Connect Wallet');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('gap-2');
  });
});