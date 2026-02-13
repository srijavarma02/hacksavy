import React, { useState, useEffect } from 'react';
import './SmartAlerts.css';

function SmartAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, critical, warning, info
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchAlerts();
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchAlerts();
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const sendTestSMS = async () => {
    setSendingTest(true);
    try {
      const response = await fetch('http://localhost:3001/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buildingId: 1, type: 'sms' })
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Test SMS sent successfully! Check your phone.');
        fetchNotifications(); // Refresh notification log
      } else {
        alert('❌ Failed to send SMS: ' + (result.error || result.message));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setSendingTest(false);
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  const acknowledgeAlert = async (alertId) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  return (
    <div className="smart-alerts">
      <div className="alerts-header">
        <h2>🚨 Smart Alerts & Notifications</h2>
        <div className="alert-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({alerts.length})
          </button>
          <button 
            className={filter === 'critical' ? 'active' : ''} 
            onClick={() => setFilter('critical')}
          >
            Critical
          </button>
          <button 
            className={filter === 'warning' ? 'active' : ''} 
            onClick={() => setFilter('warning')}
          >
            Warning
          </button>
          <button 
            className={filter === 'info' ? 'active' : ''} 
            onClick={() => setFilter('info')}
          >
            Info
          </button>
          <button 
            className="test-sms-btn" 
            onClick={sendTestSMS}
            disabled={sendingTest}
            style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: sendingTest ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: sendingTest ? 0.6 : 1
            }}
          >
            {sendingTest ? '📱 Sending...' : '📱 Send Test SMS'}
          </button>
        </div>
      </div>

      <div className="alerts-container">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`alert-item ${alert.severity}`}>
            <span className="alert-icon">{alert.icon}</span>
            <div className="alert-content">
              <div className="alert-title">
                {alert.title}
                {alert.mlDetected && (
                  <span className="ml-indicator">🤖 AI Detected</span>
                )}
                {alert.anomalyScore && (
                  <span className="anomaly-score">Score: {alert.anomalyScore.toFixed(2)}</span>
                )}
              </div>
              <div className="alert-description">{alert.description}</div>
              <div className="alert-meta">
                <span className="alert-location">📍 {alert.location}</span>
                <span className="alert-time">🕐 {alert.time}</span>
                {alert.wastagePercent && (
                  <span>📊 {alert.wastagePercent}% over baseline</span>
                )}
              </div>
              {alert.notificationSent && (
                <div className="notification-badge sent">
                  ✓ SMS/WhatsApp Sent to {alert.recipient}
                </div>
              )}
              {alert.notificationPending && (
                <div className="notification-badge pending">
                  ⏳ Notification Pending
                </div>
              )}
              <div className="alert-actions">
                <button onClick={() => acknowledgeAlert(alert.id)}>
                  Acknowledge
                </button>
                <button>View Details</button>
                {alert.severity === 'critical' && (
                  <button>Escalate</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-log">
        <h3>📱 Notification Log (Last 10)</h3>
        {notifications.slice(0, 10).map((notif, index) => (
          <div key={index} className="notification-item">
            <span className="icon">{notif.channel === 'sms' ? '📱' : '💬'}</span>
            <div className="details">
              <strong>{notif.recipient}</strong>: {notif.message}
            </div>
            <span className="timestamp">{notif.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartAlerts;
