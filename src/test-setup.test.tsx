import React from 'react';
import { render, screen } from '@testing-library/react';

// A simple test component
const TestComponent = () => <div>Hello World</div>;

describe('Test Setup', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});