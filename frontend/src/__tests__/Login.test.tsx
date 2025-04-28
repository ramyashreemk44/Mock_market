import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../pages/Login';  // Adjust the path as necessary
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock the return value of useAuth to return the necessary values
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token', user: { email: 'test@example.com' } }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the login form', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

  });

  test('shows error when email is not provided', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test('shows error when password is not provided', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

//   test('calls login and redirects on successful login', async () => {
//     render(
//       <Router>
//         <Login />
//       </Router>
//     );

//     fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
//     fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
//     fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

//     await waitFor(() => {
//       expect(mockLogin).toHaveBeenCalledWith('fake-token', { email: 'test@example.com' });
//       expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
//     });
 // });

  test('displays a general error if login fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid email or password' }),
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );
  
    // Simulate user input
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
  
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));
  
    // Wait for the button to be disabled and show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /loading.../i })).toBeDisabled();
    });
  });
});
