import React, { useState } from 'react';
import './Header.css';

function Header({ timeFilter, setTimeFilter, viewMode, setViewMode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const pdfUrl = `http://localhost:3001/api/reports/${data.reportId}/export/pdf`;
        const csvUrl = `http://localhost:3001/api/reports/${data.reportId}/export/csv`;
        setReportMessage(
          <span>
            ✓ Report generated! Download: 
            <a href={pdfUrl} download style={{ marginLeft: '8px', color: '#00d4ff' }}>PDF</a>
            <span style={{ margin: '0 4px' }}>|</span>
            <a href={csvUrl} download style={{ color: '#00d4ff' }}>CSV</a>
          </span>
        );
      } else {
        setReportMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setReportMessage(`✗ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
      // Clear message after 10 seconds
      setTimeout(() => setReportMessage(''), 10000);
    }
  };
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
        
        <button 
          className="generate-report-btn" 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Generating...' : '📄 Generate Report'}
        </button>
        
        {reportMessage && (
          <div className="report-message">
            {reportMessage}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
