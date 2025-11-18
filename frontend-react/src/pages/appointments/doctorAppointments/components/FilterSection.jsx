import React from 'react';

const FilterSection = ({
  filterDateFrom,
  filterDateTo,
  filterType,
  onDateFromChange,
  onDateToChange,
  onTypeChange,
}) => {
  return (
    <div className="filter-section">
      <h3>Filters</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Appointment Type:</label>
          <select
            value={filterType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="virtual">Virtual</option>
            <option value="telehealth">Telehealth</option>
          </select>
        </div>

        {(filterDateFrom || filterDateTo || filterType !== 'all') && (
          <button
            className="btn-clear-filters"
            onClick={() => {
              onDateFromChange('');
              onDateToChange('');
              onTypeChange('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
