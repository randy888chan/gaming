import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dice from './index';
import { jest } from '@jest/globals';

const mockPlay = jest.fn();
// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: () => ({
      play: mockPlay,
      result: jest.fn(),
    }),
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
    Responsive: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive">{children}</div>,
    WagerInput: ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
      <input
        data-testid="wager-input"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    ),
    TokenValue: ({ amount }: { amount: number }) => <div>{amount}</div>,
  },
  useWagerInput: () => [100, jest.fn()],
  useCurrentPool: () => ({
    maxPayout: 10000,
  }),
  useSound: () => ({
    play: jest.fn(),
  }),
}));

// Mock gamba-react-v2
jest.mock('gamba-react-v2', () => ({
  useGamba: () => ({
    isPlaying: false,
  }),
}));

// Mock components
jest.mock('@/components/GambaPlayButton', () => ({
    __esModule: true,
    default: ({ onClick, text }: { onClick: () => void; text: string }) => (
        <button data-testid="gamba-play-button" onClick={onClick}>{text}</button>
    )
}));

// Mock slider component
jest.mock('./slide', () => {
  const MockComponent = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
    <input
      data-testid="dice-slider"
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
  MockComponent.displayName = 'Slider';
  return MockComponent;
});

// Mock styles
jest.mock('./styles', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div data-testid="container">{children}</div>,
  Result: ({ children }: { children: React.ReactNode }) => <div data-testid="result">{children}</div>,
  RollUnder: ({ children }: { children: React.ReactNode }) => <div data-testid="roll-under">{children}</div>,
  Stats: ({ children }: { children: React.ReactNode }) => <div data-testid="stats">{children}</div>,
}));

describe('Dice Game', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
  it('should render the dice game component', () => {
    render(<Dice />);
    
    // Check that key elements are rendered
    expect(screen.getByText('Roll Under')).toBeInTheDocument();
    expect(screen.getByText('Win Chance')).toBeInTheDocument();
    expect(screen.getByText('Multiplier')).toBeInTheDocument();
    expect(screen.getByText('Payout')).toBeInTheDocument();
    expect(screen.getByText('Roll')).toBeInTheDocument();
  });

  it('should have consistent multiplier and bet values', () => {
    render(<Dice />);
    const slider = screen.getByTestId('dice-slider');

    // Test with a roll under value of 50
    fireEvent.change(slider, { target: { value: '50' } });
    expect(screen.getByText('2.00x')).toBeInTheDocument();
    
    const playButton = screen.getByTestId('gamba-play-button');
    fireEvent.click(playButton);

    const expectedBet = Array(100).fill(0).map((_, i) => (i < 50 ? 2 : 0));
    expect(mockPlay).toHaveBeenCalledWith({
        wager: 100,
        bet: expectedBet,
    });

    // Test with a roll under value of 25
    fireEvent.change(slider, { target: { value: '25' } });
    expect(screen.getByText('4.00x')).toBeInTheDocument();

    fireEvent.click(playButton);
    const expectedBet2 = Array(100).fill(0).map((_, i) => (i < 25 ? 4 : 0));
    expect(mockPlay).toHaveBeenCalledWith({
        wager: 100,
        bet: expectedBet2,
    });
  });
});
