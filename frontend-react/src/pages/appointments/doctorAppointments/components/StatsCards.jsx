import React from 'react';

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card total">
        <div className="stat-number">{stats.total}</div>
        <div className="stat-label">Total Today</div>
      </div>
      <div className="stat-card completed">
        <div className="stat-number" style={{ color: '#28A745' }}>
          {stats.completed}
        </div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="stat-card remaining">
        <div className="stat-number" style={{ color: '#FFA500' }}>
          {stats.remaining}
        </div>
        <div className="stat-label">Remaining</div>
      </div>
    </div>
  );
};

export default StatsCards;
