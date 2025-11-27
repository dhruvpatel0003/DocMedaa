import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import '../styles/DashboardLayout.css';
import { useRealtimeNotifications } from '../utils/useRealtimeNotifications';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
    const { unreadCount } = useRealtimeNotifications();


  return (
    <div className="dashboard-layout">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount}/>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
