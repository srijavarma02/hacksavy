import React from 'react';
import './Header.css';

function Header({ timeFilter, setTimeFilter, viewMode, setViewMode }) {
  const timeOptions = [
    { value: '15m', label: '15 Min' },
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>Smart Campus Energy</h1>
            <p className="subtitle">Real-time Monitoring System</p>
          </div>
        </div>
        
        <div className="view-switcher">
          <button 
            className={viewMode === 'overview' ? 'active' : ''} 
            onClick={() => setViewMode('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={viewMode === 'analytics' ? 'active' : ''} 
            onClick={() => setViewMode('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={viewMode === 'sustainability' ? 'active' : ''} 
            onClick={() => setViewMode('sustainability')}
          >
            🌱 Sustainability
          </button>
          <button
            className={viewMode === 'reports' ? 'active' : ''}
            onClick={() => setViewMode('reports')}
          >
            📄 Reports
          </button>
        </div>
        
        <div className="time-filters">
          {timeOptions.map(option => (
            <button
              key={option.value}
              className={`time-btn ${timeFilter === option.value ? 'active' : ''}`}
              onClick={() => setTimeFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Live</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
