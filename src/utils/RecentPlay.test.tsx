/**
 * Test for RecentPlay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock gamba-core-v2 and gamba-react-ui-v2
jest.mock('gamba-core-v2', () => ({
  BPS_PER_WHOLE: 10000,
}));

jest.mock('gamba-react-ui-v2', () => ({
  TokenValue: ({ amount, mint }: { amount: number; mint: string }) => (
    <span data-testid="token-value">{amount}</span>
  ),
  useTokenMeta: () => ({
    image: '/token.png',
    symbol: 'TEST',
  }),
}));

// Mock the games module
jest.mock('@/games', () => ({
  GAMES: [
    {
      id: 'dice',
      meta: {
        name: 'Dice',
        image: '/games/dice/logo.png',
        description: 'A simple dice game',
        volatility: 1,
      },
    },
  ],
}));

// Mock the RecentPlay component's dependencies
const mockEvent = {
  data: {
    metadata: 'v1:dice:extra-data',
    tokenMint: 'test-mint',
    bet: [20000, 0], // 2x multiplier
    wager: { toNumber: () => 1000000 },
    resultIndex: { toNumber: () => 0 },
    user: {
      toBase58: () => 'userPublicKey123456789abcdefghijk',
    },
    jackpotPayoutToUser: { toNumber: () => 0 },
  },
};

// We need to dynamically import the component since it's a React component
describe('RecentPlay', () => {
  it('should render without crashing', async () => {
    // Dynamically import the component
    const { RecentPlay } = await import('./RecentPlay');
    
    // Render the component
    render(<RecentPlay event={mockEvent as any} />);
    
    // Check if the component renders
    expect(screen.getByText('WON')).toBeInTheDocument();
  });

  it('should display correct profit calculation', async () => {
    const { RecentPlay } = await import('./RecentPlay');
    
    render(<RecentPlay event={mockEvent as any} />);
    
    // Check if profit is calculated correctly (2x multiplier on 1000000 wager = 2000000 payout, 1000000 profit)
    expect(screen.getByTestId('token-value')).toHaveTextContent('1000000');
  });

  it('should display user address correctly', async () => {
    const { RecentPlay } = await import('./RecentPlay');
    
    render(<RecentPlay event={mockEvent as any} />);
    
    // Check if user address is displayed correctly (first 4 and last 4 characters)
    expect(screen.getByText('user...hijk')).toBeInTheDocument();
  });

  it('should handle unknown games', async () => {
    const unknownGameEvent = {
      data: {
        metadata: 'v1:unknown-game:extra-data',
        tokenMint: 'test-mint',
        bet: [20000, 0],
        wager: { toNumber: () => 1000000 },
        resultIndex: { toNumber: () => 0 },
        user: {
          toBase58: () => 'userPublicKey123456789abcdefghijk',
        },
        jackpotPayoutToUser: { toNumber: () => 0 },
      },
    };
    
    const { RecentPlay } = await import('./RecentPlay');
    
    render(<RecentPlay event={unknownGameEvent as any} />);
    
    // Check if unknown game is handled correctly
    expect(screen.getByText('WON')).toBeInTheDocument();
  });
});