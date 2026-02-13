import React from 'react';
import './AlertsPanel.css';

function AlertsPanel({ data }) {
  if (!data || !data.alerts) return null;

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getAlertClass = (severity) => {
    return `alert-item ${severity}`;
  };

  return (
    <div className="alerts-panel">
      <h2 className="section-title">System Alerts</h2>
      
      <div className="alerts-list">
        {data.alerts.length === 0 ? (
          <div className="no-alerts">
            <span className="check-icon">✓</span>
            <p>All systems operating normally</p>
          </div>
        ) : (
          data.alerts.map((alert, index) => (
            <div key={index} className={getAlertClass(alert.severity)}>
              <span className="alert-icon">{getAlertIcon(alert.severity)}</span>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-location">{alert.location}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
