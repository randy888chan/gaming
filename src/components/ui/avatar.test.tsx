import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('renders Avatar component correctly', () => {
    render(<Avatar data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders AvatarImage component correctly', () => {
    render(<AvatarImage data-testid="avatar-image" src="test.jpg" alt="Test" />);
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
  });

  it('renders AvatarFallback component correctly', () => {
    render(<AvatarFallback data-testid="avatar-fallback"> fallback content </AvatarFallback>);
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByText('fallback content')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(<Avatar data-testid="avatar" className="custom-class" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('custom-class');
  });
});