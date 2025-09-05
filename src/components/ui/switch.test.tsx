/**
 * Test for Switch component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Switch } from './switch';

describe('Switch', () => {
  it('should render without crashing', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should render with correct default classes', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveClass('inline-flex');
    expect(switchElement).toHaveClass('h-5');
    expect(switchElement).toHaveClass('w-9');
    expect(switchElement).toHaveClass('rounded-full');
  });

  it('should handle checked state', () => {
    render(<Switch checked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should handle unchecked state', () => {
    render(<Switch checked={false} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should handle onChange events', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should handle disabled state', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed');
    expect(switchElement).toHaveClass('disabled:opacity-50');
  });

  it('should handle custom className', () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInTheDocument();
  });

  it('should toggle state when clicked', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    
    // Initially unchecked
    expect(switchElement).not.toBeChecked();
    
    // Click to check
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
    
    // Click again to uncheck
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});