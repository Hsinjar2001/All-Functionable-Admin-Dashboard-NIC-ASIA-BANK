import React, { useState } from 'react';
import './settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    email: 'admin@abcbank.com',
    phone: '+1 (555) 123-4567',
    role: 'Super Admin',
    department: 'Administration',
    avatar: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: true,
    loginAlerts: true
  });

  const [bankSettings, setBankSettings] = useState({
    bankName: 'ABC Bank',
    bankCode: 'ABC123',
    swiftCode: 'ABCUS33XXX',
    email: 'info@abcbank.com',
    phone: '+1 (800) 123-4567',
    address: '123 Financial District, New York, NY 10005',
    workingHours: '9:00 AM - 5:00 PM',
    workingDays: 'Monday - Friday'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newAccountAlerts: true,
    transactionAlerts: true,
    loanAlerts: true,
    securityAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'America/New_York',
    language: 'English',
    theme: 'light'
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSecurityData({
      ...securityData,
      [e.target.name]: value
    });
  };

  const handleBankSettingsChange = (e) => {
    setBankSettings({
      ...bankSettings,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  const handleSystemChange = (e) => {
    setSystemSettings({
      ...systemSettings,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Security settings updated successfully!');
    setSecurityData({
      ...securityData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleBankSettingsSubmit = (e) => {
    e.preventDefault();
    alert('Bank settings updated successfully!');
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    alert('Notification settings updated successfully!');
  };

  const handleSystemSubmit = (e) => {
    e.preventDefault();
    alert('System settings updated successfully!');
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and system preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button 
          className={activeTab === 'profile' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </button>
        <button 
          className={activeTab === 'security' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('security')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Security
        </button>
        <button 
          className={activeTab === 'bank' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('bank')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Bank Info
        </button>
        <button 
          className={activeTab === 'notifications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notifications')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </button>
        <button 
          className={activeTab === 'system' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('system')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
          System
        </button>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="settings-content">
          <div className="settings-card">
            <div className="card-header">
              <h3>Profile Information</h3>
              <p>Update your personal information and profile details</p>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <button type="button" className="btn-secondary">Change Avatar</button>
                  <p className="help-text">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={profileData.role}
                    onChange={handleProfileChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                >
                  <option value="Administration">Administration</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="settings-content">
          <div className="settings-card">
            <div className="card-header">
              <h3>Password & Security</h3>
              <p>Manage your password and security preferences</p>
            </div>
            <form onSubmit={handleSecuritySubmit}>
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={securityData.currentPassword}
                  onChange={handleSecurityChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="security-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    checked={securityData.twoFactorAuth}
                    onChange={handleSecurityChange}
                  />
                  <label htmlFor="twoFactorAuth">
                    <strong>Two-Factor Authentication</strong>
                    <span>Add an extra layer of security to your account</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="loginAlerts"
                    name="loginAlerts"
                    checked={securityData.loginAlerts}
                    onChange={handleSecurityChange}
                  />
                  <label htmlFor="loginAlerts">
                    <strong>Login Alerts</strong>
                    <span>Get notified when someone logs into your account</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Update Security</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Settings */}
      {activeTab === 'bank' && (
        <div className="settings-content">
          <div className="settings-card">
            <div className="card-header">
              <h3>Bank Information</h3>
              <p>Manage your bank's core information and settings</p>
            </div>
            <form onSubmit={handleBankSettingsSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankSettings.bankName}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bank Code *</label>
                  <input
                    type="text"
                    name="bankCode"
                    value={bankSettings.bankCode}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SWIFT Code *</label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={bankSettings.swiftCode}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={bankSettings.email}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={bankSettings.phone}
                  onChange={handleBankSettingsChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={bankSettings.address}
                  onChange={handleBankSettingsChange}
                  rows="2"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Working Hours *</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={bankSettings.workingHours}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Working Days *</label>
                  <input
                    type="text"
                    name="workingDays"
                    value={bankSettings.workingDays}
                    onChange={handleBankSettingsChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Bank Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="settings-content">
          <div className="settings-card">
            <div className="card-header">
              <h3>Notification Preferences</h3>
              <p>Choose how and when you want to be notified</p>
            </div>
            <form onSubmit={handleNotificationSubmit}>
              <div className="notification-section">
                <h4>Communication Channels</h4>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="emailNotifications">
                    <strong>Email Notifications</strong>
                    <span>Receive notifications via email</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="smsNotifications">
                    <strong>SMS Notifications</strong>
                    <span>Receive notifications via SMS</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    name="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="pushNotifications">
                    <strong>Push Notifications</strong>
                    <span>Receive push notifications in browser</span>
                  </label>
                </div>
              </div>

              <div className="notification-section">
                <h4>Alert Types</h4>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="newAccountAlerts"
                    name="newAccountAlerts"
                    checked={notificationSettings.newAccountAlerts}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="newAccountAlerts">
                    <strong>New Account Alerts</strong>
                    <span>Get notified when new accounts are created</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="transactionAlerts"
                    name="transactionAlerts"
                    checked={notificationSettings.transactionAlerts}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="transactionAlerts">
                    <strong>Transaction Alerts</strong>
                    <span>Get notified about high-value transactions</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="loanAlerts"
                    name="loanAlerts"
                    checked={notificationSettings.loanAlerts}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="loanAlerts">
                    <strong>Loan Alerts</strong>
                    <span>Get notified about loan applications and approvals</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="securityAlerts"
                    name="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="securityAlerts">
                    <strong>Security Alerts</strong>
                    <span>Get notified about security events (recommended)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Preferences</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="settings-content">
          <div className="settings-card">
            <div className="card-header">
              <h3>System Preferences</h3>
              <p>Configure system-wide settings and preferences</p>
            </div>
            <form onSubmit={handleSystemSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Currency *</label>
                  <select
                    name="currency"
                    value={systemSettings.currency}
                    onChange={handleSystemChange}
                    required
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date Format *</label>
                  <select
                    name="dateFormat"
                    value={systemSettings.dateFormat}
                    onChange={handleSystemChange}
                    required
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time Zone *</label>
                  <select
                    name="timeZone"
                    value={systemSettings.timeZone}
                    onChange={handleSystemChange}
                    required
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Language *</label>
                  <select
                    name="language"
                    value={systemSettings.language}
                    onChange={handleSystemChange}
                    required
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Theme *</label>
                <select
                  name="theme"
                  value={systemSettings.theme}
                  onChange={handleSystemChange}
                  required
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}