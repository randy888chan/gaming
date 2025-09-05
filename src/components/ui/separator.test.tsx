import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('renders vertical separator when orientation is vertical', () => {
    render(<Separator orientation="vertical" data-testid="vertical-separator" />);
    const separator = screen.getByTestId('vertical-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('applies custom class names', () => {
    render(<Separator className="custom-class" data-testid="custom-separator" />);
    const separator = screen.getByTestId('custom-separator');
    expect(separator).toHaveClass('custom-class');
  });
});