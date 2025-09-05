// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch API
global.fetch = jest.fn();

// Mock Particle Network hooks
jest.mock('@particle-network/connectkit', () => {
  return {
    useConnectKit: () => ({
      openConnectModal: jest.fn()
    }),
    useAccount: () => ({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: false
    })
  };
});