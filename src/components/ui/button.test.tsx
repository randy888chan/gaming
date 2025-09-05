/**
 * Test for Button component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './button';

describe('Button', () => {
  it('should render without crashing', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with default variant and size', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByText('Default Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  it('should render with destructive variant', () => {
    render(<Button variant="destructive">Destructive Button</Button>);
    const button = screen.getByText('Destructive Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-destructive');
  });

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText('Outline Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-secondary');
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByText('Ghost Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('should render with link variant', () => {
    render(<Button variant="link">Link Button</Button>);
    const button = screen.getByText('Link Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-primary');
    // Check for hover:underline instead of underline
    expect(button).toHaveClass('hover:underline');
  });

  it('should render with small size', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('text-xs');
  });

  it('should render with large size', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByText('Large Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10');
  });

  it('should render with icon size', () => {
    render(<Button size="icon">Icon Button</Button>);
    const button = screen.getByText('Icon Button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('w-9');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should render as a child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#">Link Button</a>
      </Button>
    );
    const link = screen.getByText('Link Button');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('bg-primary');
  });
});