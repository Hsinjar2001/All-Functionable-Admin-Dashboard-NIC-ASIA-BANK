// src/pages/Loans/Loans.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loans.css';

export default function Loans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📋 Loans page mounted');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="loans-container">
      <div className="loans-header">
        <h1>Loan Management</h1>
        <p>View and manage all loans</p>
      </div>

      <div className="loans-content">
        <div className="placeholder">
          <h2>🏗️ Under Construction</h2>
          <p>Loan management features coming soon!</p>
          <button onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}