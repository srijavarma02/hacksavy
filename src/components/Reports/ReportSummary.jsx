import './ReportSummary.css';

function ReportSummary({ summary }) {
  if (!summary) {
    return (
      <div className="report-summary">
        <div className="loading">Loading summary...</div>
      </div>
    );
  }

  const {
    totalEnergy = 0,
    totalWastage = 0,
    totalAlerts = 0,
    criticalIssues = 0,
    sustainabilityScore = 0,
    keyHighlights = []
  } = summary;

  // Calculate wastage percentage
  const wastagePercent = totalEnergy > 0 ? (totalWastage / totalEnergy) * 100 : 0;

  // Determine sustainability score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'warning';
    return 'critical';
  };

  return (
    <div className="report-summary">
      <div className="summary-header">
        <h2>📋 Report Summary</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <span className="metric-label">Total Energy</span>
            <span className="metric-value">{totalEnergy.toFixed(1)} kWh</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">♻️</div>
          <div className="metric-content">
            <span className="metric-label">Sustainability Score</span>
            <span className={`metric-value ${getScoreColor(sustainabilityScore)}`}>
              {sustainabilityScore.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <span className="metric-label">Total Alerts</span>
            <span className="metric-value">{totalAlerts}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔴</div>
          <div className="metric-content">
            <span className="metric-label">Critical Issues</span>
            <span className="metric-value critical">{criticalIssues}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💧</div>
          <div className="metric-content">
            <span className="metric-label">Energy Wastage</span>
            <span className="metric-value warning">{totalWastage.toFixed(1)} kWh</span>
            <span className="metric-subtext">({wastagePercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {keyHighlights && keyHighlights.length > 0 && (
        <div className="highlights-section">
          <h3>✨ Key Highlights</h3>
          <div className="highlights-list">
            {keyHighlights.map((highlight, index) => (
              <div key={index} className="highlight-item">
                <span className="highlight-bullet">•</span>
                <span className="highlight-text">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportSummary;
