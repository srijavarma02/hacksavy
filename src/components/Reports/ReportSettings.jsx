import { useState, useEffect } from 'react';
import './ReportSettings.css';

function ReportSettings({ onClose }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('18:00');
  const [scheduleDays, setScheduleDays] = useState(['all']);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [smsRecipients, setSmsRecipients] = useState([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoCleanup, setAutoCleanup] = useState(true);

  // Input fields for adding recipients
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/reports/config');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Populate form with fetched config
      setConfig(data);
      setScheduleEnabled(data.schedule?.enabled || false);
      setScheduleTime(data.schedule?.time || '18:00');
      setScheduleDays(data.schedule?.days || ['all']);
      setEmailEnabled(data.distribution?.emailEnabled || false);
      setSmsEnabled(data.distribution?.smsEnabled || false);
      setEmailRecipients(data.distribution?.emailRecipients || []);
      setSmsRecipients(data.distribution?.smsRecipients || []);
      setRetentionDays(data.retention?.keepReports || 30);
      setAutoCleanup(data.retention?.autoCleanup !== false);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch config:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validateTime = (time) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  const validateForm = () => {
    const errors = {};

    if (scheduleEnabled && !validateTime(scheduleTime)) {
      errors.scheduleTime = 'Invalid time format. Use HH:MM (e.g., 18:00)';
    }

    if (emailEnabled && emailRecipients.length === 0) {
      errors.emailRecipients = 'At least one email recipient is required when email is enabled';
    }

    if (smsEnabled && smsRecipients.length === 0) {
      errors.smsRecipients = 'At least one SMS recipient is required when SMS is enabled';
    }

    if (retentionDays < 1) {
      errors.retentionDays = 'Retention days must be at least 1';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    
    if (!validateEmail(newEmail)) {
      setValidationErrors({ ...validationErrors, newEmail: 'Invalid email format' });
      return;
    }

    if (emailRecipients.includes(newEmail)) {
      setValidationErrors({ ...validationErrors, newEmail: 'Email already added' });
      return;
    }

    setEmailRecipients([...emailRecipients, newEmail]);
    setNewEmail('');
    setValidationErrors({ ...validationErrors, newEmail: null });
  };

  const handleRemoveEmail = (email) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email));
  };

  const handleAddPhone = () => {
    if (!newPhone.trim()) return;
    
    if (!validatePhone(newPhone)) {
      setValidationErrors({ ...validationErrors, newPhone: 'Invalid phone format. Use E.164 format (e.g., +918008584156)' });
      return;
    }

    if (smsRecipients.includes(newPhone)) {
      setValidationErrors({ ...validationErrors, newPhone: 'Phone number already added' });
      return;
    }

    setSmsRecipients([...smsRecipients, newPhone]);
    setNewPhone('');
    setValidationErrors({ ...validationErrors, newPhone: null });
  };

  const handleRemovePhone = (phone) => {
    setSmsRecipients(smsRecipients.filter(p => p !== phone));
  };

  const handleDayToggle = (day) => {
    if (scheduleDays.includes('all')) {
      // If 'all' is selected, switch to specific day
      setScheduleDays([day]);
    } else if (scheduleDays.includes(day)) {
      // Remove day if already selected
      const newDays = scheduleDays.filter(d => d !== day);
      setScheduleDays(newDays.length === 0 ? ['all'] : newDays);
    } else {
      // Add day
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const updatedConfig = {
        schedule: {
          enabled: scheduleEnabled,
          time: scheduleTime,
          days: scheduleDays,
          timezone: 'Asia/Kolkata'
        },
        distribution: {
          emailEnabled,
          smsEnabled,
          emailRecipients,
          smsRecipients,
          includeAttachments: true,
          summaryOnly: false
        },
        retention: {
          keepReports: retentionDays,
          autoCleanup
        },
        dataCollection: {
          includeHistoricalComparison: true,
          comparisonDays: 7
        }
      };

      const response = await fetch('http://localhost:3001/api/reports/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setConfig(result);
      setSuccessMessage('Configuration saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setSaving(false);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(err.message);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (config) {
      // Reset to original config
      setScheduleEnabled(config.schedule?.enabled || false);
      setScheduleTime(config.schedule?.time || '18:00');
      setScheduleDays(config.schedule?.days || ['all']);
      setEmailEnabled(config.distribution?.emailEnabled || false);
      setSmsEnabled(config.distribution?.smsEnabled || false);
      setEmailRecipients(config.distribution?.emailRecipients || []);
      setSmsRecipients(config.distribution?.smsRecipients || []);
      setRetentionDays(config.retention?.keepReports || 30);
      setAutoCleanup(config.retention?.autoCleanup !== false);
      setValidationErrors({});
      setSuccessMessage('');
    }
    if (onClose) {
      onClose();
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) {
    return (
      <div className="report-settings">
        <div className="loading">Loading configuration...</div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="report-settings">
        <div className="error-message">
          <h3>⚠️ Error Loading Configuration</h3>
          <p>{error}</p>
          <button onClick={fetchConfig}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-settings">
      <div className="settings-header">
        <h2>⚙️ Report Settings</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>✕</button>
        )}
      </div>

      {successMessage && (
        <div className="success-message">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="settings-content">
        {/* Schedule Configuration */}
        <div className="settings-section">
          <h3>📅 Schedule Configuration</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
              />
              <span>Enable automatic report generation</span>
            </label>
          </div>

          {scheduleEnabled && (
            <>
              <div className="form-group">
                <label>Report Generation Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className={validationErrors.scheduleTime ? 'error' : ''}
                />
                {validationErrors.scheduleTime && (
                  <span className="error-text">{validationErrors.scheduleTime}</span>
                )}
                <span className="help-text">Time in IST (Asia/Kolkata timezone)</span>
              </div>

              <div className="form-group">
                <label>Days of Week</label>
                <div className="days-selector">
                  <button
                    className={`day-button ${scheduleDays.includes('all') ? 'active' : ''}`}
                    onClick={() => setScheduleDays(['all'])}
                  >
                    All Days
                  </button>
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      className={`day-button ${scheduleDays.includes(day) ? 'active' : ''}`}
                      onClick={() => handleDayToggle(day)}
                      disabled={scheduleDays.includes('all')}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Email Recipients */}
        <div className="settings-section">
          <h3>📧 Email Recipients</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
              />
              <span>Enable email distribution</span>
            </label>
          </div>

          {emailEnabled && (
            <>
              <div className="form-group">
                <label>Add Email Recipient</label>
                <div className="input-with-button">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                    placeholder="admin@campus.edu"
                    className={validationErrors.newEmail ? 'error' : ''}
                  />
                  <button onClick={handleAddEmail}>Add</button>
                </div>
                {validationErrors.newEmail && (
                  <span className="error-text">{validationErrors.newEmail}</span>
                )}
              </div>

              {emailRecipients.length > 0 && (
                <div className="recipients-list">
                  {emailRecipients.map((email, index) => (
                    <div key={index} className="recipient-item">
                      <span>{email}</span>
                      <button 
                        className="remove-button"
                        onClick={() => handleRemoveEmail(email)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.emailRecipients && (
                <span className="error-text">{validationErrors.emailRecipients}</span>
              )}
            </>
          )}
        </div>

        {/* SMS Recipients */}
        <div className="settings-section">
          <h3>📱 SMS Recipients</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
              />
              <span>Enable SMS distribution</span>
            </label>
          </div>

          {smsEnabled && (
            <>
              <div className="form-group">
                <label>Add SMS Recipient</label>
                <div className="input-with-button">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPhone()}
                    placeholder="+918008584156"
                    className={validationErrors.newPhone ? 'error' : ''}
                  />
                  <button onClick={handleAddPhone}>Add</button>
                </div>
                {validationErrors.newPhone && (
                  <span className="error-text">{validationErrors.newPhone}</span>
                )}
                <span className="help-text">Use E.164 format (e.g., +918008584156)</span>
              </div>

              {smsRecipients.length > 0 && (
                <div className="recipients-list">
                  {smsRecipients.map((phone, index) => (
                    <div key={index} className="recipient-item">
                      <span>{phone}</span>
                      <button 
                        className="remove-button"
                        onClick={() => handleRemovePhone(phone)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.smsRecipients && (
                <span className="error-text">{validationErrors.smsRecipients}</span>
              )}
            </>
          )}
        </div>

        {/* Retention Policy */}
        <div className="settings-section">
          <h3>🗄️ Retention Policy</h3>
          
          <div className="form-group">
            <label>Keep Reports For (Days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 1)}
              className={validationErrors.retentionDays ? 'error' : ''}
            />
            {validationErrors.retentionDays && (
              <span className="error-text">{validationErrors.retentionDays}</span>
            )}
            <span className="help-text">Reports older than this will be deleted</span>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoCleanup}
                onChange={(e) => setAutoCleanup(e.target.checked)}
              />
              <span>Enable automatic cleanup of old reports</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button 
          className="cancel-button" 
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          className="save-button" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

export default ReportSettings;
