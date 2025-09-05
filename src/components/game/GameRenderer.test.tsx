import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameSlider, CustomError, CustomRenderer } from './GameRenderer';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => {
  const actual = jest.requireActual('gamba-react-ui-v2');
  return {
    ...actual,
    GambaUi: {
      useGame: () => ({
        game: {
          id: 'test-game',
          meta: {
            name: 'Test Game',
            description: 'A test game',
            volatility: 3,
          },
        },
      }),
      PortalTarget: ({ target }: { target: string }) => React.createElement('div', { 'data-testid': `portal-${target}` }, `Portal ${target}`),
      Responsive: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
    },
    useSoundStore: () => ({
      volume: 0,
      set: jest.fn(),
    }),
  };
});

// Mock gamba-react-v2
jest.mock('gamba-react-v2', () => {
  return {
    useAccount: () => ({}),
    useTransactionStore: () => ({
      label: '',
      state: '',
    }),
    useWalletAddress: () => 'test-address',
  };
});

// Mock games
jest.mock('@/games', () => {
  return {
    GAMES: [
      {
        id: 'test-game-1',
        meta: {
          name: 'Test Game 1',
          description: 'First test game',
          volatility: 2,
        },
      },
      {
        id: 'test-game-2',
        meta: {
          name: 'Test Game 2',
          description: 'Second test game',
          volatility: 4,
        },
      },
    ],
  };
});

// Mock components
jest.mock('@/components/Modal', () => {
  return {
    Modal: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => 
      React.createElement('div', { 'data-testid': 'modal' }, 
        children, 
        React.createElement('button', { onClick: onClose }, 'Close')
      ),
  };
});

jest.mock('@/components/game/ProvablyFairModal', () => {
  return {
    ProvablyFairModal: ({ onClose }: { onClose: () => void }) => 
      React.createElement('div', { 'data-testid': 'provably-fair-modal' }, 
        'Provably Fair Modal',
        React.createElement('button', { onClick: onClose }, 'Close')
      ),
  };
});

jest.mock('@/components/Icon', () => {
  return {
    Icon: {
      Info: () => React.createElement('div', {}, 'Info Icon'),
      Fairness: () => React.createElement('div', {}, 'Fairness Icon'),
    },
  };
});

jest.mock('@/components/game/GameCard', () => {
  return {
    GameCard: ({ game }: { game: any }) => 
      React.createElement('div', { 'data-testid': `game-card-${game.id}` }, game.meta.name),
  };
});

jest.mock('@/hooks/useUserStore', () => {
  return {
    useUserStore: () => ({
      newcomer: false,
      gamesPlayed: [],
      set: jest.fn(),
    }),
  };
});

jest.mock('sonner', () => {
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

jest.mock('react-icons/fa', () => {
  return {
    FaStar: () => React.createElement('div', {}, '★'),
    FaVolumeMute: () => React.createElement('div', {}, '🔇'),
    FaVolumeUp: () => React.createElement('div', {}, '🔊'),
  };
});

// Mock gamba-core-v2
jest.mock('gamba-core-v2', () => {
  return {
    decodeGame: jest.fn(),
    getGameAddress: jest.fn(),
  };
});

describe('GameRenderer', () => {
  describe('GameSlider', () => {
    it('should render game cards for all games', () => {
      render(React.createElement(GameSlider, {}));
      
      expect(screen.getByTestId('game-card-test-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-test-game-2')).toBeInTheDocument();
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
      expect(screen.getByText('Test Game 2')).toBeInTheDocument();
    });
  });

  describe('CustomError', () => {
    it('should render error component with correct content', () => {
      render(React.createElement(CustomError, {}));
      
      expect(screen.getByText('😭 Oh no!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('CustomRenderer', () => {
    it('should render the game renderer with all components', () => {
      render(React.createElement(CustomRenderer, {}));
      
      // Check that portals are rendered
      expect(screen.getByTestId('portal-error')).toBeInTheDocument();
      expect(screen.getByTestId('portal-screen')).toBeInTheDocument();
      expect(screen.getByTestId('portal-controls')).toBeInTheDocument();
      expect(screen.getByTestId('portal-play')).toBeInTheDocument();
      
      // Check that icons are rendered
      expect(screen.getByText('Info Icon')).toBeInTheDocument();
      expect(screen.getByText('Fairness Icon')).toBeInTheDocument();
      
      // Check that volume button is rendered
      expect(screen.getByText('🔇')).toBeInTheDocument();
    });

    it('should toggle volume when volume button is clicked', () => {
      render(React.createElement(CustomRenderer, {}));
      
      const volumeButton = screen.getByText('🔇');
      fireEvent.click(volumeButton);
      
      // After clicking, it should change to unmuted icon
      expect(screen.getByText('🔊')).toBeInTheDocument();
    });

    it('should open info modal when info button is clicked', () => {
      render(React.createElement(CustomRenderer, {}));
      
      const infoButton = screen.getByText('Info Icon');
      fireEvent.click(infoButton);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should open provably fair modal when fairness button is clicked', () => {
      render(React.createElement(CustomRenderer, {}));
      
      const fairnessButton = screen.getByText('Fairness Icon');
      fireEvent.click(fairnessButton);
      
      expect(screen.getByTestId('provably-fair-modal')).toBeInTheDocument();
    });
  });
});