import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from './label';

describe('Label', () => {
  it('renders label correctly', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(<Label className="custom-class">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('custom-class');
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });
});