import React, { useState } from 'react';
import './reports.css';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-12-31'
  });

  // Mock data for reports
  const reportData = {
    overview: {
      totalAccounts: 1250,
      activeAccounts: 1180,
      totalDeposits: 15678900,
      totalWithdrawals: 8456200,
      totalLoans: 2340000,
      activeLoans: 89,
      totalTransactions: 5420,
      successfulTransactions: 5280
    },
    monthlyData: [
      { month: 'Jan', deposits: 1200000, withdrawals: 650000, loans: 180000 },
      { month: 'Feb', deposits: 1350000, withdrawals: 720000, loans: 220000 },
      { month: 'Mar', deposits: 1450000, withdrawals: 780000, loans: 195000 },
      { month: 'Apr', deposits: 1280000, withdrawals: 690000, loans: 240000 },
      { month: 'May', deposits: 1520000, withdrawals: 810000, loans: 210000 },
      { month: 'Jun', deposits: 1680000, withdrawals: 880000, loans: 265000 },
      { month: 'Jul', deposits: 1580000, withdrawals: 840000, loans: 230000 },
      { month: 'Aug', deposits: 1720000, withdrawals: 920000, loans: 280000 },
      { month: 'Sep', deposits: 1650000, withdrawals: 890000, loans: 245000 },
      { month: 'Oct', deposits: 1820000, withdrawals: 960000, loans: 290000 },
      { month: 'Nov', deposits: 1750000, withdrawals: 930000, loans: 255000 },
      { month: 'Dec', deposits: 1900000, withdrawals: 1000000, loans: 310000 }
    ],
    accountTypes: [
      { type: 'Savings', count: 650, percentage: 52, amount: 8500000 },
      { type: 'Current', count: 420, percentage: 34, amount: 5200000 },
      { type: 'Fixed Deposit', count: 180, percentage: 14, amount: 1978900 }
    ],
    loanTypes: [
      { type: 'Personal Loan', count: 35, amount: 850000 },
      { type: 'Home Loan', count: 28, amount: 1200000 },
      { type: 'Car Loan', count: 15, amount: 180000 },
      { type: 'Business Loan', count: 8, amount: 95000 },
      { type: 'Education Loan', count: 3, amount: 15000 }
    ],
    topTransactions: [
      { date: '2024-12-30', type: 'Transfer', amount: 50000, account: 'ACC-1089' },
      { date: '2024-12-29', type: 'Deposit', amount: 45000, account: 'ACC-1120' },
      { date: '2024-12-28', type: 'Withdrawal', amount: 35000, account: 'ACC-1045' },
      { date: '2024-12-27', type: 'Transfer', amount: 32000, account: 'ACC-1156' },
      { date: '2024-12-26', type: 'Deposit', amount: 28000, account: 'ACC-1001' }
    ]
  };


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

  const handleExport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...\nThis is a demo. In production, this would download the file.`);
  };

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(item => item[key]));
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Financial Reports</h1>
          <p>View detailed analytics and generate reports</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => handleExport('pdf')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
          <button className="btn-export" onClick={() => handleExport('excel')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="date-inputs">
          <div className="date-group">
            <label>From:</label>
            <input 
              type="date" 
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            />
          </div>
          <div className="date-group">
            <label>To:</label>
            <input 
              type="date" 
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            />
          </div>
          <button className="btn-apply">Apply Filter</button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button 
          className={selectedReport === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setSelectedReport('overview')}
        >
          Overview
        </button>
        <button 
          className={selectedReport === 'accounts' ? 'tab active' : 'tab'}
          onClick={() => setSelectedReport('accounts')}
        >
          Accounts
        </button>
        <button 
          className={selectedReport === 'transactions' ? 'tab active' : 'tab'}
          onClick={() => setSelectedReport('transactions')}
        >
          Transactions
        </button>
        <button 
          className={selectedReport === 'loans' ? 'tab active' : 'tab'}
          onClick={() => setSelectedReport('loans')}
        >
          Loans
        </button>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="report-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card blue">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="metric-info">
                <div className="metric-label">Total Accounts</div>
                <div className="metric-value">{reportData.overview.totalAccounts}</div>
                <div className="metric-subtitle">{reportData.overview.activeAccounts} Active</div>
              </div>
            </div>

            <div className="metric-card green">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="metric-info">
                <div className="metric-label">Total Deposits</div>
                <div className="metric-value">{formatCurrency(reportData.overview.totalDeposits)}</div>
                <div className="metric-subtitle positive">↑ 12.5% from last period</div>
              </div>
            </div>

            <div className="metric-card orange">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="metric-info">
                <div className="metric-label">Total Transactions</div>
                <div className="metric-value">{reportData.overview.totalTransactions}</div>
                <div className="metric-subtitle">{reportData.overview.successfulTransactions} Successful</div>
              </div>
            </div>

            <div className="metric-card purple">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="metric-info">
                <div className="metric-label">Active Loans</div>
                <div className="metric-value">{reportData.overview.activeLoans}</div>
                <div className="metric-subtitle">{formatCurrency(reportData.overview.totalLoans)}</div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="chart-section">
            <h3>Monthly Financial Trend</h3>
            <div className="bar-chart">
              {reportData.monthlyData.map((data, index) => {
                const maxDeposit = getMaxValue(reportData.monthlyData, 'deposits');
                const depositHeight = (data.deposits / maxDeposit) * 100;
                const withdrawalHeight = (data.withdrawals / maxDeposit) * 100;
                const loanHeight = (data.loans / maxDeposit) * 100;
                
                return (
                  <div key={index} className="bar-group">
                    <div className="bars">
                      <div 
                        className="bar deposit" 
                        style={{height: `${depositHeight}%`}}
                        title={`Deposits: ${formatCurrency(data.deposits)}`}
                      />
                      <div 
                        className="bar withdrawal" 
                        style={{height: `${withdrawalHeight}%`}}
                        title={`Withdrawals: ${formatCurrency(data.withdrawals)}`}
                      />
                      <div 
                        className="bar loan" 
                        style={{height: `${loanHeight}%`}}
                        title={`Loans: ${formatCurrency(data.loans)}`}
                      />
                    </div>
                    <div className="bar-label">{data.month}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color deposit"></span>
                <span>Deposits</span>
              </div>
              <div className="legend-item">
                <span className="legend-color withdrawal"></span>
                <span>Withdrawals</span>
              </div>
              <div className="legend-item">
                <span className="legend-color loan"></span>
                <span>Loans</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Report */}
      {selectedReport === 'accounts' && (
        <div className="report-content">
          <div className="section-header">
            <h3>Account Distribution</h3>
          </div>
          <div className="account-types-grid">
            {reportData.accountTypes.map((account, index) => (
              <div key={index} className="account-type-card">
                <div className="account-type-header">
                  <h4>{account.type}</h4>
                  <span className="account-count">{account.count} accounts</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${account.percentage}%`}}
                  />
                </div>
                <div className="account-stats">
                  <div className="stat">
                    <span className="stat-label">Percentage</span>
                    <span className="stat-value">{account.percentage}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Amount</span>
                    <span className="stat-value">{formatCurrency(account.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Report */}
      {selectedReport === 'transactions' && (
        <div className="report-content">
          <div className="section-header">
            <h3>Top Transactions</h3>
          </div>
          <div className="transactions-list">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topTransactions.map((txn, index) => (
                  <tr key={index}>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`type-badge ${txn.type.toLowerCase()}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td>{txn.account}</td>
                    <td className="amount">{formatCurrency(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans Report */}
      {selectedReport === 'loans' && (
        <div className="report-content">
          <div className="section-header">
            <h3>Loan Distribution by Type</h3>
          </div>
          <div className="loans-grid">
            {reportData.loanTypes.map((loan, index) => (
              <div key={index} className="loan-card">
                <div className="loan-type">{loan.type}</div>
                <div className="loan-count">{loan.count} Loans</div>
                <div className="loan-amount">{formatCurrency(loan.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}