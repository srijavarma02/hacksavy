import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import './HistoricalAnalytics.css';

function HistoricalAnalytics({ building, timeRange = '24h' }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [viewMode, setViewMode] = useState('trend'); // trend, heatmap, comparison
  const [monitoringConfig, setMonitoringConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
    fetchMonitoringConfig();
  }, [building, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/analytics/${building?.id || 'campus'}?range=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.message);
    }
  };

  const fetchMonitoringConfig = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/monitoring/config');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Monitoring config received:', data);
      setMonitoringConfig(data);
    } catch (error) {
      console.error('Failed to fetch monitoring config:', error);
    }
  };

  if (error) {
    return (
      <div className="historical-analytics">
        <div className="error-message">
          <h3>⚠️ Error Loading Analytics</h3>
          <p>{error}</p>
          <p>Make sure the server is running on port 8080</p>
          <button onClick={fetchAnalyticsData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!analyticsData) return <div className="loading">Loading analytics...</div>;
  
  // Safety check for data structure
  if (!analyticsData.trendData || !analyticsData.insights) {
    console.error('Invalid analytics data:', analyticsData);
    return (
      <div className="historical-analytics">
        <div className="error-message">
          <h3>⚠️ Invalid Data Structure</h3>
          <p>Analytics data is missing required fields</p>
          <button onClick={fetchAnalyticsData}>Retry</button>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} {entry.unit || 'kWh'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="historical-analytics">
      <div className="analytics-header">
        <h2>📊 Historical Analytics</h2>
        <div className="view-controls">
          <button 
            className={viewMode === 'trend' ? 'active' : ''} 
            onClick={() => setViewMode('trend')}
          >
            Trends
          </button>
          <button 
            className={viewMode === 'heatmap' ? 'active' : ''} 
            onClick={() => setViewMode('heatmap')}
          >
            Heatmap
          </button>
          <button 
            className={viewMode === 'comparison' ? 'active' : ''} 
            onClick={() => setViewMode('comparison')}
          >
            Baseline
          </button>
        </div>
      </div>

      {viewMode === 'trend' && (
        <div className="chart-section">
          <h3>Energy Consumption Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.trendData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
              <XAxis dataKey="time" stroke="#8892b0" />
              <YAxis stroke="#8892b0" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Threshold Lines */}
              {monitoringConfig && (
                <>
                  <ReferenceLine 
                    y={monitoringConfig.thresholds.morning.warning} 
                    stroke="#FDB813" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: 'Morning Warning', position: 'insideTopRight', fill: '#FDB813', fontSize: 12 }}
                  />
                  <ReferenceLine 
                    y={monitoringConfig.thresholds.morning.critical} 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: 'Morning Critical', position: 'insideTopRight', fill: '#EF4444', fontSize: 12 }}
                  />
                  <ReferenceLine 
                    y={monitoringConfig.thresholds.night.warning} 
                    stroke="#60A5FA" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: 'Night Warning', position: 'insideBottomRight', fill: '#60A5FA', fontSize: 12 }}
                  />
                  <ReferenceLine 
                    y={monitoringConfig.thresholds.night.critical} 
                    stroke="#991B1B" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: 'Night Critical', position: 'insideBottomRight', fill: '#991B1B', fontSize: 12 }}
                  />
                </>
              )}
              
              <Area 
                type="monotone" 
                dataKey="consumption" 
                stroke="#00d4ff" 
                fillOpacity={1} 
                fill="url(#colorActual)" 
                name="Consumption"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === 'heatmap' && (
        <div className="chart-section">
          <h3>Consumption Heatmap (Hourly)</h3>
          {analyticsData.heatmapData && analyticsData.heatmapData.length > 0 ? (
            <div className="heatmap-grid">
              {analyticsData.heatmapData.map((day, dayIndex) => (
                <div key={dayIndex} className="heatmap-row">
                  <span className="day-label">{day.day}</span>
                  {day.hours.map((hour, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="heatmap-cell"
                      style={{
                        backgroundColor: `rgba(0, 212, 255, ${hour.intensity})`,
                        opacity: hour.intensity
                      }}
                      title={`${hour.value.toFixed(1)} kWh`}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="loading">No heatmap data available</div>
          )}
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="chart-section">
          <h3>Baseline vs Actual Comparison</h3>
          {analyticsData.comparisonData && analyticsData.comparisonData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
                  <XAxis dataKey="time" stroke="#8892b0" />
                  <YAxis stroke="#8892b0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#8892b0" 
                    strokeDasharray="5 5"
                    name="Baseline"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    name="Actual"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wastage" 
                    stroke="#ff6b6b" 
                    strokeWidth={2}
                    name="Wastage"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="wastage-summary">
                <div className="wastage-stat">
                  <span className="stat-label">Total Wastage</span>
                  <span className="stat-value critical">{analyticsData.totalWastage.toFixed(1)} kWh</span>
                </div>
                <div className="wastage-stat">
                  <span className="stat-label">Wastage %</span>
                  <span className="stat-value warning">{analyticsData.wastagePercent.toFixed(1)}%</span>
                </div>
                <div className="wastage-stat">
                  <span className="stat-label">Cost Impact</span>
                  <span className="stat-value">₹{analyticsData.costImpact.toFixed(0)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="loading">No comparison data available</div>
          )}
        </div>
      )}

      <div className="analytics-insights">
        <h3>🔍 Key Insights</h3>
        <div className="insights-grid">
          {analyticsData.insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <span className="insight-icon">{insight.icon}</span>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoricalAnalytics;
