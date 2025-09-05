import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders skeleton with default dimensions', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('w-full', 'h-4');
  });

  it('renders skeleton with custom width and height', () => {
    render(<Skeleton width="32" height="8" data-testid="custom-skeleton" />);
    const skeleton = screen.getByTestId('custom-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('w-32', 'h-8');
  });

  it('applies custom class names', () => {
    render(<Skeleton className="custom-class" data-testid="classed-skeleton" />);
    const skeleton = screen.getByTestId('classed-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});