import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InsightShard } from './insight-shard';
import { Star } from 'lucide-react';

describe('InsightShard', () => {
  it('renders with title and value', () => {
    render(<InsightShard title="Test Title" value="Test Value" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(<InsightShard title="Test Title" value="Test Value" icon={<Star />} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    // Check that the icon is rendered (Lucide icons render as SVG)
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(<InsightShard title="Test Title" value="Test Value" className="custom-class" />);
    
    const insightShard = screen.getByText('Test Title').closest('div');
    expect(insightShard).toHaveClass('custom-class');
  });

  it('renders numeric values correctly', () => {
    render(<InsightShard title="Numeric Title" value={42} />);
    
    expect(screen.getByText('Numeric Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});