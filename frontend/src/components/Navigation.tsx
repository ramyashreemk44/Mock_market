// src/components/Navigation.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/trading">Trading</Link>
      <Link to="/portfolio">Portfolio</Link>
      <Link to="/watchlist">Watchlist</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navigation;