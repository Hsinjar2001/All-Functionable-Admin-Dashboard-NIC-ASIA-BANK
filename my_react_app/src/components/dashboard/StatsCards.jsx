import React from 'react';
import './StatsCards.css';

const statsData = [];

const StatsCards = () => {
  return (
    <div className="stats-cards">
      {statsData.map(({ id, title, value }) => (
        <div key={id} className="stats-card">
          <h3>{title}</h3>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;