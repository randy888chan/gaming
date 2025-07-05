import 'whatwg-fetch'; // Polyfill for fetch and Response
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreditConfigPanel from '@/components/admin/CreditConfigPanel';

jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

describe('CreditConfigPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url: RequestInfo | URL, init?: RequestInit) => {
      console.log('Fetch intercepted:', { url, method: init?.method });
      if (url.toString().startsWith('/api/v1/admin/credit-config') && (init?.method === 'GET' || init?.method === undefined)) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          config: {
            id: 'default-credit-config',
            name: 'Default Credit Configuration',
            rules: {
              enabled: true,
              creditAmountUSDC: 100,
              chains: ['solana', 'ethereum'],
              treasuryWallet: '0x123abc',
              kmsProvider: 'mock',
            },
          },
        }), { status: 200 }));
      } else if (url === '/api/v1/admin/credit-config' && init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        // Simulate server-side validation for POST requests
        if (body.rules.creditAmountUSDC <= 0 || !body.rules.treasuryWallet || body.rules.chains.length === 0 || !body.rules.kmsProvider) {
          return Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Server-side validation failed.' }), { status: 400 }));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: true, config: body }), { status: 200 }));
      }
      return Promise.reject(new Error(`Unhandled fetch request: ${url}`));
    });
  });

  test('renders and loads initial config', async () => {
    render(<CreditConfigPanel />);
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument());

    expect(screen.getByLabelText('Enable Credit System')).toBeChecked();
    expect(screen.getByLabelText('Credit Amount (USDC):')).toHaveValue(100);
    expect(screen.getByLabelText('Chains (comma-separated):')).toHaveValue('solana, ethereum');
    expect(screen.getByLabelText('Treasury Wallet:')).toHaveValue('0x123abc');
    expect(screen.getByLabelText('KMS Provider:')).toHaveValue('mock');
  });

  test('handles input changes', async () => {
    render(<CreditConfigPanel />);
    await waitFor(() => expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument());

    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):');
    fireEvent.change(creditAmountInput, { target: { name: 'creditAmountUSDC', value: '200' } });
    expect(creditAmountInput).toHaveValue(200);

    const chainsInput = screen.getByLabelText('Chains (comma-separated):');
    fireEvent.change(chainsInput, { target: { name: 'chains', value: 'eth, bsc' } });
    expect(chainsInput).toHaveValue('eth, bsc');

    const treasuryWalletInput = screen.getByLabelText('Treasury Wallet:');
    fireEvent.change(treasuryWalletInput, { target: { name: 'treasuryWallet', value: '0xdef456' } });
    expect(treasuryWalletInput).toHaveValue('0xdef456');

    const kmsProviderInput = screen.getByLabelText('KMS Provider:');
    fireEvent.change(kmsProviderInput, { target: { name: 'kmsProvider', value: 'aws' } });
    expect(kmsProviderInput).toHaveValue('aws');

    const enabledCheckbox = screen.getByLabelText('Enable Credit System');
    fireEvent.click(enabledCheckbox);
    expect(enabledCheckbox).not.toBeChecked();
  });

  test('shows validation errors for invalid input on save', async () => {
    render(<CreditConfigPanel />);
    await waitFor(() => expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument());

    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):');
    fireEvent.change(creditAmountInput, { target: { name: 'creditAmountUSDC', value: '0' } });

    const treasuryWalletInput = screen.getByLabelText('Treasury Wallet:');
    fireEvent.change(treasuryWalletInput, { target: { name: 'treasuryWallet', value: '' } });

    const chainsInput = screen.getByLabelText('Chains (comma-separated):');
    fireEvent.change(chainsInput, { target: { name: 'chains', value: '' } });

    const kmsProviderInput = screen.getByLabelText('KMS Provider:');
    fireEvent.change(kmsProviderInput, { target: { name: 'kmsProvider', value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));

    await waitFor(() => {
      expect(screen.getByText('Credit Amount (USDC) must be a positive number.')).toBeInTheDocument();
      expect(screen.getByText('Treasury Wallet cannot be empty.')).toBeInTheDocument();
      expect(screen.getByText('At least one chain must be specified.')).toBeInTheDocument();
      expect(screen.getByText('KMS Provider cannot be empty.')).toBeInTheDocument();
    });
  });

  test('saves configuration successfully', async () => {
    render(<CreditConfigPanel />);
    await waitFor(() => expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument());

    const creditAmountInput = screen.getByLabelText('Credit Amount (USDC):');
    fireEvent.change(creditAmountInput, { target: { name: 'creditAmountUSDC', value: '150' } });

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));

    await waitFor(() => {
      expect(screen.getByText('Configuration saved successfully!')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/credit-config',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          id: 'default-credit-config',
          name: 'Default Credit Configuration',
          rules: {
            enabled: true,
            creditAmountUSDC: 150,
            chains: ['solana', 'ethereum'],
            treasuryWallet: '0x123abc',
            kmsProvider: 'mock',
          },
        }),
      }),
    );
  });

  test('displays error message on fetch failure', async () => {

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Failed to fetch config' }), { status: 500 }))
      );

    render(<CreditConfigPanel />);
    await waitFor(() => expect(screen.getByText('Error: Failed to fetch config')).toBeInTheDocument());
  });

  test('displays error message on save failure', async () => {

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({
          success: true,
          config: {
            id: 'default-credit-config',
            name: 'Default Credit Configuration',
            rules: {
              enabled: true,
              creditAmountUSDC: 100,
              chains: ['solana', 'ethereum'],
              treasuryWallet: '0x123abc',
              kmsProvider: 'mock',
            },
          },
        }), { status: 200 }))
      ) // Mock for the initial GET request
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Failed to save config' }), { status: 500 }))
      );

    render(<CreditConfigPanel />);
    await waitFor(() => expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to save config')).toBeInTheDocument();
    });
  });
});