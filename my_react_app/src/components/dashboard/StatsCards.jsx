import React from 'react';
import './StatsCards.css';

const statsData = [
  { id: 1, title: 'Users', value: 1500 },
  { id: 2, title: 'Orders', value: 320 },
  { id: 3, title: 'Revenue', value: '$12,400' },
  { id: 4, title: 'Feedbacks', value: 85 },
];

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