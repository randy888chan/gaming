import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Flip from './index';
import { jest } from '@jest/globals';

// Mock gamba-react-ui-v2
const mockPlay = jest.fn();
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: () => ({
      play: mockPlay,
    }),
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    WagerInput: ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
      <input
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid="wager-input"
      />
    ),
  },
  useCurrentToken: () => ({
    symbol: 'SOL',
    decimals: 9,
  }),
  useSound: () => ({
    play: jest.fn(),
  }),
}));

// Mock gamba-react-v2
jest.mock('gamba-react-v2', () => ({
  useGamba: () => ({
    result: jest.fn().mockResolvedValue({
      payout: 0,
      resultIndex: 0,
    }),
  }),
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the components
jest.mock('./FlipBanner', () => ({
  BannerWithMessages: ({ messages }: { messages: string[] }) => <div>{messages.join(' ')}</div>,
  FlipBanner: () => <div>FlipBanner</div>,
}));

jest.mock('./Coin', () => ({
  Coin: ({ coinId }: { coinId: string }) => <div data-testid={`coin-${coinId}`}>Coin</div>,
}));

jest.mock('./Effect', () => ({
  Effect: () => <div>Effect</div>,
}));

// Mock the GambaPlayButton component
jest.mock('@/components/GambaPlayButton', () => ({
  __esModule: true,
  default: ({ onClick, text }: { onClick: () => void; text: string }) => (
    <button onClick={onClick} data-testid="flip-button">
      {text}
    </button>
  ),
}));

describe('Flip Game', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

  it('should render without crashing', () => {
    render(<Flip />);
    
    // Check if the main components are rendered
    expect(screen.getByText('Flip to win!')).toBeInTheDocument();
    // The key prop is not passed to the component, so we can't use it in the test id.
    // Instead, we can check for the two coin components by their text content.
    expect(screen.getAllByText('Coin')).toHaveLength(2);
    expect(screen.getByText('FlipBanner')).toBeInTheDocument();
    expect(screen.getByText('Effect')).toBeInTheDocument();
    
    // Check if the controls are rendered
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
    expect(screen.getByTestId('flip-button')).toBeInTheDocument();
    expect(screen.getByText('Flip')).toBeInTheDocument();
  });

  it('should display initial messages', () => {
    render(<Flip />);
    
    // The banner should show the initial message
    expect(screen.getByText('Flip to win!')).toBeInTheDocument();
  });

  it('should display an error message when the game fails to play', async () => {
    mockPlay.mockRejectedValue(new Error('Test error'));
    render(<Flip />);
    const flipButton = screen.getByTestId('flip-button');
    fireEvent.click(flipButton);

    await waitFor(() => {
        expect(screen.getByText(/An error occurred: Test error/)).toBeInTheDocument();
    });
  });
});
