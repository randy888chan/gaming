/**
 * Test for HiLo game
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

describe('HiLo Game', () => {
  it('should render without crashing', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('should render game title', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByText('HiLo')).toBeInTheDocument();
  });

  it('should render wager input', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
  });

  it('should render game card', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByTestId('game-card')).toBeInTheDocument();
  });

  it('should render Hi and Lo buttons', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('Lo')).toBeInTheDocument();
  });

  it('should render Cashout button', async () => {
    const { default: HiLoGame } = await import('./index');
    render(<HiLoGame />);
    expect(screen.getByText('Cashout')).toBeInTheDocument();
  });
});