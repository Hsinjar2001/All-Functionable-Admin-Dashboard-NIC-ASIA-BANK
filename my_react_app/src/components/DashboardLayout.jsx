import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './dashboard/Topbar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="content-wrapper">
          <Outlet />   {/* <-- important */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;