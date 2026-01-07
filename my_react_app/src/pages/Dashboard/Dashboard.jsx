import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // ✅ State management
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: 'Operations',
    status: 'active'
  });

  // ✅ Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // ✅ Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // ✅ Check if user is admin
  const isAdmin = () => {
    const user = getCurrentUser();
    return user && (user.role === 'ADMIN' || user.role === 'admin');
  };

  // ✅ Fetch users from API
  const fetchUsers = async () => {
    try {
      console.log('📥 Fetching users from API...');
      const token = getToken();
      
      if (!token) {
        console.error('❌ No token found');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);

      if (response.status === 401) {
        console.error('❌ Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('✅ Users fetched:', data);
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  // ✅ Fetch stats from API
  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats from API...');
      const token = getToken();

      const response = await fetch('http://localhost:8000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stats fetched:', data);
        setStats(data);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  // ✅ Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // ✅ Add user handler
  const handleAddUser = () => {
    if (!isAdmin()) {
      alert('Only admins can add users');
      return;
    }
    
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      department: 'Operations',
      status: 'active'
    });
    setShowModal(true);
  };

  // ✅ Edit user handler
  const handleEditUser = (user) => {
    if (!isAdmin()) {
      alert('Only admins can edit users');
      return;
    }
    
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't prefill password
      role: user.role,
      department: user.department,
      status: user.status.toLowerCase()
    });
    setShowModal(true);
  };

  // ✅ Delete user handler
  const handleDeleteUser = async (id) => {
    if (!isAdmin()) {
      alert('Only admins can delete users');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting user ID: ${id}`);
      const token = getToken();

      const response = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ User deleted successfully');
        // Refresh data
        await Promise.all([fetchUsers(), fetchStats()]);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete user');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // ✅ Input change handler
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Submit handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin()) {
      alert('Only admins can manage users');
      return;
    }

    try {
      const token = getToken();
      
      if (editingUser) {
        // UPDATE USER
        console.log(`✏️ Updating user ID: ${editingUser.id}`);
        
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          status: formData.status
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await fetch(`http://localhost:8000/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          console.log('✅ User updated successfully');
          setShowModal(false);
          // Refresh data
          await Promise.all([fetchUsers(), fetchStats()]);
        } else {
          const errorData = await response.json();
          alert(errorData.detail || 'Failed to update user');
        }
      } else {
        // CREATE USER
        console.log('➕ Creating new user');
        console.log('📤 Data:', formData);

        const response = await fetch('http://localhost:8000/api/users/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        console.log('📥 Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ User created successfully:', result);
          setShowModal(false);
          // Refresh data
          await Promise.all([fetchUsers(), fetchStats()]);
        } else {
          const errorData = await response.json();
          console.error('❌ Error:', errorData);
          alert(errorData.detail || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Failed to save user');
    }
  };

  // ✅ Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // ✅ Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      {/* Top Nav Bar */}
      <div className="top-nav-bar">
        {/* <h1 className="dashboard-title">Dashboard</h1> */}
        <div className="profile-actions">
          <a href="#profile" className="home-profile-link">
            {getCurrentUser()?.name || 'Profile'}
          </a>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      {/* User Management Header */}
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

      {/* Error Message */}
      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c00', borderRadius: '5px', margin: '20px 0' }}>
          {error}
        </div>
      )}

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
            <div className="stat-info positive">+{stats.newUsersThisMonth} this month</div>
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
            <div className="stat-value">4 types</div>
            <div className="role-tags">
              <span className="role-tag admin">Admin</span>
              <span className="role-tag manager">Manager</span>
              <span className="role-tag staff">Staff</span>
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
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="users-table-container">
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
                <label>Full Name *</label>
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
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                  minLength="6"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Department *</label>
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
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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