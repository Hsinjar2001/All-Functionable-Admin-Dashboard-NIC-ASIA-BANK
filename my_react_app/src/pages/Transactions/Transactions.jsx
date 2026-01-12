import React, { useState } from 'react';
import './transactions.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    type: 'Deposit',
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateTransactionId = () => {
    if (transactions.length === 0) {
      return 'TXN001';
    }
    const lastTransaction = transactions[transactions.length - 1];
    const lastNumber = parseInt(lastTransaction.transactionId.replace('TXN', ''));
    return `TXN${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const handleAddTransaction = () => {
    setFormData({
      type: 'Deposit',
      fromAccount: '',
      toAccount: '',
      amount: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTransaction = {
      id: transactions.length + 1,
      transactionId: generateTransactionId(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: formData.type,
      fromAccount: formData.type === 'Deposit' ? '-' : formData.fromAccount,
      toAccount: formData.type === 'Withdrawal' ? '-' : formData.toAccount,
      amount: parseFloat(formData.amount),
      status: 'Success',
      description: formData.description
    };
    
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.toAccount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || txn.type === filterType;
    const matchesStatus = filterStatus === 'All' || txn.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const successCount = transactions.filter(txn => txn.status === 'Success').length;
  const pendingCount = transactions.filter(txn => txn.status === 'Pending').length;
  const failedCount = transactions.filter(txn => txn.status === 'Failed').length;

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p>View and manage all bank transactions</p>
        </div>
        <button className="btn-primary" onClick={handleAddTransaction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="transactions-stats">
        <div className="stat-box">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Successful</div>
            <div className="stat-value">{successCount}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Amount</div>
            <div className="stat-value">{formatCurrency(totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by transaction ID or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
          <option value="Transfer">Transfer</option>
        </select>
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn.id}>
                <td><strong>{txn.transactionId}</strong></td>
                <td>
                  <div className="datetime">
                    <div>{new Date(txn.date).toLocaleDateString()}</div>
                    <div className="time">{txn.time}</div>
                  </div>
                </td>
                <td>
                  <span className={`type-badge ${txn.type.toLowerCase()}`}>
                    {txn.type}
                  </span>
                </td>
                <td>{txn.fromAccount}</td>
                <td>{txn.toAccount}</td>
                <td className="amount">{formatCurrency(txn.amount)}</td>
                <td>
                  <span className={`status-badge ${txn.status.toLowerCase()}`}>
                    {txn.status}
                  </span>
                </td>
                <td className="description">{txn.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Transaction</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Transaction Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              {formData.type !== 'Deposit' && (
                <div className="form-group">
                  <label>From Account *</label>
                  <input
                    type="text"
                    name="fromAccount"
                    value={formData.fromAccount}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter account number (e.g., ACC-1001)"
                  />
                </div>
              )}

              {formData.type !== 'Withdrawal' && (
                <div className="form-group">
                  <label>To Account *</label>
                  <input
                    type="text"
                    name="toAccount"
                    value={formData.toAccount}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter account number (e.g., ACC-1002)"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter transaction description..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Process Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}