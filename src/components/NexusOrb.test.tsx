import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NexusOrb } from './NexusOrb';
import { Star } from 'lucide-react';

describe('NexusOrb', () => {
  it('renders NexusOrb with label and icon', () => {
    render(
      <NexusOrb 
        href="/test" 
        label="Test Label" 
        icon={<Star data-testid="test-icon" />} 
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders as a link with correct href', () => {
    render(
      <NexusOrb 
        href="/test-path" 
        label="Test Label" 
        icon={<Star />} 
      />
    );
    
    const link = screen.getByText('Test Label').closest('a');
    expect(link).toHaveAttribute('href', '/test-path');
  });

  it('applies active classes when isActive is true', () => {
    render(
      <NexusOrb 
        href="/test" 
        label="Test Label" 
        icon={<Star />} 
        isActive={true}
      />
    );
    
    const orb = screen.getByText('Test Label').closest('div');
    expect(orb).toHaveClass('scale-110', 'shadow-2xl');
  });

  it('does not apply active classes when isActive is false', () => {
    render(
      <NexusOrb 
        href="/test" 
        label="Test Label" 
        icon={<Star />} 
        isActive={false}
      />
    );
    
    const orb = screen.getByText('Test Label').closest('div');
    expect(orb).not.toHaveClass('scale-110', 'shadow-2xl');
  });

  it('applies custom class names', () => {
    render(
      <NexusOrb 
        href="/test" 
        label="Test Label" 
        icon={<Star />} 
        className="custom-class"
      />
    );
    
    const orb = screen.getByText('Test Label').closest('div');
    expect(orb).toHaveClass('custom-class');
  });
});