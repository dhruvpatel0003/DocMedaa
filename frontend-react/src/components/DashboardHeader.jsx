import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import '../styles/DashboardHeader.css';

const DashboardHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} title="Toggle Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Logo size="small" showText={true} />
      </div>

      <div className="header-right">
        <div className="profile-menu-wrapper">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Profile"
          >
            <div className="profile-avatar">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <p className="profile-name">{user?.fullName || 'User'}</p>
                <p className="profile-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}</p>
              </div>
              <button 
                className="dropdown-item"
                onClick={handleProfileClick}
              >
                📋 My Profile
              </button>
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
