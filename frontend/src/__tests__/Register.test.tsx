import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { fetchApi } from '../utils/api';

// Mock fetchApi
jest.mock('../utils/api', () => ({
  fetchApi: jest.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test case
  });

  test('renders the Register form correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    // Use getByRole('input') to select password fields
    expect(screen.getAllByRole('textbox')).toHaveLength(2); // For password and confirm password inputs
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});