import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProvablyFairModal } from './ProvablyFairModal';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaPlatformContext: {
    Provider: ({ children }: any) => <div>{children}</div>,
    Consumer: ({ children }: any) => children({ clientSeed: 'test-seed', setClientSeed: jest.fn() })
  },
  GambaUi: {
    TextInput: ({ value, disabled, onChange }: any) => (
      <input 
        data-testid="text-input"
        value={value} 
        disabled={disabled} 
        onChange={(e) => onChange && onChange(e.target.value)} 
      />
    ),
    Button: ({ children, onClick, disabled }: any) => (
      <button 
        data-testid="gamba-button"
        onClick={onClick} 
        disabled={disabled}
      >
        {children}
      </button>
    )
  },
  useGamba: () => ({
    userCreated: false,
    nextRngSeedHashed: 'test-hash',
    isPlaying: false
  })
}));

// Mock gamba-react-v2
jest.mock('gamba-react-v2', () => ({
  useGamba: () => ({
    userCreated: false,
    nextRngSeedHashed: 'test-hash',
    isPlaying: false
  }),
  useGambaProgram: () => ({
    methods: {
      playerInitialize: () => ({
        accounts: () => ({
          instruction: () => 'test-instruction'
        })
      })
    }
  }),
  useSendTransaction: () => jest.fn()
}));

// Mock Icon component
jest.mock('@/components/Icon', () => ({
  Icon: {
    Shuffle: () => <div data-testid="shuffle-icon" />
  }
}));

// Mock Modal component
jest.mock('@/components/Modal', () => ({
  Modal: ({ children, onClose }: any) => (
    <div data-testid="modal">
      <button onClick={onClose} data-testid="close-button">Close</button>
      {children}
    </div>
  )
}));

// Mock GambaPlayButton component
jest.mock('@/components/GambaPlayButton', () => {
  return ({ onClick, text }: any) => (
    <button onClick={onClick} data-testid="gamba-play-button">
      {text}
    </button>
  );
});

describe('ProvablyFairModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with title', () => {
    render(<ProvablyFairModal onClose={mockOnClose} />);
    
    expect(screen.getByText('Provably Fair')).toBeInTheDocument();
  });

  it('renders initialization content when user is not created', () => {
    render(<ProvablyFairModal onClose={mockOnClose} />);
    
    expect(screen.getByText(/Provably Fair allows you to verify/)).toBeInTheDocument();
    expect(screen.getByTestId('gamba-play-button')).toBeInTheDocument();
    expect(screen.getByText('Get hashed seed')).toBeInTheDocument();
  });

  it('renders client seed content when user is created', () => {
    // Mock useGamba to return userCreated = true
    jest.mock('gamba-react-v2', () => ({
      useGamba: () => ({
        userCreated: true,
        nextRngSeedHashed: 'test-hash',
        isPlaying: false
      }),
      useGambaProgram: () => ({
        methods: {
          playerInitialize: () => ({
            accounts: () => ({
              instruction: () => 'test-instruction'
            })
          })
        }
      }),
      useSendTransaction: () => jest.fn()
    }));
    
    render(<ProvablyFairModal onClose={mockOnClose} />);
    
    expect(screen.getByText(/Your client seed will affect/)).toBeInTheDocument();
    expect(screen.getByTestId('text-input')).toBeInTheDocument();
    expect(screen.getByTestId('gamba-button')).toBeInTheDocument();
    expect(screen.getByTestId('shuffle-icon')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ProvablyFairModal onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls initialize function when Get hashed seed button is clicked', () => {
    const mockSendTransaction = jest.fn();
    jest.mock('gamba-react-v2', () => ({
      useGamba: () => ({
        userCreated: false,
        nextRngSeedHashed: 'test-hash',
        isPlaying: false
      }),
      useGambaProgram: () => ({
        methods: {
          playerInitialize: () => ({
            accounts: () => ({
              instruction: () => 'test-instruction'
            })
          })
        }
      }),
      useSendTransaction: () => mockSendTransaction
    }));
    
    render(<ProvablyFairModal onClose={mockOnClose} />);
    
    const initializeButton = screen.getByTestId('gamba-play-button');
    fireEvent.click(initializeButton);
    
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
  });
});