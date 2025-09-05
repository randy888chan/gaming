/**
 * Test for Card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';

describe('Card', () => {
  it('should render without crashing', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Card>Default Card</Card>);
    const card = screen.getByText('Default Card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border-transparent');
  });

  it('should render with outline variant', () => {
    render(<Card variant="outline">Outline Card</Card>);
    const card = screen.getByText('Outline Card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border-border');
  });

  it('should render CardHeader component', () => {
    render(
      <Card>
        <CardHeader>Header Content</CardHeader>
      </Card>
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    const header = screen.getByText('Header Content');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('p-6');
  });

  it('should render CardTitle component', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    const title = screen.getByText('Card Title');
    expect(title).toHaveClass('font-semibold');
    expect(title.tagName).toBe('H3');
  });

  it('should render CardDescription component', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    const description = screen.getByText('Card Description');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should render CardContent component', () => {
    render(
      <Card>
        <CardContent>Card Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    const content = screen.getByText('Card Content');
    expect(content).toHaveClass('p-6');
  });

  it('should render CardFooter component', () => {
    render(
      <Card>
        <CardFooter>Footer Content</CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
    const footer = screen.getByText('Footer Content');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('p-6');
  });

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Full Card Title</CardTitle>
          <CardDescription>Full Card Description</CardDescription>
        </CardHeader>
        <CardContent>Full Card Content</CardContent>
        <CardFooter>Full Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Full Card Title')).toBeInTheDocument();
    expect(screen.getByText('Full Card Description')).toBeInTheDocument();
    expect(screen.getByText('Full Card Content')).toBeInTheDocument();
    expect(screen.getByText('Full Card Footer')).toBeInTheDocument();
  });
});