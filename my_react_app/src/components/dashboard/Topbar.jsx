import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <h1>Dashboard</h1>
      <nav>
        {/* Add navigation items or user profile here */}
        <a href="/">Home</a>
        <a href="/profile">Profile</a>
      </nav>
    </header>
  );
};

export default Topbar;