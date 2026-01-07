import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './dashboard.css';

export default function Dashboard() {
  // Add useNavigate hook
  const navigate = useNavigate();
  
  // Initial users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@bankapp.com',
      role: 'Admin',
      department: 'Administration',
      status: 'Active',
      lastLogin: '2024-01-04 09:45 AM'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@bankapp.com',
      role: 'Manager',
      department: 'Finance',
      status: 'Active',
      lastLogin: '2024-01-05 10:30 AM'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@bankapp.com',
      role: 'Staff',
      department: 'Customer Service',
      status: 'Inactive',
      lastLogin: '2023-12-28 02:15 PM'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@bankapp.com',
      role: 'Staff',
      department: 'Operations',
      status: 'Active',
      lastLogin: '2024-01-02 11:20 AM'
    },
    {
      id: 5,
      name: 'Robert Johnson',
      email: 'robert.johnson@bankapp.com',
      role: 'Manager',
      department: 'IT',
      status: 'Active',
      lastLogin: '2024-01-03 08:15 AM'
    },
    {
      id: 6,
      name: 'Lisa Smith',
      email: 'lisa.smith@bankapp.com',
      role: 'Staff',
      department: 'Finance',
      status: 'Active',
      lastLogin: '2023-12-30 01:40 PM'
    }
  ]);

  // Stats data calculation (simplified for frontend demo)
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === 'Active').length,
    pendingApprovals: users.filter(user => user.status === 'Inactive').length, // Using Inactive count as proxy for pending
    userRoles: ['Admin', 'Manager', 'Staff']
  };

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    department: 'Operations',
    status: 'Active'
  });

  // Modified handleLogout to use navigation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Navigate to login page after logout
      navigate('/login');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Staff',
      department: 'Operations',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, id: editingUser.id, lastLogin: editingUser.lastLogin, ...formData } // Keep ID and Last Login
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...formData,
        lastLogin: 'Never'
      };
      setUsers([...users, newUser]);
    }
    
    setShowModal(false);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="dashboard-container">
      
      {/* Top Nav Bar: Title and Profile/Logout */}
      <div className="top-nav-bar">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="profile-actions">
              <a href="#profile" className="home-profile-link">HomeProfile</a>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
      </div>
      
      {/* User Management Header (Section Title + Date) */}
      <div className="user-management-header">
        <div className="header-info">
          <h2>User Management</h2>
          <p>Manage bank staff, administrators, and users</p>
        </div>
        <div className="date-display">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-info positive">+5 this month</div>
            <div className="progress-bar">
              <div className="progress" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-title">Active Users</div>
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-info">Most users active</div>
            <div className="mini-chart">
              <div className="chart-bar" style={{height: '60%'}}></div>
              <div className="chart-bar" style={{height: '80%'}}></div>
              <div className="chart-bar" style={{height: '70%'}}></div>
              <div className="chart-bar active" style={{height: '90%'}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-title">Pending Approvals</div>
            <div className="stat-value">{stats.pendingApprovals}</div>
            <div className="stat-info">Awaiting review</div>
            <div className="approval-dots">
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-title">User Roles</div>
            <div className="stat-value">{stats.userRoles.length} types</div>
            <div className="role-tags">
              {stats.userRoles.map((role, index) => (
                <span key={index} className={`role-tag ${role.toLowerCase()}`}>{role}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        Filters & Options
      </button>

      {/* User Management Tools */}
      <div className={`management-tools ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="left-tools">
          <button className="add-user-btn" onClick={handleAddUser}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Add New User
          </button>
        </div>
        <div className="right-tools">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </div>

      {/* User Table/Cards (responsive) */}
      <div className="users-table-container">
        {/* Desktop Table (Hidden on mobile) */}
        <div className="users-table desktop-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditUser(user)}
                          aria-label="Edit User"
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label="Delete User"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">No users found matching your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
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
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}