/**
 * Report Exporter Service
 * Handles PDF and CSV export of daily evaluation reports
 * 
 * Features:
 * - PDF Export: Generates formatted PDF with complete report including charts and visualizations
 * - CSV Export: Generates tabular data export with building metrics
 * - HTML Template: Creates styled HTML template for PDF rendering
 * - File Management: Stores exports in .kiro/reports/exports/ directory
 * - Error Handling: Gracefully handles missing reports and generation failures
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 * 
 * @module reportExporter
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import { getReport } from './reportStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export directory
const EXPORTS_DIR = path.join(__dirname, '../../.kiro/reports/exports');

/**
 * Ensure the exports directory exists
 * @returns {Promise<void>}
 */
async function ensureExportsDirectory() {
  try {
    await fs.access(EXPORTS_DIR);
  } catch (error) {
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
  }
}

/**
 * Get export file path
 * @param {string} reportId - Report ID
 * @param {"pdf"|"csv"} format - Export format
 * @returns {string} Full file path
 */
export function getExportPath(reportId, format) {
  return path.join(EXPORTS_DIR, `report-${reportId}.${format}`);
}

/**
 * Generate HTML template for PDF rendering
 * @param {import('./types.js').Report} report - Report data
 * @returns {string} HTML string
 */
function generateHTMLTemplate(report) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formatNumber = (num, decimals = 2) => {
    return typeof num === 'number' ? num.toFixed(decimals) : '0.00';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Evaluation Report - ${report.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #2c3e50;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      color: #7f8c8d;
      font-size: 16px;
    }
    
    .header .period {
      color: #34495e;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      color: #2c3e50;
      font-size: 24px;
      margin-bottom: 20px;
      border-left: 4px solid #3498db;
      padding-left: 15px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: #ecf0f1;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .summary-card .label {
      color: #7f8c8d;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .summary-card .value {
      color: #2c3e50;
      font-size: 28px;
      font-weight: bold;
    }
    
    .summary-card .unit {
      color: #95a5a6;
      font-size: 14px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #34495e;
      color: white;
      font-weight: 600;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-excellent {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-good {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    .status-needs_attention {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-critical {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .recommendation {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #3498db;
      border-radius: 4px;
    }
    
    .recommendation.priority-high {
      border-left-color: #e74c3c;
    }
    
    .recommendation.priority-medium {
      border-left-color: #f39c12;
    }
    
    .recommendation.priority-low {
      border-left-color: #95a5a6;
    }
    
    .recommendation-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    
    .recommendation-description {
      color: #555;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .recommendation-impact {
      color: #27ae60;
      font-size: 13px;
      font-style: italic;
    }
    
    .highlight {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 6px;
    }
    
    .highlight.achievement {
      background-color: #d4edda;
      color: #155724;
    }
    
    .highlight.concern {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .highlight.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    .highlight-icon {
      font-size: 20px;
      margin-right: 12px;
    }
    
    .trend {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .trend-up {
      background-color: #fee;
      color: #c33;
    }
    
    .trend-down {
      background-color: #efe;
      color: #3c3;
    }
    
    .trend-stable {
      background-color: #eef;
      color: #33c;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Daily Evaluation Report</h1>
    <div class="subtitle">Campus Building Monitoring System</div>
    <div class="period">
      Report Period: ${formatDate(report.period.start)} - ${formatDate(report.period.end)}
    </div>
    <div class="period">Generated: ${formatDate(report.generatedAt)}</div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Energy</div>
        <div class="value">${formatNumber(report.summary.totalEnergy)}</div>
        <div class="unit">kWh</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Wastage</div>
        <div class="value">${formatNumber(report.summary.totalWastage)}</div>
        <div class="unit">kWh</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Alerts</div>
        <div class="value">${report.summary.totalAlerts}</div>
        <div class="unit">alerts</div>
      </div>
      <div class="summary-card">
        <div class="label">Critical Issues</div>
        <div class="value">${report.summary.criticalIssues}</div>
        <div class="unit">issues</div>
      </div>
      <div class="summary-card">
        <div class="label">Sustainability Score</div>
        <div class="value">${formatNumber(report.summary.sustainabilityScore, 1)}</div>
        <div class="unit">/ 100</div>
      </div>
      <div class="summary-card">
        <div class="label">CO₂ Emissions</div>
        <div class="value">${formatNumber(report.sustainability.totalCO2)}</div>
        <div class="unit">kg</div>
      </div>
    </div>
    
    ${report.summary.keyHighlights && report.summary.keyHighlights.length > 0 ? `
    <h3 style="margin-top: 20px; margin-bottom: 10px; color: #34495e;">Key Highlights</h3>
    <ul style="list-style-position: inside; color: #555;">
      ${report.summary.keyHighlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
    ` : ''}
  </div>

  <!-- Building Performance -->
  <div class="section">
    <h2 class="section-title">Building Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Building</th>
          <th>Status</th>
          <th>Energy (kWh)</th>
          <th>Wastage (%)</th>
          <th>Avg Temp (°C)</th>
          <th>Occupancy (%)</th>
        </tr>
      </thead>
      <tbody>
        ${report.buildingDetails.map(building => `
        <tr>
          <td>${building.buildingName}</td>
          <td><span class="status-badge status-${building.status}">${building.status.replace('_', ' ')}</span></td>
          <td>${formatNumber(building.metrics.totalEnergy)}</td>
          <td>${formatNumber(building.metrics.wastagePercent)}</td>
          <td>${formatNumber(building.metrics.avgTemperature)}</td>
          <td>${formatNumber(building.metrics.avgOccupancy)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Alerts Summary -->
  <div class="section">
    <h2 class="section-title">Alerts Summary</h2>
    <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="summary-card">
        <div class="label">Total Alerts</div>
        <div class="value">${report.alertSummary.total}</div>
      </div>
      <div class="summary-card">
        <div class="label">Critical</div>
        <div class="value" style="color: #e74c3c;">${report.alertSummary.critical}</div>
      </div>
      <div class="summary-card">
        <div class="label">Warning</div>
        <div class="value" style="color: #f39c12;">${report.alertSummary.warning}</div>
      </div>
      <div class="summary-card">
        <div class="label">Avg Response Time</div>
        <div class="value">${formatNumber(report.alertSummary.avgResponseTime)}</div>
        <div class="unit">minutes</div>
      </div>
    </div>
  </div>

  <!-- Anomaly Insights -->
  ${report.anomalyInsights && report.anomalyInsights.totalDetected > 0 ? `
  <div class="section">
    <h2 class="section-title">Anomaly Insights</h2>
    <p style="margin-bottom: 15px; color: #555;">
      <strong>${report.anomalyInsights.totalDetected}</strong> anomalies detected during the reporting period.
    </p>
    ${report.anomalyInsights.criticalAnomalies && report.anomalyInsights.criticalAnomalies.length > 0 ? `
    <h3 style="margin-top: 20px; margin-bottom: 10px; color: #34495e;">Critical Anomalies</h3>
    <table>
      <thead>
        <tr>
          <th>Building</th>
          <th>Type</th>
          <th>Description</th>
          <th>Impact</th>
        </tr>
      </thead>
      <tbody>
        ${report.anomalyInsights.criticalAnomalies.map(anomaly => `
        <tr>
          <td>Building ${anomaly.buildingId}</td>
          <td>${anomaly.type}</td>
          <td>${anomaly.description}</td>
          <td>${anomaly.impact}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}
  </div>
  ` : ''}

  <!-- Trends -->
  ${report.trends && report.trends.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Trends</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Direction</th>
          <th>Change</th>
          <th>Significance</th>
        </tr>
      </thead>
      <tbody>
        ${report.trends.map(trend => `
        <tr>
          <td>${trend.metric}</td>
          <td><span class="trend trend-${trend.direction}">${trend.direction.toUpperCase()}</span></td>
          <td>${trend.percentChange > 0 ? '+' : ''}${formatNumber(trend.percentChange)}%</td>
          <td>${trend.significance}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Recommendations -->
  ${report.recommendations && report.recommendations.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Recommendations</h2>
    ${report.recommendations.map(rec => `
    <div class="recommendation priority-${rec.priority}">
      <div class="recommendation-title">
        [${rec.priority.toUpperCase()}] ${rec.title}
      </div>
      <div class="recommendation-description">${rec.description}</div>
      <div class="recommendation-impact">Expected Impact: ${rec.expectedImpact}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Sustainability Metrics -->
  <div class="section">
    <h2 class="section-title">Sustainability Metrics</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">CO₂ Emissions</div>
        <div class="value">${formatNumber(report.sustainability.totalCO2)}</div>
        <div class="unit">kg</div>
      </div>
      <div class="summary-card">
        <div class="label">Energy Intensity</div>
        <div class="value">${formatNumber(report.sustainability.energyIntensity)}</div>
        <div class="unit">kWh/m²</div>
      </div>
      <div class="summary-card">
        <div class="label">Renewable %</div>
        <div class="value">${formatNumber(report.sustainability.renewablePercent)}</div>
        <div class="unit">%</div>
      </div>
      <div class="summary-card">
        <div class="label">Cost Savings</div>
        <div class="value">${formatNumber(report.sustainability.costSavings)}</div>
        <div class="unit">₹</div>
      </div>
      <div class="summary-card">
        <div class="label">Net Zero Progress</div>
        <div class="value">${formatNumber(report.sustainability.netZeroProgress)}</div>
        <div class="unit">%</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Smart Campus Energy Monitoring System</p>
    <p>Report ID: ${report.id}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Export report to PDF
 * @param {string} reportId - Report ID
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function exportToPDF(reportId) {
  await ensureExportsDirectory();
  
  // Fetch the report
  const report = await getReport(reportId);
  if (!report) {
    throw new Error(`Report not found: ${reportId}`);
  }
  
  // Generate HTML template
  const html = generateHTMLTemplate(report);
  
  // Launch puppeteer and generate PDF
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    // Save to file
    const pdfPath = getExportPath(reportId, 'pdf');
    await fs.writeFile(pdfPath, pdfBuffer);
    
    return pdfBuffer;
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Export report to CSV
 * @param {string} reportId - Report ID
 * @returns {Promise<string>} CSV file path
 */
export async function exportToCSV(reportId) {
  await ensureExportsDirectory();
  
  // Fetch the report
  const report = await getReport(reportId);
  if (!report) {
    throw new Error(`Report not found: ${reportId}`);
  }
  
  const csvPath = getExportPath(reportId, 'csv');
  
  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'buildingId', title: 'Building ID' },
      { id: 'buildingName', title: 'Building Name' },
      { id: 'status', title: 'Status' },
      { id: 'totalEnergy', title: 'Total Energy (kWh)' },
      { id: 'avgPower', title: 'Avg Power (kW)' },
      { id: 'peakPower', title: 'Peak Power (kW)' },
      { id: 'avgOccupancy', title: 'Avg Occupancy (%)' },
      { id: 'avgTemperature', title: 'Avg Temperature (°C)' },
      { id: 'totalWastage', title: 'Total Wastage (kWh)' },
      { id: 'wastagePercent', title: 'Wastage (%)' }
    ]
  });
  
  // Prepare data rows
  const records = report.buildingDetails.map(building => ({
    buildingId: building.buildingId,
    buildingName: building.buildingName,
    status: building.status,
    totalEnergy: building.metrics.totalEnergy.toFixed(2),
    avgPower: building.metrics.avgPower.toFixed(2),
    peakPower: building.metrics.peakPower.toFixed(2),
    avgOccupancy: building.metrics.avgOccupancy.toFixed(2),
    avgTemperature: building.metrics.avgTemperature.toFixed(2),
    totalWastage: building.metrics.totalWastage.toFixed(2),
    wastagePercent: building.metrics.wastagePercent.toFixed(2)
  }));
  
  // Write CSV file
  await csvWriter.writeRecords(records);
  
  return csvPath;
}
