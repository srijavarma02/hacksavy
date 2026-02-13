import React, { useState, useEffect } from 'react';
import './SustainabilityMetrics.css';

function SustainabilityMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sustainability');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch sustainability metrics:', error);
    }
  };

  if (!metrics) return <div className="loading">Loading sustainability metrics...</div>;

  const circumference = 2 * Math.PI * 80;
  const renewableOffset = circumference - (metrics.renewablePercent / 100) * circumference;

  return (
    <div className="sustainability-metrics">
      <h2>🌱 Sustainability Dashboard</h2>

      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-icon">☁️</span>
            <span className="metric-label">CO₂ Emissions</span>
          </div>
          <div className="metric-value critical">
            {metrics.co2Emissions.toFixed(1)}
            <span className="metric-unit">kg</span>
          </div>
          <div className={`metric-change ${metrics.co2Change < 0 ? 'positive' : 'negative'}`}>
            {metrics.co2Change > 0 ? '↑' : '↓'} {Math.abs(metrics.co2Change).toFixed(1)}% vs yesterday
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-label">Energy Intensity</span>
          </div>
          <div className="metric-value">
            {metrics.energyIntensity.toFixed(2)}
            <span className="metric-unit">kWh/m²</span>
          </div>
          <div className={`metric-change ${metrics.intensityChange < 0 ? 'positive' : 'negative'}`}>
            {metrics.intensityChange > 0 ? '↑' : '↓'} {Math.abs(metrics.intensityChange).toFixed(1)}%
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-icon">🌿</span>
            <span className="metric-label">Renewable Energy</span>
          </div>
          <div className="metric-value good">
            {metrics.renewablePercent.toFixed(1)}
            <span className="metric-unit">%</span>
          </div>
          <div className="metric-change positive">
            ↑ {metrics.renewableChange.toFixed(1)}% vs last month
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-icon">💰</span>
            <span className="metric-label">Cost Savings</span>
          </div>
          <div className="metric-value good">
            ₹{metrics.costSavings.toFixed(0)}
            <span className="metric-unit">/day</span>
          </div>
          <div className="metric-change positive">
            ↑ ₹{metrics.savingsIncrease.toFixed(0)} vs baseline
          </div>
        </div>
      </div>

      <div className="renewable-gauge">
        <svg className="gauge-svg" width="200" height="200">
          <defs>
            <linearGradient id="renewableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
          <circle
            className="gauge-bg"
            cx="100"
            cy="100"
            r="80"
          />
          <circle
            className="gauge-fill"
            cx="100"
            cy="100"
            r="80"
            strokeDasharray={circumference}
            strokeDashoffset={renewableOffset}
          />
        </svg>
        <div className="gauge-text">
          <div className="percentage">{metrics.renewablePercent.toFixed(0)}%</div>
          <div className="label">Renewable</div>
        </div>
      </div>

      <div className="progress-section">
        <h3>🎯 Net-Zero Progress</h3>
        <div className="progress-bar-container">
          <div className="progress-header">
            <span className="progress-label">2030 Target</span>
            <span className="progress-value">{metrics.netZeroProgress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${metrics.netZeroProgress}%` }}
            />
            <div className="progress-target" style={{ left: '80%' }} />
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-header">
            <span className="progress-label">Emission Reduction</span>
            <span className="progress-value">{metrics.emissionReduction.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${metrics.emissionReduction}%` }}
            />
            <div className="progress-target" style={{ left: '50%' }} />
          </div>
        </div>
      </div>

      <div className="emissions-breakdown">
        <div className="emission-item">
          <div className="value">{metrics.scope1.toFixed(1)}</div>
          <div className="label">Scope 1 (kg CO₂)</div>
        </div>
        <div className="emission-item">
          <div className="value">{metrics.scope2.toFixed(1)}</div>
          <div className="label">Scope 2 (kg CO₂)</div>
        </div>
        <div className="emission-item">
          <div className="value">{metrics.scope3.toFixed(1)}</div>
          <div className="label">Scope 3 (kg CO₂)</div>
        </div>
      </div>
    </div>
  );
}

export default SustainabilityMetrics;
