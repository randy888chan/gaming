/**
 * Test for Icon component
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Since Icon is an object with multiple components, we'll test each one
describe('Icon', () => {
  it('should render Close icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Close />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Jackpot icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Jackpot />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Fairness icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Fairness />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Refresh icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Refresh />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Info icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Info />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render ExternalLink icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.ExternalLink />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render ArrowRight icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.ArrowRight />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render ArrowLeft icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.ArrowLeft />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Shuffle icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Shuffle />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Close2 icon without crashing', async () => {
    const { Icon } = await import('./Icon');
    const { container } = render(<Icon.Close2 />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});