import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDisclaimer } from './useDisclaimer';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  GambaUi: {
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="acknowledge-button">
        {children}
      </button>
    )
  }
}));

// Mock Modal component
jest.mock('@/components/Modal', () => ({
  Modal: ({ children, onClose }: any) => (
    <div data-testid="disclaimer-modal">
      <button onClick={onClose} data-testid="close-modal">Close</button>
      {children}
    </div>
  )
}));

// Mock useUserStore hook
let mockAgreedToTerms = false;
const mockSet = jest.fn();

jest.mock('./useUserStore', () => ({
  useUserStore: () => ({
    agreedToTerms: mockAgreedToTerms,
    set: mockSet
  })
}));

// Test component that uses the hook
const TestComponent = () => {
  const { showDisclaimer, DisclaimerModal } = useDisclaimer();
  
  return (
    <div>
      {showDisclaimer && <DisclaimerModal />}
      <div data-testid="disclaimer-status">
        {showDisclaimer ? 'visible' : 'hidden'}
      </div>
    </div>
  );
};

describe('useDisclaimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAgreedToTerms = false;
  });

  it('shows disclaimer modal when user has not agreed to terms', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('disclaimer-status')).toHaveTextContent('visible');
    expect(screen.getByTestId('disclaimer-modal')).toBeInTheDocument();
  });

  it('does not show disclaimer modal when user has agreed to terms', () => {
    mockAgreedToTerms = true;
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('disclaimer-status')).toHaveTextContent('hidden');
    expect(screen.queryByTestId('disclaimer-modal')).not.toBeInTheDocument();
  });

  it('hides disclaimer modal after user acknowledges', () => {
    render(<TestComponent />);
    
    // Initially visible
    expect(screen.getByTestId('disclaimer-status')).toHaveTextContent('visible');
    
    // Click acknowledge button
    const acknowledgeButton = screen.getByTestId('acknowledge-button');
    fireEvent.click(acknowledgeButton);
    
    // Should be hidden now
    expect(screen.getByTestId('disclaimer-status')).toHaveTextContent('hidden');
  });

  it('updates user store when disclaimer is acknowledged', () => {
    render(<TestComponent />);
    
    const acknowledgeButton = screen.getByTestId('acknowledge-button');
    fireEvent.click(acknowledgeButton);
    
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
  });

  it('renders all disclaimer points', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('1. Age Requirement:')).toBeInTheDocument();
    expect(screen.getByText('2. Legal Compliance:')).toBeInTheDocument();
    expect(screen.getByText('3. Risk Acknowledgement:')).toBeInTheDocument();
    expect(screen.getByText('4. No Warranty:')).toBeInTheDocument();
    expect(screen.getByText('5. Limitation of Liability:')).toBeInTheDocument();
    expect(screen.getByText('6. Licensing Disclaimer:')).toBeInTheDocument();
    expect(screen.getByText('7. Fair Play:')).toBeInTheDocument();
    expect(screen.getByText('8. Data Privacy:')).toBeInTheDocument();
    expect(screen.getByText('9. Responsible Gaming:')).toBeInTheDocument();
  });

  it('renders acknowledgment message', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('By playing on our platform, you confirm your compliance.')).toBeInTheDocument();
    expect(screen.getByText('Acknowledge')).toBeInTheDocument();
  });
});