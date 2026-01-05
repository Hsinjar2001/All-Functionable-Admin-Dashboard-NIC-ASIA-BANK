import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

// Import Dashboard Layout & Pages
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Accounts from './pages/Accounts/Accounts';
import Transactions from './pages/Transactions/Transactions';
import Loans from './pages/Loans/Loans';
import Reports from './pages/Reports/Reports';
import Customers from './pages/Customers/Customers';
import Settings from './pages/Settings/Settings';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - These MUST come first */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (With Sidebar) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="loans" element={<Loans />} />
          <Route path="reports" element={<Reports />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;