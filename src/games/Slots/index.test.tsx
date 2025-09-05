/**
 * Test for Slots game
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

describe('Slots Game', () => {
  it('should render without crashing', async () => {
    const { default: SlotsGame } = await import('./index');
    render(<SlotsGame />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('should render game title', async () => {
    const { default: SlotsGame } = await import('./index');
    render(<SlotsGame />);
    expect(screen.getByText('Slots')).toBeInTheDocument();
  });

  it('should render wager input', async () => {
    const { default: SlotsGame } = await import('./index');
    render(<SlotsGame />);
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
  });

  it('should render game slots', async () => {
    const { default: SlotsGame } = await import('./index');
    render(<SlotsGame />);
    expect(screen.getByTestId('game-card')).toBeInTheDocument();
  });

  it('should render Spin button', async () => {
    const { default: SlotsGame } = await import('./index');
    render(<SlotsGame />);
    expect(screen.getByText('Spin')).toBeInTheDocument();
  });
});