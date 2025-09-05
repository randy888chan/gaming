import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from './theme-toggle';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: jest.fn() })
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sun: () => <div data-testid="sun-icon" />,
  Moon: () => <div data-testid="moon-icon" />
}));

// Mock dropdown menu components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  )
}));

// Mock button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="theme-button" {...props}>
      {children}
    </button>
  )
}));

describe('ThemeToggle', () => {
  it('renders theme toggle button with icons', () => {
    render(<ThemeToggle />);
    
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('renders dropdown menu with theme options', () => {
    render(<ThemeToggle />);
    
    // Check that dropdown components are rendered
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    
    // Click the trigger to open the dropdown
    fireEvent.click(screen.getByTestId('theme-button'));
    
    // Check that dropdown content and items are rendered
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme with correct values when menu items are clicked', () => {
    const mockSetTheme = jest.fn();
    jest.mock('next-themes', () => ({
      useTheme: () => ({ setTheme: mockSetTheme })
    }));
    
    render(<ThemeToggle />);
    
    // Click the trigger to open the dropdown
    fireEvent.click(screen.getByTestId('theme-button'));
    
    // Click each menu item and verify setTheme is called with correct values
    fireEvent.click(screen.getByText('Light'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    
    fireEvent.click(screen.getByText('Dark'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    
    fireEvent.click(screen.getByText('System'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});