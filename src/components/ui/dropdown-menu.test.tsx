import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('renders DropdownMenu components correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuItem>
            Item
            <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
          <DropdownMenuRadioItem checked>Radio Item</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Check that the components render without errors
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('⌘I')).toBeInTheDocument();
    expect(screen.getByText('Checkbox Item')).toBeInTheDocument();
    expect(screen.getByText('Radio Item')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger className="custom-trigger">Open</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('Open')).toHaveClass('custom-trigger');
    expect(screen.getByText('Item')).toHaveClass('custom-item');
  });
});