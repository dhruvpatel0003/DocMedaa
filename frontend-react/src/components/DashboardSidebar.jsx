// DashboardSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardSidebar.css';

const DashboardSidebar = ({ isOpen, onClose, unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const baseNavItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/dashboard' },
    { id: 'notification', label: 'Notification', icon: '🔔', path: '/notification' },
    { id: 'tracker', label: 'My Tracker', icon: '📊', path: '/tracker' },
    { id: 'history', label: 'History', icon: '📜', path: '/history' },
    { id: 'about', label: 'About Us', icon: 'ℹ️', path: '/about-us' },
  ];

  const doctorNavItems = [
    { id: 'appointments', label: 'Appointments', icon: '📅', path: '/doctor/appointments' },
    { id: 'chat', label: 'Chat with Patients', icon: '💬', path: '/doctor/chat' },
    { id: 'devices', label: 'Devices', icon: '📱', path: '/doctor/devices' },
    { id: 'resources', label: 'Resources', icon: '📚', path: '/doctor/resources' },
  ];

  const navItems = [
    ...baseNavItems,
    ...(isDoctor ? doctorNavItems : [])
  ];

  const handleNavClick = (path) => {
    navigate(path);
    onClose && onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const showBadge = item.id === 'notification' && unreadCount > 0;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">
                  {item.label}
                  {showBadge && (
                    <span className="nav-badge">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="help-btn" title="Help" onClick={()=>navigate('/help')}>
            <span>❓</span>
            <span>Help</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
