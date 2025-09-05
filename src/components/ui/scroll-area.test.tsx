import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollArea, ScrollBar } from './scroll-area';

describe('ScrollArea', () => {
  it('renders ScrollArea with children', () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>
    );
    
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('applies custom class names to ScrollArea', () => {
    render(
      <ScrollArea className="custom-scroll-area">
        <div>Scrollable content</div>
      </ScrollArea>
    );
    
    const scrollArea = screen.getByText('Scrollable content').closest('[class*="overflow-hidden"]');
    expect(scrollArea).toHaveClass('custom-scroll-area');
  });

  it('renders ScrollBar component', () => {
    render(<ScrollBar data-testid="scroll-bar" />);
    expect(screen.getByTestId('scroll-bar')).toBeInTheDocument();
  });

  it('renders horizontal ScrollBar', () => {
    render(<ScrollBar orientation="horizontal" data-testid="horizontal-scroll-bar" />);
    const scrollBar = screen.getByTestId('horizontal-scroll-bar');
    expect(scrollBar).toBeInTheDocument();
  });
});