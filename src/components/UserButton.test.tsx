import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserButton } from './UserButton';

// Mock dependencies
jest.mock('gamba-react-v2', () => ({
  useGambaProvider: () => ({}),
  useWalletAddress: () => ({ toBase58: () => 'testAddress123' })
}));

jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="gamba-button">
        {children}
      </button>
    )
  }
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  );
});

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    publicKey: { toString: () => 'testPublicKey123' }
  })
}));

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({
    setVisible: jest.fn()
  })
}));

jest.mock('@/hooks/useUserStore', () => ({
  useUserStore: () => ({
    referralCode: 'testReferralCode'
  })
}));

jest.mock('@/constants', () => ({
  PLATFORM_REFERRAL_FEE: 0.05
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  },
  writable: true
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}));

describe('UserButton', () => {
  it('renders connect button when wallet is not connected', () => {
    render(<UserButton />);
    
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('renders user button with truncated address when wallet is connected', () => {
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => ({
        connected: true,
        connecting: false,
        connect: jest.fn(),
        disconnect: jest.fn(),
        wallet: { adapter: { icon: 'test-icon.png' } },
        publicKey: { toString: () => 'testPublicKey123' }
      })
    }));
    
    render(<UserButton />);
    
    expect(screen.getByText('tes...123')).toBeInTheDocument();
  });

  it('opens modal when user button is clicked', () => {
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => ({
        connected: true,
        connecting: false,
        connect: jest.fn(),
        disconnect: jest.fn(),
        wallet: { adapter: { icon: 'test-icon.png' } },
        publicKey: { toString: () => 'testPublicKey123' }
      })
    }));
    
    render(<UserButton />);
    
    const userButton = screen.getByTestId('gamba-button');
    fireEvent.click(userButton);
    
    expect(screen.getByText('test...ss123')).toBeInTheDocument();
  });

  it('calls connect function when connect button is clicked', () => {
    const mockConnect = jest.fn();
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => ({
        connected: false,
        connecting: false,
        connect: mockConnect,
        disconnect: jest.fn(),
        wallet: { adapter: { icon: 'test-icon.png' } },
        publicKey: { toString: () => 'testPublicKey123' }
      })
    }));
    
    render(<UserButton />);
    
    const connectButton = screen.getByText('Connect');
    fireEvent.click(connectButton);
    
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
});