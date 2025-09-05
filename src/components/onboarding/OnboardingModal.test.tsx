import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingModal from './OnboardingModal';

// Mock the Particle Network hooks
jest.mock('@particle-network/connectkit', () => ({
  useConnectKit: () => ({
    openConnectModal: jest.fn()
  }),
  useAccount: () => ({
    address: '0x1234567890abcdef1234567890abcdef12345678',
    isConnected: false
  })
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('OnboardingModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<OnboardingModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Welcome to the Game!')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Welcome to the Game!')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls openConnectModal when connect wallet button is clicked', () => {
    const mockOpenConnectModal = jest.fn();
    jest.spyOn(require('@particle-network/connectkit'), 'useConnectKit').mockReturnValue({
      openConnectModal: mockOpenConnectModal
    });

    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);
    expect(mockOpenConnectModal).toHaveBeenCalledTimes(1);
  });

  it('shows claim credits button when connected', () => {
    jest.spyOn(require('@particle-network/connectkit'), 'useAccount').mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true
    });

    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Claim First Play Credits')).toBeInTheDocument();
  });

  it('claims credits successfully', async () => {
    jest.spyOn(require('@particle-network/connectkit'), 'useAccount').mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true
    });

    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    const claimButton = screen.getByText('Claim First Play Credits');
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(screen.getByText('Credits Claimed!')).toBeInTheDocument();
    });
  });

  it('shows error message when claiming credits fails', async () => {
    jest.spyOn(require('@particle-network/connectkit'), 'useAccount').mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(<OnboardingModal isOpen={true} onClose={mockOnClose} />);
    const claimButton = screen.getByText('Claim First Play Credits');
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to claim credits. Please try again.')).toBeInTheDocument();
    });
  });
});