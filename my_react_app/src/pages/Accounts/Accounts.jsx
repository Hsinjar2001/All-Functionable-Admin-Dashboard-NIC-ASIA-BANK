import React, { useState } from 'react';
import './accounts';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [formData, setFormData] = useState({
    customerName: '',
    accountType: 'Savings',
    balance: '',
    status: 'Active',
    branch: 'Main Branch'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateAccountNumber = () => {
    return `ACC-${String(1001).padStart(4, '0')}`;
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setFormData({
      customerName: '',
      accountType: 'Savings',
      balance: '',
      status: 'Active',
      branch: 'Main Branch'
    });
    setShowModal(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      customerName: account.customerName,
      accountType: account.accountType,
      balance: account.balance,
      status: account.status,
      branch: account.branch
    });
    setShowModal(true);
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAccount) {
      setAccounts(accounts.map(acc => 
        acc.id === editingAccount.id 
          ? { ...acc, ...formData, balance: parseFloat(formData.balance) }
          : acc
      ));
    } else {
      const newAccount = {
        id: accounts.length + 1,
        accountNumber: generateAccountNumber(),
        ...formData,
        balance: parseFloat(formData.balance),
        openDate: new Date().toISOString().split('T')[0]
      };
      setAccounts([...accounts, newAccount]);
    }
    
    setShowModal(false);
    setFormData({
      customerName: '',
      accountType: 'Savings',
      balance: '',
      status: 'Active',
      branch: 'Main Branch'
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || account.accountType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <div>
          <h1>Accounts Management</h1>
          <p>Manage all customer bank accounts</p>
        </div>
        <button className="btn-primary" onClick={handleAddAccount}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Account
        </button>
      </div>

      <div className="accounts-stats">
        <div className="stat-box">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{accounts.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Active</div>
          <div className="stat-value">{accounts.filter(a => a?.status === 'Active').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Frozen</div>
          <div className="stat-value">{accounts.filter(a => a?.status === 'Frozen').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">
            {formatCurrency(accounts.reduce((sum, acc) => sum + (acc?.balance || 0), 0))}
          </div>
        </div>
      </div>

      <div className="accounts-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or account number..."
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
          <option value="Savings">Savings</option>
          <option value="Current">Current</option>
          <option value="Fixed Deposit">Fixed Deposit</option>
        </select>
      </div>

      <div className="accounts-table">
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Customer Name</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Open Date</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td><strong>{account.accountNumber}</strong></td>
                <td>{account.customerName}</td>
                <td>
                  <span className={`type-badge ${account.accountType.toLowerCase().replace(' ', '-')}`}>
                    {account.accountType}
                  </span>
                </td>
                <td className="balance">{formatCurrency(account.balance)}</td>
                <td>
                  <span className={`status-badge ${account.status.toLowerCase()}`}>
                    {account.status}
                  </span>
                </td>
                <td>{new Date(account.openDate).toLocaleDateString()}</td>
                <td>{account.branch}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEditAccount(account)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteAccount(account.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'Add New Account'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Type *</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Balance *</label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Branch *</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Main Branch">Main Branch</option>
                    <option value="Downtown">Downtown</option>
                    <option value="Westside">Westside</option>
                    <option value="Eastside">Eastside</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}