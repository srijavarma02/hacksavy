import React, { useState, useEffect } from 'react';
import './MLModelStatus.css';

function MLModelStatus() {
  const [modelStatus, setModelStatus] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMLData();
    const interval = setInterval(fetchMLData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedBuilding]);

  const fetchMLData = async () => {
    try {
      // Fetch model status
      const statusRes = await fetch('http://localhost:3001/api/ml/status');
      const statusData = await statusRes.json();
      setModelStatus(statusData);

      // Fetch predictions
      const predRes = await fetch(`http://localhost:3001/api/ml/predict/${selectedBuilding}`);
      const predData = await predRes.json();
      setPredictions(predData);

      // Fetch anomalies
      const anomRes = await fetch('http://localhost:3001/api/ml/anomalies');
      const anomData = await anomRes.json();
      setAnomalies(anomData.anomalies);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching ML data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="ml-status-loading">Loading ML models...</div>;
  }

  return (
    <div className="ml-model-status">
      <div className="ml-header">
        <h2>🤖 Machine Learning Models</h2>
        <div className="model-badges">
          <span className={`badge ${modelStatus?.trained ? 'active' : 'inactive'}`}>
            {modelStatus?.trained ? '✓ Models Trained' : '⏳ Training...'}
          </span>
          <span className="badge info">
            {modelStatus?.dataPoints || 0} Data Points
          </span>
        </div>
      </div>

      <div className="ml-grid">
        {/* Model Status Card */}
        <div className="ml-card">
          <h3>📊 Model Status</h3>
          <div className="model-info">
            <div className="model-item">
              <span className="model-name">Isolation Forest</span>
              <span className={`status ${modelStatus?.isolationForest?.trained ? 'trained' : 'pending'}`}>
                {modelStatus?.isolationForest?.trained ? 'Trained' : 'Pending'}
              </span>
              <span className="model-detail">
                {modelStatus?.isolationForest?.trees || 0} trees
              </span>
            </div>
            <div className="model-item">
              <span className="model-name">Random Forest</span>
              <span className={`status ${modelStatus?.randomForest?.available ? 'trained' : 'pending'}`}>
                {modelStatus?.randomForest?.available ? 'Trained' : 'Pending'}
              </span>
              <span className="model-detail">
                {modelStatus?.randomForest?.estimators || 0} estimators
              </span>
            </div>
          </div>
          <div className="training-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, (modelStatus?.dataPoints / 200) * 100)}%` }}
              />
            </div>
            <span className="progress-text">
              {modelStatus?.dataPoints >= 200 ? 'Fully Trained' : `${modelStatus?.dataPoints}/200 for full training`}
            </span>
          </div>
        </div>

        {/* Predictions Card */}
        <div className="ml-card">
          <h3>🔮 Power Predictions</h3>
          <div className="building-selector">
            <select 
              value={selectedBuilding} 
              onChange={(e) => setSelectedBuilding(Number(e.target.value))}
            >
              <option value={1}>Engineering</option>
              <option value={2}>Science Lab</option>
              <option value={3}>Library</option>
              <option value={4}>Dorm A</option>
              <option value={5}>Dorm B</option>
              <option value={6}>Sports Center</option>
              <option value={7}>Admin</option>
            </select>
          </div>
          {predictions && (
            <div className="prediction-info">
              <div className="prediction-item highlight">
                <span className="label">Next Hour Prediction</span>
                <span className="value">{predictions.nextHour?.toFixed(1)} kW</span>
              </div>
              <div className="prediction-chart">
                <h4>24-Hour Forecast</h4>
                <div className="mini-chart">
                  {predictions.predictions24h?.slice(0, 12).map((pred, idx) => (
                    <div key={idx} className="chart-bar">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${(pred.predicted / 200) * 100}%` }}
                        title={`${pred.hour}:00 - ${pred.predicted.toFixed(1)}kW`}
                      />
                      <span className="bar-label">{pred.hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Anomalies Card */}
        <div className="ml-card anomalies-card">
          <h3>⚠️ Detected Anomalies</h3>
          {anomalies.length === 0 ? (
            <div className="no-anomalies">
              <span className="success-icon">✓</span>
              <p>No anomalies detected</p>
              <span className="subtitle">All buildings operating normally</span>
            </div>
          ) : (
            <div className="anomalies-list">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className={`anomaly-item ${anomaly.severity}`}>
                  <div className="anomaly-header">
                    <span className="building-name">{anomaly.buildingName}</span>
                    <span className={`severity-badge ${anomaly.severity}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <div className="anomaly-details">
                    <div className="detail-row">
                      <span>Current:</span>
                      <span className="value">{anomaly.current.toFixed(1)} kW</span>
                    </div>
                    <div className="detail-row">
                      <span>Expected:</span>
                      <span className="value">{anomaly.predicted.toFixed(1)} kW</span>
                    </div>
                    <div className="detail-row">
                      <span>Deviation:</span>
                      <span className="value warning">{anomaly.deviation.toFixed(1)} kW</span>
                    </div>
                    <div className="detail-row">
                      <span>Anomaly Score:</span>
                      <span className="value">{anomaly.score.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="anomaly-method">
                    Detected by: {anomaly.method || 'Isolation Forest'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ml-info-footer">
        <div className="info-item">
          <span className="icon">🌲</span>
          <div>
            <strong>Isolation Forest</strong>
            <p>Detects anomalies by isolating outliers in energy consumption patterns</p>
          </div>
        </div>
        <div className="info-item">
          <span className="icon">🎯</span>
          <div>
            <strong>Random Forest</strong>
            <p>Predicts future power consumption based on historical patterns and features</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MLModelStatus;
