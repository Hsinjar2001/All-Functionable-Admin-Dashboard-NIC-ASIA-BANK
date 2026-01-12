import React, { useState } from 'react';
import './customers.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    accountNumber: '',
    status: 'Active'
  });

  const generateCustomerId = () => {
    if (customers.length === 0) {
      return 'CUST-001';
    }
    const lastCustomer = customers[customers.length - 1];
    const lastNumber = parseInt(lastCustomer.customerId.split('-')[1]);
    return `CUST-${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setViewingCustomer(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      accountNumber: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setViewingCustomer(null);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      accountNumber: customer.accountNumber,
      status: customer.status
    });
    setShowModal(true);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(cust => cust.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCustomer) {
      setCustomers(customers.map(cust => 
        cust.id === editingCustomer.id 
          ? { ...cust, ...formData }
          : cust
      ));
    } else {
      const newCustomer = {
        id: customers.length + 1,
        customerId: generateCustomerId(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="customers-container">
      {/* Header */}
      <div className="customers-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage customer personal information and details</p>
        </div>
        <button className="btn-primary" onClick={handleAddCustomer}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Customer
        </button>
      </div>

      {/* Stats */}
      <div className="customers-stats">
        <div className="stat-box">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Active</div>
          <div className="stat-value">{customers.filter(c => c.status === 'Active').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Inactive</div>
          <div className="stat-value">{customers.filter(c => c.status === 'Inactive').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">New This Month</div>
          <div className="stat-value">
            {customers.filter(c => {
              const joinMonth = new Date(c.joinDate).getMonth();
              const currentMonth = new Date().getMonth();
              return joinMonth === currentMonth;
            }).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="customers-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Account Number</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.customerId}</strong></td>
                <td>
                  <div className="customer-name">
                    <div className="customer-avatar">
                      {customer.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{customer.fullName}</span>
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.accountNumber}</td>
                <td>
                  <span className={`status-badge ${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </span>
                </td>
                <td>{new Date(customer.joinDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-view"
                      onClick={() => handleViewCustomer(customer)}
                      title="View Details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteCustomer(customer.id)}
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
              <h2>
                {viewingCustomer ? 'Customer Details' : 
                 editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {viewingCustomer ? (
              <div className="customer-details">
                <div className="detail-avatar">
                  {viewingCustomer.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Customer ID</label>
                    <div className="detail-value">{viewingCustomer.customerId}</div>
                  </div>
                  <div className="detail-item">
                    <label>Full Name</label>
                    <div className="detail-value">{viewingCustomer.fullName}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="detail-value">{viewingCustomer.email}</div>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <div className="detail-value">{viewingCustomer.phone}</div>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <div className="detail-value">{viewingCustomer.address}</div>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <div className="detail-value">
                      {new Date(viewingCustomer.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Account Number</label>
                    <div className="detail-value">{viewingCustomer.accountNumber}</div>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <div className="detail-value">
                      <span className={`status-badge ${viewingCustomer.status.toLowerCase()}`}>
                        {viewingCustomer.status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Join Date</label>
                    <div className="detail-value">
                      {new Date(viewingCustomer.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-submit" 
                    onClick={() => handleEditCustomer(viewingCustomer)}
                  >
                    Edit Customer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    placeholder="Enter full address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
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
                      placeholder="ACC-1001"
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}