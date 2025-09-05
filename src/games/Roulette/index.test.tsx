/**
 * Test for Roulette game
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  useGamba: () => ({
    play: jest.fn(),
    result: null,
    status: {},
  }),
  useSound: () => jest.fn(),
  useWagerInput: () => [1, () => {}, { value: 1 }],
  GameContainer: ({ children }: any) => <div data-testid="game-container">{children}</div>,
  GameResult: ({ children }: any) => <div data-testid="game-result">{children}</div>,
  GameUi: {
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    WagerInput: () => <div data-testid="wager-input">Wager Input</div>,
    Card: ({ children }: any) => <div data-testid="game-card">{children}</div>,
  },
  TokenValue: ({ amount }: any) => <span>{amount}</span>,
}));

describe('Roulette Game', () => {
  it('should render without crashing', async () => {
    const { default: RouletteGame } = await import('./index');
    render(<RouletteGame />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('should render game title', async () => {
    const { default: RouletteGame } = await import('./index');
    render(<RouletteGame />);
    expect(screen.getByText('Roulette')).toBeInTheDocument();
  });

  it('should render wager input', async () => {
    const { default: RouletteGame } = await import('./index');
    render(<RouletteGame />);
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
  });

  it('should render game table', async () => {
    const { default: RouletteGame } = await import('./index');
    render(<RouletteGame />);
    expect(screen.getByTestId('game-card')).toBeInTheDocument();
  });

  it('should render Spin button', async () => {
    const { default: RouletteGame } = await import('./index');
    render(<RouletteGame />);
    expect(screen.getByText('Spin')).toBeInTheDocument();
  });
});