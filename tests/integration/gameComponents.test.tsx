// tests/integration/gameComponents.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameGrid } from '@/components/game/GameGrid';
// GameCard is used by GameGrid, so it's implicitly tested.
import { GAMES } from '@/games'; // GAMES is used by GameGrid

// Define individual mock functions for the router controller parts
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockReload = jest.fn();
const mockBack = jest.fn();
const mockPrefetch = jest.fn(() => Promise.resolve());
const mockEventOn = jest.fn();
const mockEventOff = jest.fn();
const mockEventEmit = jest.fn();
const mockBeforePopState = jest.fn(() => true);

// This object aggregates the individual mock functions and static properties
const mockRouterControllerDetails = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: mockPush,
  replace: mockReplace,
  reload: mockReload,
  back: mockBack,
  prefetch: mockPrefetch,
  events: {
    on: mockEventOn,
    off: mockEventOff,
    emit: mockEventEmit,
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  beforePopState: mockBeforePopState,
};

jest.mock('next/router', () => {
  const actualNextRouter = jest.requireActual('next/router');

  // The factory uses the mock functions defined in the module scope,
  // which are hoisted along with jest.mock.
  const controllerForFactory = {
    basePath: '', pathname: '/', route: '/', query: {}, asPath: '/',
    push: mockPush,
    replace: mockReplace,
    reload: mockReload,
    back: mockBack,
    prefetch: mockPrefetch,
    events: { on: mockEventOn, off: mockEventOff, emit: mockEventEmit },
    isFallback: false, isLocaleDomain: false, isReady: true, isPreview: false,
    beforePopState: mockBeforePopState,
  };

  const mockSingletonRouter = {
    ...actualNextRouter.default, // Spread properties from the actual default export
    router: controllerForFactory, // CRITICAL: set the .router property to our controller
    // Ensure methods Link might call on the singleton directly are also from our controller
    push: controllerForFactory.push,
    replace: controllerForFactory.replace,
    reload: controllerForFactory.reload,
    back: controllerForFactory.back,
    prefetch: controllerForFactory.prefetch,
    events: controllerForFactory.events,
  };

  return {
    __esModule: true,
    ...actualNextRouter, // Spread other actual named exports
    useRouter: () => controllerForFactory, // useRouter returns this controller
    default: mockSingletonRouter, // This is the Router singleton
  };
});

beforeEach(() => {
  // Clear individual mock functions
  mockPush.mockClear();
  mockReplace.mockClear();
  mockReload.mockClear();
  mockBack.mockClear();
  mockPrefetch.mockClear();
  mockEventOn.mockClear();
  mockEventOff.mockClear();
  mockEventEmit.mockClear();
  mockBeforePopState.mockClear();
});

// Mock Gamba context for components that might use it
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    useGame: jest.fn().mockReturnValue({
      game: 'crash',
      setGame: jest.fn(),
    }),
  },
}));

describe('Game Components Integration Tests', () => {
  test('GameGrid renders game cards', () => {
    render(<GameGrid />);
    // Check if a few games are present
    expect(screen.getByText('Play Crash')).toBeInTheDocument();
    expect(screen.getByText('Play Dice')).toBeInTheDocument();
  });

  test('GameCard links to the correct game page', () => {
    render(<GameGrid />);

    const linkElement = screen.getByTestId('game-card-slots');
    fireEvent.click(linkElement);

    // Assert that the router's push function was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/play/slots');
  });
});
