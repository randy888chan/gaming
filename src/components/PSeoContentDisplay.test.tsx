/**
 * Test for PSeoContentDisplay component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the fetch API
global.fetch = jest.fn();

describe('PSeoContentDisplay', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', async () => {
    // Mock fetch to simulate loading
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    const { default: PSeoContentDisplay } = await import('./PSeoContentDisplay');
    render(<PSeoContentDisplay />);
    
    expect(screen.getByText('Loading pSEO content...')).toBeInTheDocument();
  });

  it('should render content when data is fetched successfully', async () => {
    // Mock successful fetch response
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      keywords: ['keyword1', 'keyword2'],
      content: 'Test Content'
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    const { default: PSeoContentDisplay } = await import('./PSeoContentDisplay');
    render(<PSeoContentDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('keyword1')).toBeInTheDocument();
      expect(screen.getByText('keyword2')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('should render error message when fetch fails', async () => {
    // Mock failed fetch response
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { default: PSeoContentDisplay } = await import('./PSeoContentDisplay');
    render(<PSeoContentDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should render no content message when data is null', async () => {
    // Mock successful fetch response with no data
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    });
    
    const { default: PSeoContentDisplay } = await import('./PSeoContentDisplay');
    render(<PSeoContentDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('No pSEO content available.')).toBeInTheDocument();
    });
  });
});