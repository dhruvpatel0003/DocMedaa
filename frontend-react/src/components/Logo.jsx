import React from 'react';
import '../styles/Logo.css';

const Logo = ({ size = 'medium', showText = true }) => {
  return (
    <div className={`logo-container logo-${size}`}>
      <div className="logo-cross">
        <div className="cross-vertical"></div>
        <div className="cross-horizontal"></div>
      </div>
      {showText && <span className="logo-text">DocMedaa</span>}
    </div>
  );
};

export default Logo;