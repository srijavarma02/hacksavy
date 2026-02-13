import { useState } from 'react';
import './AlertSection.css';

function AlertSection({ alertSummary }) {
  const [expandedAlert, setExpandedAlert] = useState(null);

  if (!alertSummary) {
    return (
      <div className="alert-section">
        <h3>🚨 Alert Summary</h3>
        <p className="no-data">No alert data available</p>
      </div>
    );
  }

  const { total, critical, warning, info, avgResponseTime, topAlerts } = alertSummary;

  const toggleAlert = (index) => {
    setExpandedAlert(expandedAlert === index ? null : index);
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      default:
        return 'severity-info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="alert-section">
      <h3>🚨 Alert Summary</h3>
      
      <div className="alert-stats">
        <div className="stat-card total">
          <span className="stat-label">Total Alerts</span>
          <span className="stat-value">{total || 0}</span>
        </div>
        
        <div className="stat-card critical">
          <span className="stat-label">Critical</span>
          <span className="stat-value">{critical || 0}</span>
        </div>
        
        <div className="stat-card warning">
          <span className="stat-label">Warning</span>
          <span className="stat-value">{warning || 0}</span>
        </div>
        
        <div className="stat-card info">
          <span className="stat-label">Info</span>
          <span className="stat-value">{info || 0}</span>
        </div>
        
        <div className="stat-card response-time">
          <span className="stat-label">Avg Response Time</span>
          <span className="stat-value">
            {avgResponseTime !== undefined && avgResponseTime !== null 
              ? `${avgResponseTime.toFixed(1)} min` 
              : 'N/A'}
          </span>
        </div>
      </div>

      {topAlerts && topAlerts.length > 0 && (
        <div className="top-alerts">
          <h4>Top Alerts</h4>
          <div className="alerts-list">
            {topAlerts.map((alert, index) => (
              <div 
                key={index} 
                className={`alert-item ${getSeverityClass(alert.severity)} ${expandedAlert === index ? 'expanded' : ''}`}
                onClick={() => toggleAlert(index)}
              >
                <div className="alert-header">
                  <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
                  <span className="alert-title">{alert.title || alert.message || 'Alert'}</span>
                  <span className="alert-time">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                
                {expandedAlert === index && (
                  <div className="alert-details">
                    {alert.buildingName && (
                      <p><strong>Building:</strong> {alert.buildingName}</p>
                    )}
                    {alert.message && alert.title !== alert.message && (
                      <p><strong>Message:</strong> {alert.message}</p>
                    )}
                    {alert.value !== undefined && (
                      <p><strong>Value:</strong> {alert.value}</p>
                    )}
                    {alert.threshold !== undefined && (
                      <p><strong>Threshold:</strong> {alert.threshold}</p>
                    )}
                    {alert.responseTime !== undefined && (
                      <p><strong>Response Time:</strong> {alert.responseTime} min</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!topAlerts || topAlerts.length === 0) && total > 0 && (
        <div className="no-top-alerts">
          <p>No detailed alert information available</p>
        </div>
      )}
    </div>
  );
}

export default AlertSection;
