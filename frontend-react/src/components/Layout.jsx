import React from 'react';
import './Layout.css';
import Logo from './Logo';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="layout-wrapper">
      {showHeader && (
        <header className="app-header">
          <div className="header-container">
            <Logo size="small" />
            <nav className="header-nav">
              <a href="/" className="nav-link">Home</a>
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/profile" className="nav-link">Profile</a>
              <a href="/logout" className="nav-link logout">Logout</a>
            </nav>
          </div>
        </header>
      )}

      <main className="app-main">
        {children}
      </main>

      {showFooter && (
        <footer className="app-footer">
          <div className="footer-container">
            <p>&copy; 2024 DocMedaa. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;