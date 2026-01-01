import React, { useState } from 'react';
import './loans.css';

export default function Loans() {
  const [loans, setLoans] = useState([
    {
      id: 1,
      loanId: 'LOAN-001',
      customerName: 'John Smith',
      accountNumber: 'ACC-1001',
      loanType: 'Personal Loan',
      amount: 50000,
      interestRate: 8.5,
      tenure: 36,
      monthlyEMI: 1575,
      status: 'Approved',
      applicationDate: '2024-11-15',
      approvalDate: '2024-11-20'
    },
    {
      id: 2,
      loanId: 'LOAN-002',
      customerName: 'Sarah Johnson',
      accountNumber: 'ACC-1002',
      loanType: 'Home Loan',
      amount: 250000,
      interestRate: 7.5,
      tenure: 240,
      monthlyEMI: 1946,
      status: 'Active',
      applicationDate: '2024-10-10',
      approvalDate: '2024-10-25'
    },
    {
      id: 3,
      loanId: 'LOAN-003',
      customerName: 'Michael Brown',
      accountNumber: 'ACC-1003',
      loanType: 'Car Loan',
      amount: 30000,
      interestRate: 9.0,
      tenure: 60,
      monthlyEMI: 622,
      status: 'Pending',
      applicationDate: '2024-12-20',
      approvalDate: null
    },
    {
      id: 4,
      loanId: 'LOAN-004',
      customerName: 'Emily Davis',
      accountNumber: 'ACC-1004',
      loanType: 'Business Loan',
      amount: 100000,
      interestRate: 10.5,
      tenure: 84,
      monthlyEMI: 1584,
      status: 'Rejected',
      applicationDate: '2024-12-05',
      approvalDate: '2024-12-08'
    },
    {
      id: 5,
      loanId: 'LOAN-005',
      customerName: 'Robert Wilson',
      accountNumber: 'ACC-1005',
      loanType: 'Education Loan',
      amount: 40000,
      interestRate: 8.0,
      tenure: 96,
      monthlyEMI: 581,
      status: 'Active',
      applicationDate: '2024-09-01',
      approvalDate: '2024-09-10'
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    loanType: 'Personal Loan',
    amount: '',
    interestRate: '',
    tenure: '',
    status: 'Pending'
  });


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const generateLoanId = () => {
    const lastLoan = loans[loans.length - 1];
    const lastNumber = parseInt(lastLoan.loanId.split('-')[1]);
    return `LOAN-${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const handleAddLoan = () => {
    setEditingLoan(null);
    setFormData({
      customerName: '',
      accountNumber: '',
      loanType: 'Personal Loan',
      amount: '',
      interestRate: '',
      tenure: '',
      status: 'Pending'
    });
    setShowModal(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setFormData({
      customerName: loan.customerName,
      accountNumber: loan.accountNumber,
      loanType: loan.loanType,
      amount: loan.amount,
      interestRate: loan.interestRate,
      tenure: loan.tenure,
      status: loan.status
    });
    setShowModal(true);
  };

  const handleDeleteLoan = (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      setLoans(loans.filter(loan => loan.id !== id));
    }
  };

  const handleApproveLoan = (id) => {
    setLoans(loans.map(loan => 
      loan.id === id 
        ? { ...loan, status: 'Approved', approvalDate: new Date().toISOString().split('T')[0] }
        : loan
    ));
  };

  const handleRejectLoan = (id) => {
    if (window.confirm('Are you sure you want to reject this loan?')) {
      setLoans(loans.map(loan => 
        loan.id === id 
          ? { ...loan, status: 'Rejected', approvalDate: new Date().toISOString().split('T')[0] }
          : loan
      ));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emi = calculateEMI(
      parseFloat(formData.amount),
      parseFloat(formData.interestRate),
      parseInt(formData.tenure)
    );

    if (editingLoan) {
      setLoans(loans.map(loan => 
        loan.id === editingLoan.id 
          ? { 
              ...loan, 
              ...formData,
              amount: parseFloat(formData.amount),
              interestRate: parseFloat(formData.interestRate),
              tenure: parseInt(formData.tenure),
              monthlyEMI: emi
            }
          : loan
      ));
    } else {
      const newLoan = {
        id: loans.length + 1,
        loanId: generateLoanId(),
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        tenure: parseInt(formData.tenure),
        monthlyEMI: emi,
        applicationDate: new Date().toISOString().split('T')[0],
        approvalDate: null
      };
      setLoans([...loans, newLoan]);
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filter loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || loan.loanType === filterType;
    const matchesStatus = filterStatus === 'All' || loan.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'Active').length;
  const pendingLoans = loans.filter(l => l.status === 'Pending').length;
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <div className="loans-container">
      {/* Header */}
      <div className="loans-header">
        <div>
          <h1>Loan Management</h1>
          <p>Manage loan applications and approvals</p>
        </div>
        <button className="btn-primary" onClick={handleAddLoan}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Loan Application
        </button>
      </div>

      {/* Stats */}
      <div className="loans-stats">
        <div className="stat-box">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Loans</div>
            <div className="stat-value">{totalLoans}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Loans</div>
            <div className="stat-value">{activeLoans}</div>
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
            <div className="stat-label">Pending Approval</div>
            <div className="stat-value">{pendingLoans}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Amount</div>
            <div className="stat-value">{formatCurrency(totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="loans-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, loan ID or account..."
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
          <option value="Personal Loan">Personal Loan</option>
          <option value="Home Loan">Home Loan</option>
          <option value="Car Loan">Car Loan</option>
          <option value="Business Loan">Business Loan</option>
          <option value="Education Loan">Education Loan</option>
        </select>
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Active">Active</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Loans Table */}
      <div className="loans-table">
        <table>
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Tenure</th>
              <th>Monthly EMI</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => (
              <tr key={loan.id}>
                <td><strong>{loan.loanId}</strong></td>
                <td>{loan.customerName}</td>
                <td>{loan.accountNumber}</td>
                <td>
                  <span className={`type-badge ${loan.loanType.toLowerCase().replace(' ', '-')}`}>
                    {loan.loanType}
                  </span>
                </td>
                <td className="amount">{formatCurrency(loan.amount)}</td>
                <td>{loan.interestRate}%</td>
                <td>{loan.tenure} months</td>
                <td className="emi">{formatCurrency(loan.monthlyEMI)}</td>
                <td>
                  <span className={`status-badge ${loan.status.toLowerCase()}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {loan.status === 'Pending' && (
                      <>
                        <button 
                          className="btn-icon btn-approve"
                          onClick={() => handleApproveLoan(loan.id)}
                          title="Approve"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-icon btn-reject"
                          onClick={() => handleRejectLoan(loan.id)}
                          title="Reject"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </>
                    )}
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEditLoan(loan)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteLoan(loan.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLoan ? 'Edit Loan' : 'New Loan Application'}</h2>
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
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter account number (e.g., ACC-1001)"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loan Type *</label>
                  <select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Education Loan">Education Loan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Loan Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="1000"
                    step="100"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Interest Rate (%) *</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="30"
                    step="0.1"
                    placeholder="8.5"
                  />
                </div>
                <div className="form-group">
                  <label>Tenure (Months) *</label>
                  <input
                    type="number"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleInputChange}
                    required
                    min="6"
                    max="360"
                    placeholder="36"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              {formData.amount && formData.interestRate && formData.tenure && (
                <div className="emi-preview">
                  <strong>Estimated Monthly EMI:</strong>
                  <span className="emi-amount">
                    {formatCurrency(calculateEMI(
                      parseFloat(formData.amount) || 0,
                      parseFloat(formData.interestRate) || 0,
                      parseInt(formData.tenure) || 1
                    ))}
                  </span>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingLoan ? 'Update Loan' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}