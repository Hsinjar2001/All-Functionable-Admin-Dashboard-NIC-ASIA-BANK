import React from 'react';
import './dashboard.css';

export default function Dashboard() {
  // Mock data - replace with real API data later
  const stats = {
    totalAccounts: 1250,
    totalBalance: 45678900,
    todayTransactions: 342,
    activeLoans: 89,
    newCustomers: 23,
    pendingApprovals: 12
  };

  const recentTransactions = [
    { id: 'TXN001', account: 'ACC-1001', type: 'Deposit', amount: 5000, status: 'Success', time: '10:30 AM' },
    { id: 'TXN002', account: 'ACC-1045', type: 'Withdrawal', amount: 2000, status: 'Success', time: '10:15 AM' },
    { id: 'TXN003', account: 'ACC-1089', type: 'Transfer', amount: 15000, status: 'Pending', time: '09:45 AM' },
    { id: 'TXN004', account: 'ACC-1120', type: 'Deposit', amount: 8000, status: 'Success', time: '09:30 AM' },
    { id: 'TXN005', account: 'ACC-1156', type: 'Transfer', amount: 3500, status: 'Failed', time: '09:00 AM' },
  ];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div className="dashboard-date">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Accounts</h3>
            <p className="stat-number">{stats.totalAccounts.toLocaleString()}</p>
            <span className="stat-change positive">+{stats.newCustomers} this month</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <p className="stat-number">{formatCurrency(stats.totalBalance)}</p>
            <span className="stat-change positive">+12.5% from last month</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Today's Transactions</h3>
            <p className="stat-number">{stats.todayTransactions}</p>
            <span className="stat-change positive">+8.2% from yesterday</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Active Loans</h3>
            <p className="stat-number">{stats.activeLoans}</p>
            <span className="stat-change negative">{stats.pendingApprovals} pending approval</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button className="btn-view-all">View All</button>
        </div>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td><strong>{txn.id}</strong></td>
                  <td>{txn.account}</td>
                  <td>
                    <span className={`type-badge RS {txn.type.toLowerCase()}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="amount">{formatCurrency(txn.amount)}</td>
                  <td>
                    <span className={`status-badge {txn.status.toLowerCase()}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="time">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>New Account</span>
          </button>
          <button className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>New Transaction</span>
          </button>
          <button className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Generate Report</span>
          </button>
          <button className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>View Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
}