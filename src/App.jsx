import { useState } from 'react'
import './App.css'

function App() {
  const [filters, setFilters] = useState({
    firstName: '',
    secondName: '',
    ratingMin: 0,
    ratingMax: 10,
    ageMin: '',
    ageMax: '',
    preferenceHours: []
  })

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceHoursChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    handleFilterChange('preferenceHours', selectedOptions)
  }

  const timeSlots = [
    '06:00 - 08:00',
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00',
    '22:00 - 00:00'
  ]

  const handleInsertUser = () => {
    // Disabled for MVP
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Padel Club Management</h1>
          <p className="subtitle">Manage your players efficiently</p>
        </header>

        <div className="filter-card">
          <div className="filter-header">
            <h2>Player Filters</h2>
            <button
              className="btn-primary btn-insert"
              onClick={handleInsertUser}
              disabled
            >
              + Add Player
            </button>
          </div>

          <div className="filter-grid">
            {/* Name Filters */}
            <div className="filter-section">
              <label className="filter-label">
                First Name
                <input
                  type="text"
                  className="input"
                  placeholder="Search by first name..."
                  value={filters.firstName}
                  onChange={(e) => handleFilterChange('firstName', e.target.value)}
                />
              </label>
            </div>

            <div className="filter-section">
              <label className="filter-label">
                Second Name
                <input
                  type="text"
                  className="input"
                  placeholder="Search by second name..."
                  value={filters.secondName}
                  onChange={(e) => handleFilterChange('secondName', e.target.value)}
                />
              </label>
            </div>

            {/* Rating Range Filter */}
            <div className="filter-section full-width">
              <label className="filter-label">
                Player Rating: {filters.ratingMin} - {filters.ratingMax}
                <div className="range-inputs">
                  <div className="range-input-group">
                    <label className="range-label">Min</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      className="range-slider"
                      value={filters.ratingMin}
                      onChange={(e) => handleFilterChange('ratingMin', parseFloat(e.target.value))}
                    />
                    <span className="range-value">{filters.ratingMin}</span>
                  </div>
                  <div className="range-input-group">
                    <label className="range-label">Max</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      className="range-slider"
                      value={filters.ratingMax}
                      onChange={(e) => handleFilterChange('ratingMax', parseFloat(e.target.value))}
                    />
                    <span className="range-value">{filters.ratingMax}</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Age Filter */}
            <div className="filter-section">
              <label className="filter-label">
                Min Age
                <input
                  type="number"
                  className="input"
                  placeholder="Min age"
                  min="0"
                  max="100"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                />
              </label>
            </div>

            <div className="filter-section">
              <label className="filter-label">
                Max Age
                <input
                  type="number"
                  className="input"
                  placeholder="Max age"
                  min="0"
                  max="100"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                />
              </label>
            </div>

            {/* Preference Hours Filter */}
            <div className="filter-section full-width">
              <label className="filter-label">
                Preferred Playing Hours
                <select
                  multiple
                  className="select-multiple"
                  value={filters.preferenceHours}
                  onChange={handlePreferenceHoursChange}
                >
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <span className="help-text">Hold Ctrl/Cmd to select multiple time slots</span>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.firstName || filters.secondName || filters.preferenceHours.length > 0 ||
            filters.ageMin || filters.ageMax || filters.ratingMin > 0 || filters.ratingMax < 10) && (
            <div className="active-filters">
              <h3>Active Filters:</h3>
              <div className="filter-tags">
                {filters.firstName && (
                  <span className="filter-tag">First Name: {filters.firstName}</span>
                )}
                {filters.secondName && (
                  <span className="filter-tag">Second Name: {filters.secondName}</span>
                )}
                {(filters.ratingMin > 0 || filters.ratingMax < 10) && (
                  <span className="filter-tag">Rating: {filters.ratingMin} - {filters.ratingMax}</span>
                )}
                {filters.ageMin && (
                  <span className="filter-tag">Min Age: {filters.ageMin}</span>
                )}
                {filters.ageMax && (
                  <span className="filter-tag">Max Age: {filters.ageMax}</span>
                )}
                {filters.preferenceHours.length > 0 && (
                  <span className="filter-tag">
                    Time Slots: {filters.preferenceHours.length} selected
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="results-placeholder">
          <div className="placeholder-content">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="placeholder-icon"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3>Player List</h3>
            <p>Connect to backend to display filtered players</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
