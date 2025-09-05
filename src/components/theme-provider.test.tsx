import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from './theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  )
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <div>Test Child</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('defaultTheme', 'dark');
    expect(themeProvider).toHaveAttribute('enableSystem', 'false');
  });
});