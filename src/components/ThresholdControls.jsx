import React, { useState, useEffect } from 'react';
import './ThresholdControls.css';

function ThresholdControls() {
  const [config, setConfig] = useState(null);
  const [morningWarning, setMorningWarning] = useState(150);
  const [morningCritical, setMorningCritical] = useState(200);
  const [nightWarning, setNightWarning] = useState(100);
  const [nightCritical, setNightCritical] = useState(150);
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [adaptiveMultiplier, setAdaptiveMultiplier] = useState(1.5);

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/config');
      const data = await response.json();
      setConfig(data);
      
      // Update local state with server values
      setMorningWarning(data.thresholds.morning.warning);
      setMorningCritical(data.thresholds.morning.critical);
      setNightWarning(data.thresholds.night.warning);
      setNightCritical(data.thresholds.night.critical);
      setAdaptiveMode(data.adaptiveMode);
      setAdaptiveMultiplier(data.adaptiveMultiplier);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const updateThresholds = async (period, warning, critical) => {
    try {
      await fetch('http://localhost:3001/api/monitoring/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, warning, critical })
      });
      fetchConfig();
    } catch (error) {
      console.error('Failed to update thresholds:', error);
    }
  };

  const updateAdaptiveMode = async (enabled, multiplier) => {
    try {
      await fetch('http://localhost:3001/api/monitoring/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, multiplier })
      });
      fetchConfig();
    } catch (error) {
      console.error('Failed to update adaptive mode:', error);
    }
  };

  const handleMorningWarningChange = (value) => {
    const val = parseFloat(value);
    setMorningWarning(val);
    updateThresholds('morning', val, morningCritical);
  };

  const handleMorningCriticalChange = (value) => {
    const val = parseFloat(value);
    setMorningCritical(val);
    updateThresholds('morning', morningWarning, val);
  };

  const handleNightWarningChange = (value) => {
    const val = parseFloat(value);
    setNightWarning(val);
    updateThresholds('night', val, nightCritical);
  };

  const handleNightCriticalChange = (value) => {
    const val = parseFloat(value);
    setNightCritical(val);
    updateThresholds('night', nightWarning, val);
  };

  const handleAdaptiveModeChange = (checked) => {
    setAdaptiveMode(checked);
    updateAdaptiveMode(checked, adaptiveMultiplier);
  };

  const handleMultiplierChange = (value) => {
    const val = parseFloat(value);
    setAdaptiveMultiplier(val);
    updateAdaptiveMode(adaptiveMode, val);
  };

  if (!config || !config.currentThresholds || !config.historicalStats) {
    return <div className="threshold-controls loading">Loading configuration...</div>;
  }

  const currentThresholds = config.currentThresholds;
  const isPeriodMorning = config.currentPeriod === 'morning';

  return (
    <div className="threshold-controls">
      <div className="controls-header">
        <h3>⚙️ Threshold Configuration</h3>
        <div className="current-period">
          <span className={`period-badge ${config.currentPeriod}`}>
            {isPeriodMorning ? '☀️ Morning' : '🌙 Night'} (6{isPeriodMorning ? 'AM' : 'PM'}-6{isPeriodMorning ? 'PM' : 'AM'})
          </span>
        </div>
      </div>

      <div className="threshold-sections">
        {/* Morning Thresholds */}
        <div className="threshold-section morning">
          <h4>☀️ Morning Period (6AM - 6PM)</h4>
          
          <div className="threshold-input-group">
            <label>
              <span className="label-text">Warning Threshold (kW)</span>
              <input
                type="number"
                value={morningWarning}
                onChange={(e) => handleMorningWarningChange(e.target.value)}
                min="0"
                step="10"
                className="threshold-input warning"
              />
            </label>
            
            <label>
              <span className="label-text">Critical Threshold (kW)</span>
              <input
                type="number"
                value={morningCritical}
                onChange={(e) => handleMorningCriticalChange(e.target.value)}
                min="0"
                step="10"
                className="threshold-input critical"
              />
            </label>
          </div>
        </div>

        {/* Night Thresholds */}
        <div className="threshold-section night">
          <h4>🌙 Night Period (6PM - 6AM)</h4>
          
          <div className="threshold-input-group">
            <label>
              <span className="label-text">Warning Threshold (kW)</span>
              <input
                type="number"
                value={nightWarning}
                onChange={(e) => handleNightWarningChange(e.target.value)}
                min="0"
                step="10"
                className="threshold-input warning"
              />
            </label>
            
            <label>
              <span className="label-text">Critical Threshold (kW)</span>
              <input
                type="number"
                value={nightCritical}
                onChange={(e) => handleNightCriticalChange(e.target.value)}
                min="0"
                step="10"
                className="threshold-input critical"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Adaptive Mode */}
      <div className="adaptive-section">
        <div className="adaptive-header">
          <label className="adaptive-toggle">
            <input
              type="checkbox"
              checked={adaptiveMode}
              onChange={(e) => handleAdaptiveModeChange(e.target.checked)}
            />
            <span>🤖 Use Adaptive Thresholds</span>
          </label>
          {adaptiveMode && (
            <span className="adaptive-badge">Active</span>
          )}
        </div>

        {adaptiveMode && (
          <div className="adaptive-controls">
            <label>
              <span className="label-text">Sensitivity Multiplier: {adaptiveMultiplier.toFixed(1)}x</span>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={adaptiveMultiplier}
                onChange={(e) => handleMultiplierChange(e.target.value)}
                className="multiplier-slider"
              />
              <div className="slider-labels">
                <span>Conservative (1.0x)</span>
                <span>Aggressive (2.0x)</span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Current Active Thresholds */}
      <div className="active-thresholds">
        <h4>📊 Currently Active Thresholds</h4>
        <div className="active-values">
          <div className="active-value warning">
            <span className="icon">⚠️</span>
            <div>
              <div className="value">{currentThresholds.warning?.toFixed(1) || '0.0'} kW</div>
              <div className="label">Warning</div>
            </div>
          </div>
          <div className="active-value critical">
            <span className="icon">🚨</span>
            <div>
              <div className="value">{currentThresholds.critical?.toFixed(1) || '0.0'} kW</div>
              <div className="label">Critical</div>
            </div>
          </div>
        </div>
        {currentThresholds.adaptive && (
          <div className="adaptive-indicator">
            🤖 Calculated from historical data
          </div>
        )}
      </div>

      {/* Historical Data */}
      <div className="historical-data">
        <h4>📈 Historical Data (Previous Day)</h4>
        <div className="historical-grid">
          <div className="historical-item">
            <div className="period-label">☀️ Morning</div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Average:</span>
                <span className="stat-value">{config.historicalStats.morning?.average || 0} kW</span>
              </div>
              <div className="stat">
                <span className="stat-label">Maximum:</span>
                <span className="stat-value">{config.historicalStats.morning?.max || 0} kW</span>
              </div>
            </div>
          </div>
          <div className="historical-item">
            <div className="period-label">🌙 Night</div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Average:</span>
                <span className="stat-value">{config.historicalStats.night?.average || 0} kW</span>
              </div>
              <div className="stat">
                <span className="stat-label">Maximum:</span>
                <span className="stat-value">{config.historicalStats.night?.max || 0} kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>How it works:</strong>
          <ul>
            <li>Alerts trigger only after power surge sustains for 3+ minutes</li>
            <li>Data updates every 1 minute</li>
            <li>Adaptive mode calculates thresholds from historical averages</li>
            <li>Thresholds automatically switch between morning/night periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ThresholdControls;
