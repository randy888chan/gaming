/**
 * Test for Dialog component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

describe('Dialog', () => {
  it('should render without crashing', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should render dialog content when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <div data-testid="dialog-content">Dialog Content</div>
        </DialogContent>
      </Dialog>
    );
    
    const trigger = screen.getByText('Open Dialog');
    fireEvent.click(trigger);
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
  });

  it('should render DialogTitle component', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    
    const title = screen.getByText('Custom Title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
    expect(title.tagName).toBe('H2'); // Radix UI Dialog.Title renders as h2 by default
  });

  it('should render DialogDescription component', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>Custom Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    
    const description = screen.getByText('Custom Description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should render DialogHeader component', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Header Test</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    
    const header = screen.getByTestId('dialog-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
  });

  it('should render DialogFooter component', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogFooter data-testid="dialog-footer">
            <button>Footer Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    
    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('flex-col-reverse');
  });
});