/**
 * Test for Footer component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';

// Mock constants
jest.mock('../../constants', () => ({
  FOOTER_LINKS: [
    { title: 'Link 1', href: 'https://example.com/1' },
    { title: 'Link 2', href: 'https://example.com/2' },
  ],
  FOOTER_TWITTER_LINK: {
    title: 'Twitter',
    href: 'https://twitter.com/example',
  },
}));

describe('Footer', () => {
  it('should render without crashing', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render the logo', () => {
    render(<Footer />);
    const logo = screen.getByAltText('Gamba Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('should render footer links', () => {
    render(<Footer />);
    expect(screen.getByText('Link 1')).toBeInTheDocument();
    expect(screen.getByText('Link 2')).toBeInTheDocument();
    
    const link1 = screen.getByText('Link 1').closest('a');
    const link2 = screen.getByText('Link 2').closest('a');
    
    expect(link1).toHaveAttribute('href', 'https://example.com/1');
    expect(link2).toHaveAttribute('href', 'https://example.com/2');
  });

  it('should render Twitter link', () => {
    render(<Footer />);
    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/example');
  });

  it('should have correct CSS classes', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-background');
    expect(footer).toHaveClass('border');
    expect(footer).toHaveClass('rounded-t-2xl');
  });
});