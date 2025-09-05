import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select';

describe('Select', () => {
  it('renders Select components correctly', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // Check that the components render without errors
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectItem value="option1" className="custom-item">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select an option')).toHaveClass('custom-trigger');
  });
});