import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreditConfigPanel from './CreditConfigPanel';

// Mock the fetch API
global.fetch = jest.fn();

describe('CreditConfigPanel', () => {
  const mockConfig = {
    id: 'default-credit-config',
    name: 'Default Credit Configuration',
    rules: {
      enabled: true,
      creditAmountUSDC: 100,
      chains: ['ethereum', 'polygon'],
      treasuryWallet: '0x1234567890123456789012345678901234567890',
      kmsProvider: 'aws-kms'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<CreditConfigPanel />);
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch' })
    });

    render(<CreditConfigPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('renders configuration form when fetch succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, config: mockConfig })
    });

    render(<CreditConfigPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Configuration Panel')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Enable Credit System')).toBeInTheDocument();
    expect(screen.getByLabelText('Credit Amount (USDC):')).toBeInTheDocument();
    expect(screen.getByLabelText('Chains (comma-separated):')).toBeInTheDocument();
    expect(screen.getByLabelText('Treasury Wallet:')).toBeInTheDocument();
    expect(screen.getByLabelText('KMS Provider:')).toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, config: mockConfig })
    });

    render(<CreditConfigPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Configuration Panel')).toBeInTheDocument();
    });

    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):') as HTMLInputElement;
    fireEvent.change(creditAmountInput, { target: { value: '200' } });
    expect(creditAmountInput.value).toBe('200');

    const treasuryWalletInput = screen.getByLabelText('Treasury Wallet:') as HTMLInputElement;
    fireEvent.change(treasuryWalletInput, { target: { value: '0xabcdef' } });
    expect(treasuryWalletInput.value).toBe('0xabcdef');
  });

  it('shows validation errors when saving with invalid data', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, config: mockConfig })
    });

    render(<CreditConfigPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Configuration Panel')).toBeInTheDocument();
    });

    // Clear the credit amount
    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):') as HTMLInputElement;
    fireEvent.change(creditAmountInput, { target: { value: '0' } });

    // Clear the treasury wallet
    const treasuryWalletInput = screen.getByLabelText('Treasury Wallet:') as HTMLInputElement;
    fireEvent.change(treasuryWalletInput, { target: { value: '' } });

    // Click save
    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Credit Amount (USDC) must be a positive number.')).toBeInTheDocument();
      expect(screen.getByText('Treasury Wallet cannot be empty.')).toBeInTheDocument();
    });
  });

  it('saves configuration successfully', async () => {
    // Mock the initial fetch
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, config: mockConfig })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, config: { ...mockConfig, rules: { ...mockConfig.rules, creditAmountUSDC: 200 } } })
      });

    render(<CreditConfigPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Configuration Panel')).toBeInTheDocument();
    });

    // Change credit amount
    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):') as HTMLInputElement;
    fireEvent.change(creditAmountInput, { target: { value: '200' } });

    // Click save
    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Configuration saved successfully!')).toBeInTheDocument();
    });
  });
});