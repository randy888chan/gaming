import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PolymarketPage from './polymarket';

// Mock next-seo
jest.mock('next-seo', () => ({
  NextSeo: () => <div data-testid="next-seo" />
}));

// Mock MarketList component
jest.mock('@/components/polymarket/MarketList', () => {
  return function MockMarketList() {
    return <div data-testid="market-list">Market List</div>;
  };
});

describe('PolymarketPage', () => {
  it('renders page title', () => {
    render(<PolymarketPage />);
    
    expect(screen.getByText('Prediction Markets')).toBeInTheDocument();
  });

  it('renders NextSeo component with correct props', () => {
    render(<PolymarketPage />);
    
    expect(screen.getByTestId('next-seo')).toBeInTheDocument();
  });

  it('renders MarketList component', () => {
    render(<PolymarketPage />);
    
    expect(screen.getByTestId('market-list')).toBeInTheDocument();
  });

  it('renders in a container with correct classes', () => {
    render(<PolymarketPage />);
    
    const container = screen.getByText('Prediction Markets').closest('div');
    expect(container).toHaveClass('container', 'mx-auto', 'py-8');
  });
});