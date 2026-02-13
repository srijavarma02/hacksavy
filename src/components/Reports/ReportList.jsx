import React, { useState, useEffect } from 'react';
import './ReportList.css';

function ReportList({ onSelectReport, refreshTrigger }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reports, startDate, endDate, sortOrder]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/reports');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reports];

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.generatedAt);
        return reportDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.generatedAt);
        return reportDate <= end;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.generatedAt);
      const dateB = new Date(b.generatedAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredReports(filtered);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = async (reportId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchReports();
      } else {
        alert('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="report-list">
        <div className="report-list-header">
          <h2>📊 Daily Evaluation Reports</h2>
        </div>
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-list">
        <div className="report-list-header">
          <h2>📊 Daily Evaluation Reports</h2>
        </div>
        <div className="error-message">
          <h3>⚠️ Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={fetchReports}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-list">
      <div className="report-list-header">
        <h2>📊 Daily Evaluation Reports</h2>
        <button className="refresh-btn" onClick={fetchReports}>
          🔄 Refresh
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="start-date">From:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">To:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-order">Sort:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {(startDate || endDate) && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>No reports available yet.</p>
          <p>Click "Generate Report" in the header to create your first report.</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">
          <p>No reports found matching the selected date range.</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="report-card"
              onClick={() => onSelectReport(report.id)}
            >
              <div className="report-card-header">
                <h3>Report {report.id}</h3>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDelete(report.id, e)}
                  title="Delete report"
                >
                  🗑️
                </button>
              </div>
              
              <div className="report-card-meta">
                <span className="report-date">
                  📅 {formatDate(report.generatedAt)}
                </span>
              </div>

              {report.summary && (
                <div className="report-card-summary">
                  <div className="summary-item">
                    <span className="label">Total Energy:</span>
                    <span className="value">{report.summary.totalEnergy?.toFixed(1) || 'N/A'} kWh</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Alerts:</span>
                    <span className="value">{report.summary.totalAlerts || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Critical Issues:</span>
                    <span className="value critical">{report.summary.criticalIssues || 0}</span>
                  </div>
                </div>
              )}

              <div className="report-card-footer">
                <span className="view-link">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportList;
