import React, { useState } from 'react';
import './ReportGenerator.css';

const BUILDINGS = [
  { id: 'all', name: 'All Buildings' },
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Science Lab' },
  { id: '3', name: 'Library' },
  { id: '4', name: 'Dorm A' },
  { id: '5', name: 'Dorm B' },
  { id: '6', name: 'Sports Center' },
  { id: '7', name: 'Admin' },
];

const REPORT_TYPES = [
  { id: 'energy', label: '⚡ Energy Consumption', desc: 'Power usage, baselines, wastage by building' },
  { id: 'sustainability', label: '🌱 Sustainability', desc: 'CO₂ emissions, renewables, net-zero progress' },
  { id: 'alerts', label: '🚨 Alerts & Anomalies', desc: 'All detected faults and anomaly events' },
  { id: 'full', label: '📋 Full Campus Report', desc: 'Complete report covering all sections + AI summary' },
];

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('full');
  const [building, setBuilding] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [includeAI, setIncludeAI] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');

  async function fetchReportData() {
    const buildingIds = building === 'all' ? ['1','2','3','4','5','6','7'] : [building];

    // Fetch analytics for each building
    const analyticsPromises = buildingIds.map(id =>
      fetch(`http://localhost:8080/api/analytics/${id}?range=${timeRange}`)
        .then(r => r.json())
        .then(d => ({ buildingId: id, buildingName: BUILDINGS.find(b => b.id === id)?.name, ...d }))
    );

    const [analyticsResults, sustainData, alertsData] = await Promise.all([
      Promise.all(analyticsPromises),
      fetch('http://localhost:8080/api/sustainability').then(r => r.json()),
      fetch('http://localhost:8080/api/alerts').then(r => r.json()),
    ]);

    return { analytics: analyticsResults, sustainability: sustainData, alerts: alertsData };
  }

  async function fetchAISummary(data) {
    const topWastage = [...data.analytics]
      .sort((a, b) => b.wastagePercent - a.wastagePercent)
      .slice(0, 3)
      .map(b => `${b.buildingName}: ${b.wastagePercent?.toFixed(1)}% wastage`)
      .join(', ');

    const prompt = `Generate a professional energy management report executive summary for a university campus.

Data snapshot:
- Report period: ${timeRange === '24h' ? 'Last 24 hours' : 'Last 7 days'}
- Buildings analysed: ${data.analytics.length}
- Total CO₂ emissions: ${data.sustainability.co2Emissions?.toFixed(1)} kg
- Renewable energy usage: ${data.sustainability.renewablePercent?.toFixed(1)}%
- Net-zero progress: ${data.sustainability.netZeroProgress?.toFixed(1)}%
- Cost savings today: ₹${data.sustainability.costSavings?.toFixed(0)}
- Top wastage buildings: ${topWastage}
- Active alerts: ${data.alerts.filter(a => !a.acknowledged).length} unacknowledged

Write a concise 3-paragraph executive summary covering: (1) overall performance, (2) key concerns, (3) recommended next actions. Use a formal report tone.`;

    const res = await fetch('http://localhost:8080/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });
    const json = await res.json();
    return json.reply || null;
  }

  async function generateReport() {
    setGenerating(true);
    setError(null);
    setReportData(null);

    try {
      const raw = await fetchReportData();
      let aiSummary = null;

      if (includeAI && (reportType === 'full' || reportType === 'energy')) {
        try { aiSummary = await fetchAISummary(raw); } catch (_) {}
      }

      const generated = {
        meta: {
          generatedAt: new Date().toLocaleString(),
          reportType,
          building: BUILDINGS.find(b => b.id === building)?.name,
          timeRange,
          period: timeRange === '24h' ? 'Last 24 hours' : 'Last 7 days',
        },
        aiSummary,
        analytics: raw.analytics,
        sustainability: raw.sustainability,
        alerts: raw.alerts,
      };

      setReportData(generated);
      setActiveTab('preview');
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  }

  function downloadCSV() {
    if (!reportData) return;

    const rows = [
      ['Building', 'Total Wastage (kWh)', 'Wastage %', 'Cost Impact (₹)', 'AI Powered'],
      ...reportData.analytics.map(b => [
        b.buildingName,
        b.totalWastage?.toFixed(2),
        b.wastagePercent?.toFixed(2),
        b.costImpact?.toFixed(2),
        b.aiPowered ? 'Yes' : 'No',
      ]),
      [],
      ['Sustainability Metrics', ''],
      ['CO₂ Emissions (kg)', reportData.sustainability.co2Emissions?.toFixed(1)],
      ['Renewable Energy (%)', reportData.sustainability.renewablePercent?.toFixed(1)],
      ['Net-Zero Progress (%)', reportData.sustainability.netZeroProgress?.toFixed(1)],
      ['Cost Savings (₹/day)', reportData.sustainability.costSavings?.toFixed(0)],
      ['Energy Intensity (kWh/m²)', reportData.sustainability.energyIntensity?.toFixed(2)],
      [],
      ['Alert Summary', ''],
      ['Total Alerts', reportData.alerts.length],
      ['Unacknowledged', reportData.alerts.filter(a => !a.acknowledged).length],
      ['Critical', reportData.alerts.filter(a => a.severity === 'critical').length],
      ['Warning', reportData.alerts.filter(a => a.severity === 'warning').length],
    ];

    if (reportData.aiSummary) {
      rows.push([], ['AI Executive Summary', ''], [reportData.aiSummary]);
    }

    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecopulse-report-${reportData.meta.generatedAt.replace(/[/: ,]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecopulse-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  const criticalAlerts = reportData?.alerts?.filter(a => a.severity === 'critical') ?? [];
  const warningAlerts = reportData?.alerts?.filter(a => a.severity === 'warning') ?? [];

  return (
    <div className="report-generator">
      {/* Config Panel */}
      <div className="report-config">
        <div className="report-config-header">
          <h2>📄 Report Generator</h2>
          <p>Configure and generate detailed energy reports for your campus</p>
        </div>

        <div className="config-grid">
          {/* Report Type */}
          <div className="config-section">
            <label className="config-label">Report Type</label>
            <div className="report-type-grid">
              {REPORT_TYPES.map(rt => (
                <button
                  key={rt.id}
                  className={`report-type-card ${reportType === rt.id ? 'active' : ''}`}
                  onClick={() => setReportType(rt.id)}
                >
                  <span className="rt-label">{rt.label}</span>
                  <span className="rt-desc">{rt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="config-row">
            <div className="config-field">
              <label className="config-label">Building</label>
              <select
                className="config-select"
                value={building}
                onChange={e => setBuilding(e.target.value)}
              >
                {BUILDINGS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="config-field">
              <label className="config-label">Time Range</label>
              <select
                className="config-select"
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>

            <div className="config-field ai-toggle-field">
              <label className="config-label">AI Summary</label>
              <button
                className={`toggle-btn ${includeAI ? 'on' : 'off'}`}
                onClick={() => setIncludeAI(v => !v)}
              >
                <span className="toggle-knob" />
                <span className="toggle-label">{includeAI ? 'Enabled' : 'Disabled'}</span>
              </button>
              <span className="ai-note">Powered by Featherless.ai</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className={`generate-btn ${generating ? 'loading' : ''}`}
            onClick={generateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" /> Generating Report...
              </>
            ) : (
              <>📊 Generate Report</>
            )}
          </button>

          {error && <div className="report-error">⚠️ {error}</div>}
        </div>
      </div>

      {/* Report Output */}
      {reportData && (
        <div className="report-output" id="report-printable">
          {/* Toolbar */}
          <div className="report-toolbar">
            <div className="report-tabs">
              <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => setActiveTab('preview')}>
                👁 Preview
              </button>
              <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
                🚨 Alerts ({reportData.alerts.length})
              </button>
              <button className={activeTab === 'raw' ? 'active' : ''} onClick={() => setActiveTab('raw')}>
                { } Raw Data
              </button>
            </div>
            <div className="report-actions">
              <button className="action-btn csv" onClick={downloadCSV}>⬇ CSV</button>
              <button className="action-btn json" onClick={downloadJSON}>⬇ JSON</button>
              <button className="action-btn print" onClick={printReport}>🖨 Print</button>
            </div>
          </div>

          {/* ── PREVIEW TAB ── */}
          {activeTab === 'preview' && (
            <div className="report-preview">
              {/* Header */}
              <div className="rpt-header">
                <div className="rpt-title-block">
                  <div className="rpt-logo">⚡</div>
                  <div>
                    <h1>Smart Campus Energy Report</h1>
                    <p>{reportData.meta.building} · {reportData.meta.period}</p>
                  </div>
                </div>
                <div className="rpt-meta">
                  <span>Generated: {reportData.meta.generatedAt}</span>
                  <span className="rpt-badge">
                    {REPORT_TYPES.find(r => r.id === reportData.meta.reportType)?.label}
                  </span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="kpi-strip">
                <div className="kpi-card">
                  <div className="kpi-icon">☁️</div>
                  <div className="kpi-value">{reportData.sustainability.co2Emissions?.toFixed(1)}<span>kg CO₂</span></div>
                  <div className="kpi-label">Total Emissions</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon">🌿</div>
                  <div className="kpi-value">{reportData.sustainability.renewablePercent?.toFixed(1)}<span>%</span></div>
                  <div className="kpi-label">Renewable Energy</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon">💰</div>
                  <div className="kpi-value">₹{reportData.sustainability.costSavings?.toFixed(0)}<span>/day</span></div>
                  <div className="kpi-label">Cost Savings</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon">🎯</div>
                  <div className="kpi-value">{reportData.sustainability.netZeroProgress?.toFixed(1)}<span>%</span></div>
                  <div className="kpi-label">Net-Zero Progress</div>
                </div>
                <div className="kpi-card alert-kpi">
                  <div className="kpi-icon">🚨</div>
                  <div className="kpi-value">{criticalAlerts.length}<span>critical</span></div>
                  <div className="kpi-label">Active Alerts</div>
                </div>
              </div>

              {/* AI Executive Summary */}
              {reportData.aiSummary && (
                <div className="ai-summary-section">
                  <h3>🤖 AI Executive Summary <span className="ai-badge">Featherless.ai · {reportData.analytics[0]?.aiPowered ? 'Qwen3' : 'Fallback'}</span></h3>
                  <div className="ai-summary-text">
                    {reportData.aiSummary.split('\n').map((para, i) =>
                      para.trim() ? <p key={i}>{para}</p> : null
                    )}
                  </div>
                </div>
              )}

              {/* Per-Building Table */}
              {(reportType === 'energy' || reportType === 'full') && (
                <div className="rpt-section">
                  <h3>⚡ Building Energy Breakdown</h3>
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        <th>Building</th>
                        <th>Wastage (kWh)</th>
                        <th>Wastage %</th>
                        <th>Cost Impact</th>
                        <th>Top Insight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.analytics.map(b => (
                        <tr key={b.buildingId} className={b.wastagePercent > 10 ? 'row-warning' : ''}>
                          <td className="building-name-cell">{b.buildingName}</td>
                          <td>{b.totalWastage?.toFixed(1)}</td>
                          <td>
                            <span className={`badge ${b.wastagePercent > 15 ? 'badge-critical' : b.wastagePercent > 5 ? 'badge-warning' : 'badge-ok'}`}>
                              {b.wastagePercent?.toFixed(1)}%
                            </span>
                          </td>
                          <td>₹{b.costImpact?.toFixed(0)}</td>
                          <td className="insight-cell">
                            {b.insights?.[0] ? `${b.insights[0].icon} ${b.insights[0].message}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sustainability Section */}
              {(reportType === 'sustainability' || reportType === 'full') && (
                <div className="rpt-section">
                  <h3>🌱 Sustainability Metrics</h3>
                  <div className="sustain-grid">
                    <div className="sustain-card">
                      <div className="sc-label">Scope 1 Emissions</div>
                      <div className="sc-value">{reportData.sustainability.scope1?.toFixed(1)} kg CO₂</div>
                      <div className="sc-sub">Direct combustion</div>
                    </div>
                    <div className="sustain-card">
                      <div className="sc-label">Scope 2 Emissions</div>
                      <div className="sc-value">{reportData.sustainability.scope2?.toFixed(1)} kg CO₂</div>
                      <div className="sc-sub">Purchased electricity</div>
                    </div>
                    <div className="sustain-card">
                      <div className="sc-label">Scope 3 Emissions</div>
                      <div className="sc-value">{reportData.sustainability.scope3?.toFixed(1)} kg CO₂</div>
                      <div className="sc-sub">Indirect value chain</div>
                    </div>
                    <div className="sustain-card">
                      <div className="sc-label">Energy Intensity</div>
                      <div className="sc-value">{reportData.sustainability.energyIntensity?.toFixed(2)} kWh/m²</div>
                      <div className="sc-sub">Per floor area</div>
                    </div>
                  </div>

                  <div className="progress-rows">
                    <div className="prog-row">
                      <div className="prog-meta">
                        <span>Net-Zero 2030 Target</span>
                        <span>{reportData.sustainability.netZeroProgress?.toFixed(1)}%</span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill green" style={{ width: `${reportData.sustainability.netZeroProgress}%` }} />
                      </div>
                    </div>
                    <div className="prog-row">
                      <div className="prog-meta">
                        <span>Emission Reduction</span>
                        <span>{reportData.sustainability.emissionReduction?.toFixed(1)}%</span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill blue" style={{ width: `${reportData.sustainability.emissionReduction}%` }} />
                      </div>
                    </div>
                    <div className="prog-row">
                      <div className="prog-meta">
                        <span>Renewable Mix</span>
                        <span>{reportData.sustainability.renewablePercent?.toFixed(1)}%</span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill teal" style={{ width: `${reportData.sustainability.renewablePercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alert Summary */}
              {(reportType === 'alerts' || reportType === 'full') && (
                <div className="rpt-section">
                  <h3>🚨 Alert Summary</h3>
                  <div className="alert-summary-row">
                    <div className="as-card critical">
                      <div className="as-num">{criticalAlerts.length}</div>
                      <div className="as-lbl">Critical</div>
                    </div>
                    <div className="as-card warning">
                      <div className="as-num">{warningAlerts.length}</div>
                      <div className="as-lbl">Warning</div>
                    </div>
                    <div className="as-card info">
                      <div className="as-num">{reportData.alerts.filter(a => !a.acknowledged).length}</div>
                      <div className="as-lbl">Unacknowledged</div>
                    </div>
                    <div className="as-card ok">
                      <div className="as-num">{reportData.alerts.filter(a => a.acknowledged).length}</div>
                      <div className="as-lbl">Resolved</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rpt-footer">
                EcoPulse Smart Campus Energy · Report generated {reportData.meta.generatedAt} · Powered by Featherless.ai
              </div>
            </div>
          )}

          {/* ── ALERTS TAB ── */}
          {activeTab === 'alerts' && (
            <div className="alerts-tab">
              <h3>All Alerts ({reportData.alerts.length})</h3>
              {reportData.alerts.length === 0 ? (
                <p className="no-data">No alerts in the selected period.</p>
              ) : (
                <table className="rpt-table">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>AI Detected</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.alerts.map(a => (
                      <tr key={a.id}>
                        <td>
                          <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                        </td>
                        <td>{a.icon} {a.title}</td>
                        <td>{a.location}</td>
                        <td className="desc-cell">{a.description}</td>
                        <td>{a.mlDetected ? '🤖 Yes' : '—'}</td>
                        <td>
                          <span className={`badge ${a.acknowledged ? 'badge-ok' : 'badge-warning'}`}>
                            {a.acknowledged ? 'Resolved' : 'Open'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── RAW DATA TAB ── */}
          {activeTab === 'raw' && (
            <div className="raw-tab">
              <h3>Raw Report Data (JSON)</h3>
              <pre className="raw-json">{JSON.stringify(reportData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
