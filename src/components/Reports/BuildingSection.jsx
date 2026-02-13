import './BuildingSection.css';

function BuildingSection({ buildingDetails }) {
  if (!buildingDetails || buildingDetails.length === 0) {
    return (
      <div className="building-section">
        <h3>🏢 Building Performance</h3>
        <div className="no-data">No building data available</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#00ff88';
      case 'good':
        return '#00d4ff';
      case 'needs_attention':
        return '#ffa500';
      case 'critical':
        return '#ff6b6b';
      default:
        return '#8892b0';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return '✨';
      case 'good':
        return '✓';
      case 'needs_attention':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '•';
    }
  };

  return (
    <div className="building-section">
      <h3>🏢 Building Performance</h3>
      
      <div className="buildings-grid">
        {buildingDetails.map((building) => (
          <div key={building.buildingId} className="building-card">
            <div className="building-header">
              <div className="building-name">
                <h4>{building.buildingName}</h4>
                <span 
                  className="building-status"
                  style={{ 
                    color: getStatusColor(building.status),
                    borderColor: getStatusColor(building.status)
                  }}
                >
                  {getStatusIcon(building.status)} {building.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="building-metrics">
              <div className="metric-row">
                <span className="metric-label">Total Energy</span>
                <span className="metric-value">{building.metrics.totalEnergy.toFixed(1)} kWh</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Avg Power</span>
                <span className="metric-value">{building.metrics.avgPower.toFixed(1)} kW</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Peak Power</span>
                <span className="metric-value">{building.metrics.peakPower.toFixed(1)} kW</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Avg Occupancy</span>
                <span className="metric-value">{building.metrics.avgOccupancy.toFixed(0)}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Avg Temperature</span>
                <span className="metric-value">{building.metrics.avgTemperature.toFixed(1)}°C</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Wastage</span>
                <span className="metric-value critical">
                  {building.metrics.totalWastage.toFixed(1)} kWh ({building.metrics.wastagePercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            {building.issues && building.issues.length > 0 && (
              <div className="building-issues">
                <h5>⚠️ Issues</h5>
                <ul>
                  {building.issues.map((issue, index) => (
                    <li key={index} className="issue-item">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {building.achievements && building.achievements.length > 0 && (
              <div className="building-achievements">
                <h5>✨ Achievements</h5>
                <ul>
                  {building.achievements.map((achievement, index) => (
                    <li key={index} className="achievement-item">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuildingSection;
