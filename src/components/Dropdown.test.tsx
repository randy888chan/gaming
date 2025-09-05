import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  it('renders dropdown with children when visible', () => {
    render(
      <Dropdown visible={true}>
        <div>Dropdown Item 1</div>
        <div>Dropdown Item 2</div>
      </Dropdown>
    );
    
    expect(screen.getByText('Dropdown Item 1')).toBeInTheDocument();
    expect(screen.getByText('Dropdown Item 2')).toBeInTheDocument();
  });

  it('applies correct classes when visible', () => {
    render(
      <Dropdown visible={true}>
        <div>Dropdown Item</div>
      </Dropdown>
    );
    
    const dropdown = screen.getByText('Dropdown Item').closest('div');
    expect(dropdown).toHaveClass('opacity-100');
    expect(dropdown).not.toHaveClass('opacity-0', 'invisible');
  });

  it('applies correct classes when not visible', () => {
    render(
      <Dropdown visible={false}>
        <div>Dropdown Item</div>
      </Dropdown>
    );
    
    const dropdown = screen.getByText('Dropdown Item').closest('div');
    expect(dropdown).toHaveClass('opacity-0', 'invisible');
  });

  it('renders with bottom anchor by default', () => {
    render(
      <Dropdown visible={true}>
        <div>Dropdown Item</div>
      </Dropdown>
    );
    
    const dropdown = screen.getByText('Dropdown Item').closest('div');
    expect(dropdown).toHaveClass('mb-2');
  });

  it('renders with top anchor when specified', () => {
    render(
      <Dropdown visible={true} anchor="top">
        <div>Dropdown Item</div>
      </Dropdown>
    );
    
    const dropdown = screen.getByText('Dropdown Item').closest('div');
    expect(dropdown).toHaveClass('mt-2');
  });
});