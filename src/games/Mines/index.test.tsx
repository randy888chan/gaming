/**
 * Test for Mines game
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

describe('Mines Game', () => {
  it('should render without crashing', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('should render game title', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByText('Mines')).toBeInTheDocument();
  });

  it('should render wager input', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
  });

  it('should render game grid', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByTestId('game-card')).toBeInTheDocument();
  });

  it('should render Start button', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should render Cashout button', async () => {
    const { default: MinesGame } = await import('./index');
    render(<MinesGame />);
    expect(screen.getByText('Cashout')).toBeInTheDocument();
  });
});