import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimeDiff } from './TimeDiff';

describe('TimeDiff', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });

  it('should display "Just now" for recent times', () => {
    const recentTime = Date.now() - 30 * 1000; // 30 seconds ago
    
    render(<TimeDiff time={recentTime} />);
    
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should display minutes for times within an hour', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    
    render(<TimeDiff time={fiveMinutesAgo} />);
    
    expect(screen.getByText('5m ago')).toBeInTheDocument();
  });

  it('should display hours for times longer than an hour', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
    
    render(<TimeDiff time={twoHoursAgo} />);
    
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('should use custom suffix', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    
    render(<TimeDiff time={fiveMinutesAgo} suffix="before" />);
    
    expect(screen.getByText('5m before')).toBeInTheDocument();
  });
});