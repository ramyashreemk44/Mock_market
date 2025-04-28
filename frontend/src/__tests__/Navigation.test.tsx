import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';

describe('Navigation Component', () => {
test('renders navigation links', () => {
  render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Trading')).toBeInTheDocument();
  expect(screen.getByText('Portfolio')).toBeInTheDocument();
  expect(screen.getByText('Watchlist')).toBeInTheDocument();
});
test('contains correct links with correct routes', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Checking if the links have the correct href attributes
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Trading').closest('a')).toHaveAttribute('href', '/trading');
    expect(screen.getByText('Portfolio').closest('a')).toHaveAttribute('href', '/portfolio');
    expect(screen.getByText('Watchlist').closest('a')).toHaveAttribute('href', '/watchlist');
  });
});
