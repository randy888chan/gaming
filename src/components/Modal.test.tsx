import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';

describe('Modal', () => {
  it('should render without crashing when open', () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when disableBackdropClose is true and backdrop is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal open={true} onClose={mockOnClose} disableBackdropClose={true}>
        <div>Modal Content</div>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});