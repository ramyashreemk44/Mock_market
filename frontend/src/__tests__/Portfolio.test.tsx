import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/Portfolio';
import { BrowserRouter } from 'react-router-dom';

// Mock the fetchApi function to return a mock response
jest.mock('../utils/api', () => ({
  fetchApi: jest.fn(() => Promise.resolve({
    data: {
      overview: {
        totalValue: 1000,
        marketValue: 800,
        cashBalance: 200,
        unrealizedGain: 50,
        unrealizedGainPercent: 5,
        dayChange: 10,
        dayChangePercent: 1
      },
      positions: [],
      lastUpdated: '2024-12-12T12:00:00Z'
    }
  }))
}));


jest.mock('../utils/api', () => ({
    fetchApi: jest.fn(() => Promise.reject(new Error('Failed to fetch portfolio data')))
  }));
  
  jest.mock('../utils/api', () => ({
    fetchApi: jest.fn(() => Promise.resolve({
      data: {
        overview: {
          totalValue: 1000,
          marketValue: 800,
          cashBalance: 200,
          unrealizedGain: 50,
          unrealizedGainPercent: 5,
          dayChange: 10,
          dayChangePercent: 1
        },
        positions: [],
        lastUpdated: '2024-12-12T12:00:00Z'
      }
    }))
  }));
  
  describe('Portfolio Component', () => {
    test('renders portfolio overview data correctly', async () => {
        render(
          <BrowserRouter>
            <Portfolio />
          </BrowserRouter>
        );
      
        expect(await screen.findByText('$1,000')).toBeInTheDocument(); // Total Value
        expect(screen.getByText('$800')).toBeInTheDocument(); // Market Value
        expect(screen.getByText('$200')).toBeInTheDocument(); // Cash Balance
        expect(await screen.findByText(/10/)).toBeInTheDocument(); // Day's Change (using regex for flexibility)
      });
      
  });
  jest.mock('../utils/api', () => ({
    fetchApi: jest.fn(() => Promise.resolve({
      data: {
        overview: {
          totalValue: 1000,
          marketValue: 800,
          cashBalance: 200,
          unrealizedGain: 50,
          unrealizedGainPercent: 5,
          dayChange: 10,
          dayChangePercent: 1
        },
        positions: [],
        lastUpdated: '2024-12-12T12:00:00Z'
      }
    }))
  }));
  
  describe('Portfolio Component', () => {
    test('renders message when no holdings are available', async () => {
      render(
        <BrowserRouter>
          <Portfolio />
        </BrowserRouter>
      );
  
      expect(await screen.findByText("You don't have any holdings yet. Start trading to build your portfolio!")).toBeInTheDocument();
    });
  });
  jest.mock('../utils/api', () => ({
    fetchApi: jest.fn(() => Promise.resolve({
      data: {
        overview: {
          totalValue: 1000,
          marketValue: 800,
          cashBalance: 200,
          unrealizedGain: 50,
          unrealizedGainPercent: 5,
          dayChange: 10,
          dayChangePercent: 1
        },
        positions: [],
        lastUpdated: '2024-12-12T12:00:00Z'
      }
    }))
  }));

        