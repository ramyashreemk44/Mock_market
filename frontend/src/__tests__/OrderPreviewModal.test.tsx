import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderPreviewModal from '../components/OrderPreviewModal';

describe('OrderPreviewModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    type: 'BUY' as 'BUY' | 'SELL',  // explicitly define the type as 'BUY'
    symbol: 'AAPL',
    shares: 100,
    price: 150,
    total: 15000,
    isLoading: false,
  };

  test('renders the modal when isOpen is true', () => {
    render(<OrderPreviewModal {...defaultProps} />);
    expect(screen.getByText('Confirm Order')).toBeInTheDocument();
    expect(screen.getByText('Order Type')).toBeInTheDocument();
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Shares')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Price per Share')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
  });

  test('does not render the modal when isOpen is false', () => {
    render(<OrderPreviewModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Confirm Order')).not.toBeInTheDocument();
  });


  test('calls onConfirm when the confirm button is clicked', async () => {
    render(<OrderPreviewModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/confirm buy/i));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('renders processing text on confirm button when isLoading is true', () => {
    render(<OrderPreviewModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  test('renders "Cancel" button with proper style', () => {
    render(<OrderPreviewModal {...defaultProps} />);
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveClass('text-gray-700');
    expect(cancelButton).not.toBeDisabled();
  });

  test('renders "Confirm BUY" button with proper style for buy type', () => {
    render(<OrderPreviewModal {...defaultProps} />);
    const confirmButton = screen.getByText(/confirm buy/i);
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveClass('bg-green-600');
    expect(confirmButton).not.toBeDisabled();
  });

  test('renders "Confirm SELL" button with proper style for sell type', () => {
    render(<OrderPreviewModal {...defaultProps} type="SELL" />);
    const confirmButton = screen.getByText(/confirm sell/i);
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  test('displays the correct order type color', () => {
    render(<OrderPreviewModal {...defaultProps} />);
    expect(screen.getByText('BUY')).toHaveClass('text-green-600');

    render(<OrderPreviewModal {...defaultProps} type="SELL" />);
    expect(screen.getByText('SELL')).toHaveClass('text-red-600');
  });

  test('renders correct formatted currency values', () => {
    render(<OrderPreviewModal {...defaultProps} />);
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
  });
});
