import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GambaPlayButton from './GambaPlayButton';

// Mock gamba-react-ui-v2
jest.mock('gamba-react-ui-v2', () => ({
  useSound: () => ({
    play: jest.fn(),
  }),
  useGamba: () => ({
    isPlaying: false,
  }),
}));

describe('GambaPlayButton', () => {
  it('should render without crashing', () => {
    render(<GambaPlayButton onClick={jest.fn()} text="Play" />);
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<GambaPlayButton onClick={mockOnClick} text="Play" />);
    const button = screen.getByText('Play');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isPlaying is true', () => {
    // Mock useGamba to return isPlaying: true
    jest.mock('gamba-react-ui-v2', () => ({
      useSound: () => ({
        play: jest.fn(),
      }),
      useGamba: () => ({
        isPlaying: true,
      }),
    }));
    
    render(<GambaPlayButton onClick={jest.fn()} text="Play" />);
    const button = screen.getByText('Play');
    expect(button).toBeDisabled();
  });

  it('should render with custom className', () => {
    render(<GambaPlayButton onClick={jest.fn()} text="Play" className="custom-class" />);
    const button = screen.getByText('Play');
    expect(button).toHaveClass('custom-class');
  });
});
