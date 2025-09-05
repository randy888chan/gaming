import { renderHook } from '@testing-library/react';
import { useRecentPlays } from './useRecentPlays';

// Mock environment variables
process.env.NEXT_PUBLIC_PLATFORM_CREATOR = 'test-creator-address';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/'
  })
}));

// Mock gamba-core-v2
jest.mock('gamba-core-v2', () => ({}));

// Mock gamba-react-v2
const mockUseGambaEvents = jest.fn();
const mockUseGambaEventListener = jest.fn();

jest.mock('gamba-react-v2', () => ({
  useGambaEvents: mockUseGambaEvents,
  useGambaEventListener: mockUseGambaEventListener
}));

// Mock @solana/web3.js
jest.mock('@solana/web3.js', () => ({
  PublicKey: class {
    constructor(value: string) {
      // Constructor implementation
    }
    
    equals(other: any) {
      return true;
    }
    
    toString() {
      return 'test-creator-address';
    }
  }
}));

describe('useRecentPlays', () => {
  const mockPreviousEvents = [
    {
      signature: 'prev-event-1',
      time: 1000,
      data: {
        creator: {
          equals: () => true
        }
      }
    },
    {
      signature: 'prev-event-2',
      time: 2000,
      data: {
        creator: {
          equals: () => true
        }
      }
    }
  ];

  const mockNewEvent = {
    signature: 'new-event-1',
    time: 3000,
    data: {
      creator: {
        equals: () => true
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGambaEvents.mockReturnValue(mockPreviousEvents);
  });

  it('returns combined events sorted by time', () => {
    const { result } = renderHook(() => useRecentPlays(true));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].signature).toBe('prev-event-2');
    expect(result.current[1].signature).toBe('prev-event-1');
  });

  it('registers GameSettled event listener', () => {
    renderHook(() => useRecentPlays(true));
    
    expect(mockUseGambaEventListener).toHaveBeenCalledWith(
      'GameSettled',
      expect.any(Function),
      expect.any(Array)
    );
  });

  it('filters events by platform creator when platformOnly is true', () => {
    const mockEvent = {
      signature: 'test-event',
      time: 1000,
      data: {
        creator: {
          equals: (address: string) => address === 'test-creator-address'
        }
      }
    };
    
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      callback(mockEvent);
    });
    
    const { result } = renderHook(() => useRecentPlays(true));
    
    // The event should be filtered out because creator doesn't match
    expect(result.current).toHaveLength(2);
  });

  it('includes all events when platformOnly is false', () => {
    const { result } = renderHook(() => useRecentPlays(false));
    
    expect(result.current).toHaveLength(2);
  });

  it('prevents duplicate events', () => {
    mockUseGambaEventListener.mockImplementation((event, callback) => {
      // Add the same event twice
      callback(mockNewEvent);
      callback(mockNewEvent);
    });
    
    const { result } = renderHook(() => useRecentPlays(true));
    
    // Should only have one instance of the event
    const eventCount = result.current.filter(e => e.signature === 'new-event-1').length;
    expect(eventCount).toBe(1);
  });
});