import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    firstName: '',
    secondName: '',
    ratingMin: 0,
    ratingMax: 10,
    ageMin: '',
    ageMax: '',
    preferenceHours: []
  });

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add Player Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    secondName: '',
    rating: 5,
    age: '',
    preferenceHours: []
  });
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.firstName) params.append('firstName', filters.firstName);
      if (filters.secondName) params.append('secondName', filters.secondName);
      if (filters.ratingMin > 0) params.append('ratingMin', filters.ratingMin.toString());
      if (filters.ratingMax < 10) params.append('ratingMax', filters.ratingMax.toString());
      if (filters.ageMin) params.append('ageMin', filters.ageMin);
      if (filters.ageMax) params.append('ageMax', filters.ageMax);
      if (filters.preferenceHours.length > 0) {
        params.append('preferenceHours', filters.preferenceHours.join(','));
      }

      const response = await fetch(`${API_URL}/api/players?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, token, logout, navigate]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchPlayers]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceHoursChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    handleFilterChange('preferenceHours', selectedOptions);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
  ];

  const handleInsertUser = () => {
    setShowAddModal(true);
    setAddPlayerError(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewPlayer({
      firstName: '',
      secondName: '',
      rating: 5,
      age: '',
      preferenceHours: []
    });
    setAddPlayerError(null);
  };

  const handleNewPlayerChange = (field, value) => {
    setNewPlayer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewPlayerHoursChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    handleNewPlayerChange('preferenceHours', selectedOptions);
  };

  const handleSubmitNewPlayer = async (e) => {
    e.preventDefault();
    setAddPlayerLoading(true);
    setAddPlayerError(null);

    try {
      const response = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: newPlayer.firstName,
          secondName: newPlayer.secondName,
          rating: parseFloat(newPlayer.rating),
          age: parseInt(newPlayer.age, 10),
          preferenceHours: newPlayer.preferenceHours,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.join(', ') || errorData.error || 'Failed to create player');
      }

      handleCloseModal();
      fetchPlayers();
    } catch (err) {
      setAddPlayerError(err.message);
    } finally {
      setAddPlayerLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="user-header">
          <div className="user-info">
            {user?.picture && (
              <img src={user.picture} alt="Profile" className="user-avatar" />
            )}
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sign Out
          </button>
        </div>

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
            >
              + Add Player
            </button>
          </div>

          <div className="filter-grid">
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

        <div className="players-section">
          <div className="players-header">
            <h2>Players</h2>
            <span className="player-count">{players.length} found</span>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading players...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <p className="error-hint">Make sure the backend server is running on port 3000</p>
            </div>
          )}

          {!loading && !error && players.length === 0 && (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="empty-icon"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>No Players Found</h3>
              <p>Try adjusting your filters or add some players to the database</p>
            </div>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="players-table-container">
              <table className="players-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rating</th>
                    <th>Age</th>
                    <th>Preferred Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td className="player-name">
                        {player.firstName} {player.secondName}
                      </td>
                      <td>
                        <span className="rating-badge">{player.rating.toFixed(1)}</span>
                      </td>
                      <td>{player.age}</td>
                      <td>
                        <div className="time-slots">
                          {player.preferenceHours.map((slot, idx) => (
                            <span key={idx} className="time-slot-badge">{slot}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Player</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmitNewPlayer}>
              <div className="modal-body">
                {addPlayerError && (
                  <div className="modal-error">{addPlayerError}</div>
                )}

                <div className="form-group">
                  <label className="filter-label">
                    First Name *
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter first name"
                      value={newPlayer.firstName}
                      onChange={(e) => handleNewPlayerChange('firstName', e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="filter-label">
                    Second Name *
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter second name"
                      value={newPlayer.secondName}
                      onChange={(e) => handleNewPlayerChange('secondName', e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="filter-label">
                    Rating: {newPlayer.rating}
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      className="range-slider"
                      value={newPlayer.rating}
                      onChange={(e) => handleNewPlayerChange('rating', parseFloat(e.target.value))}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="filter-label">
                    Age *
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter age"
                      min="1"
                      max="120"
                      value={newPlayer.age}
                      onChange={(e) => handleNewPlayerChange('age', e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="filter-label">
                    Preferred Playing Hours *
                    <select
                      multiple
                      className="select-multiple"
                      value={newPlayer.preferenceHours}
                      onChange={handleNewPlayerHoursChange}
                      required
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

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addPlayerLoading}>
                  {addPlayerLoading ? 'Creating...' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
