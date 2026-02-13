// Load environment variables FIRST
import './loadEnv.js';

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { format, subHours, subDays } from 'date-fns';
import mlService from './mlService.js';
import notificationService from './notificationService.js';
import advancedMonitoringService from './advancedMonitoringService.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const buildings = [
  { id: 1, name: 'Engineering', x: 100, y: 100, width: 120, height: 80, baseline: 120 },
  { id: 2, name: 'Science Lab', x: 280, y: 120, width: 100, height: 100, baseline: 110 },
  { id: 3, name: 'Library', x: 450, y: 80, width: 140, height: 90, baseline: 90 },
  { id: 4, name: 'Dorm A', x: 120, y: 280, width: 90, height: 120, baseline: 80 },
  { id: 5, name: 'Dorm B', x: 260, y: 300, width: 90, height: 120, baseline: 85 },
  { id: 6, name: 'Sports Center', x: 420, y: 250, width: 160, height: 100, baseline: 150 },
  { id: 7, name: 'Admin', x: 640, y: 150, width: 100, height: 80, baseline: 70 }
];

let alertsDatabase = [];
let historicalData = [];

// Generate historical data for analytics
function generateHistoricalData(hours = 24) {
  const data = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = format(subHours(now, i), 'HH:mm');
    const baseConsumption = 500 + Math.sin(i / 4) * 100;
    const noise = (Math.random() - 0.5) * 50;
    
    data.push({
      time,
      consumption: baseConsumption + noise,
      baseline: baseConsumption,
      wastage: Math.max(0, noise)
    });
  }
  
  return data;
}

// Generate heatmap data
function generateHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    hours: Array.from({ length: 24 }, (_, hour) => {
      const baseIntensity = hour >= 8 && hour <= 18 ? 0.7 : 0.3;
      const value = 50 + baseIntensity * 100 + Math.random() * 30;
      return {
        hour,
        value,
        intensity: baseIntensity + Math.random() * 0.3
      };
    })
  }));
}

function generateMockData() {
  const buildingsData = buildings.map(b => {
    const power = b.baseline + (Math.random() - 0.3) * 50;
    const occupancy = Math.floor(40 + Math.random() * 60);
    const temperature = 22 + Math.random() * 4;
    
    const buildingData = { power, occupancy, temperature, energy: power * 0.8, water: 130, gas: 3.5 };
    
    // Add to training data
    mlService.addTrainingData(buildingData);
    
    // Record power reading for surge detection
    const surgeCheck = advancedMonitoringService.recordPowerReading(b.id, power);
    
    // ML anomaly detection using Isolation Forest
    const anomaly = mlService.detectAnomaly(buildingData);
    
    // HVAC fault detection
    const hvacFault = mlService.detectHVACFault(buildingData);
    
    // Wastage calculation
    const predicted = mlService.predictPowerConsumption(buildingData);
    const wastagePercent = Math.max(0, ((power - b.baseline) / b.baseline) * 100);
    
    // Check if notification should be sent
    const wastageCheck = notificationService.checkWastageThreshold(b.id, power, b.baseline);
    
    let status = 'normal';
    
    // Check for sustained surge (only alert after 3 minutes and only for CRITICAL)
    if (surgeCheck.surge && surgeCheck.shouldAlert && surgeCheck.severity === 'critical') {
      status = surgeCheck.severity;
      
      // Send SMS for sustained critical surge
      if (Math.random() > 0.7) {
        notificationService.sendSMS(b.id, {
          buildingName: b.name,
          wastagePercent: ((power - b.baseline) / b.baseline * 100),
          actualKwh: power,
          baselineKwh: b.baseline,
          severity: surgeCheck.severity
        });
      }
    } else if (surgeCheck.surge) {
      // Show warning status but don't send SMS
      status = surgeCheck.severity;
    } else if (anomaly.isAnomaly || wastageCheck.shouldNotify) {
      status = anomaly.severity === 'critical' || wastageCheck.severity === 'critical' ? 'critical' : 'warning';
      
      // Only send notification for critical wastage
      if (wastageCheck.shouldNotify && wastageCheck.severity === 'critical' && Math.random() > 0.7) {
        notificationService.sendSMS(b.id, {
          buildingName: b.name,
          wastagePercent: wastageCheck.wastagePercent,
          actualKwh: power,
          baselineKwh: b.baseline,
          severity: wastageCheck.severity
        });
      }
    }
    
    // Send HVAC alert if fault detected
    if (hvacFault.detected && Math.random() > 0.8) {
      notificationService.sendHVACAlert(b.id, {
        buildingName: b.name,
        ...hvacFault
      });
    }
    
    return {
      ...b,
      power,
      minutePower: advancedMonitoringService.getMinutePower(b.id) || power,
      peakLoad: power * 1.3,
      occupancy,
      temperature,
      status,
      wastagePercent,
      anomaly,
      hvacFault,
      surgeInfo: surgeCheck,
      zones: [
        { name: 'Floor 1', power: power * 0.4 },
        { name: 'Floor 2', power: power * 0.35 },
        { name: 'HVAC', power: power * 0.25 }
      ]
    };
  });

  const totalPower = buildingsData.reduce((sum, b) => sum + b.power, 0);
  const totalBaseline = buildings.reduce((sum, b) => sum + b.baseline, 0);
  
  // Generate alerts from anomalies
  const newAlerts = buildingsData
    .filter(b => b.anomaly.isAnomaly || b.hvacFault.detected || b.wastagePercent > 20)
    .map(b => {
      const alertId = `${b.id}-${Date.now()}-${Math.random()}`;
      
      if (b.hvacFault.detected) {
        return {
          id: alertId,
          severity: b.hvacFault.severity,
          icon: '🔧',
          title: 'HVAC Fault Detected',
          description: b.hvacFault.message,
          location: b.name,
          time: 'Just now',
          mlDetected: false,
          notificationSent: true,
          recipient: notificationService.blockManagers[b.id]?.name
        };
      }
      
      if (b.wastagePercent > 20) {
        return {
          id: alertId,
          severity: b.wastagePercent > 30 ? 'critical' : 'warning',
          icon: '🚨',
          title: 'High Energy Wastage',
          description: `Energy consumption ${b.wastagePercent.toFixed(1)}% above baseline. Check HVAC and lighting systems.`,
          location: b.name,
          time: 'Just now',
          wastagePercent: b.wastagePercent.toFixed(1),
          mlDetected: b.anomaly.isAnomaly,
          anomalyScore: b.anomaly.score,
          notificationSent: true,
          recipient: notificationService.blockManagers[b.id]?.name
        };
      }
      
      return {
        id: alertId,
        severity: b.anomaly.severity,
        icon: '⚠️',
        title: 'Anomaly Detected',
        description: `Unusual power consumption pattern detected (Z-score: ${b.anomaly.score.toFixed(2)})`,
        location: b.name,
        time: 'Just now',
        mlDetected: true,
        anomalyScore: b.anomaly.score,
        notificationSent: false
      };
    });

  // Update alerts database (keep last 50)
  alertsDatabase = [...newAlerts, ...alertsDatabase].slice(0, 50);

  return {
    totalPower,
    powerChange: (Math.random() - 0.5) * 10,
    energyToday: totalPower * 0.8,
    energyChange: (Math.random() - 0.5) * 8,
    waterUsage: 120 + Math.random() * 40,
    waterChange: (Math.random() - 0.5) * 15,
    gasFlow: 2.5 + Math.random() * 1.5,
    gasChange: (Math.random() - 0.5) * 12,
    buildings: buildingsData,
    alerts: alertsDatabase.slice(0, 10),
    totalBaseline,
    totalWastage: Math.max(0, totalPower - totalBaseline),
    monitoringConfig: advancedMonitoringService.getConfiguration()
  };
}

// API Endpoints

// Get current data (for HTTP polling fallback)
app.get('/api/current-data', (req, res) => {
  const data = generateMockData();
  res.json(data);
});

// Get historical analytics
app.get('/api/analytics/:buildingId', (req, res) => {
  const { buildingId } = req.params;
  const { range } = req.query;
  
  const hours = range === '24h' ? 24 : range === '7d' ? 168 : 24;
  const trendData = generateHistoricalData(hours);
  const heatmapData = generateHeatmapData();
  
  const totalConsumption = trendData.reduce((sum, d) => sum + d.consumption, 0);
  const totalBaseline = trendData.reduce((sum, d) => sum + d.baseline, 0);
  const totalWastage = totalConsumption - totalBaseline;
  const wastagePercent = (totalWastage / totalBaseline) * 100;
  
  const insights = mlService.generateInsights({
    wastagePercent,
    powerChange: (Math.random() - 0.5) * 10,
    peakLoad: 200,
    baseline: 150,
    renewablePercent: 35
  });
  
  res.json({
    trendData,
    heatmapData,
    comparisonData: trendData,
    totalWastage,
    wastagePercent,
    costImpact: totalWastage * 8, // ₹8 per kWh
    insights
  });
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  res.json(alertsDatabase);
});

// Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', (req, res) => {
  const { alertId } = req.params;
  alertsDatabase = alertsDatabase.map(alert => 
    alert.id === alertId ? { ...alert, acknowledged: true } : alert
  );
  res.json({ success: true });
});

// Get notification log
app.get('/api/notifications', (req, res) => {
  res.json(notificationService.getNotificationLog());
});

// Test notification endpoint (for demos)
app.post('/api/test-notification', async (req, res) => {
  const { buildingId, type } = req.body;
  
  const building = buildings.find(b => b.id === parseInt(buildingId));
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }
  
  const testData = {
    buildingName: building.name,
    wastagePercent: 25.5,
    actualKwh: building.baseline * 1.255,
    baselineKwh: building.baseline,
    severity: 'warning'
  };
  
  let result;
  try {
    if (type === 'whatsapp') {
      result = await notificationService.sendWhatsApp(buildingId, testData);
    } else {
      result = await notificationService.sendSMS(buildingId, testData);
    }
    
    res.json({ 
      success: true, 
      notification: result,
      message: result ? 'Notification sent successfully' : 'Notification skipped (rate limited)'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get sustainability metrics
app.get('/api/sustainability', (req, res) => {
  const totalPower = 700;
  const co2Emissions = totalPower * 0.82; // 0.82 kg CO₂ per kWh
  
  res.json({
    co2Emissions,
    co2Change: (Math.random() - 0.6) * 10,
    energyIntensity: 12.5 + Math.random() * 2,
    intensityChange: (Math.random() - 0.5) * 5,
    renewablePercent: 35 + Math.random() * 5,
    renewableChange: Math.random() * 3,
    costSavings: 5000 + Math.random() * 1000,
    savingsIncrease: 500 + Math.random() * 200,
    netZeroProgress: 42 + Math.random() * 5,
    emissionReduction: 38 + Math.random() * 4,
    scope1: co2Emissions * 0.3,
    scope2: co2Emissions * 0.5,
    scope3: co2Emissions * 0.2
  });
});

// Get monitoring configuration
app.get('/api/monitoring/config', (req, res) => {
  res.json(advancedMonitoringService.getConfiguration());
});

// Update thresholds
app.post('/api/monitoring/thresholds', (req, res) => {
  const { period, warning, critical } = req.body;
  
  if (!period || warning === undefined || critical === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  advancedMonitoringService.updateThresholds(period, warning, critical);
  res.json({ success: true, config: advancedMonitoringService.getConfiguration() });
});

// Update adaptive mode
app.post('/api/monitoring/adaptive', (req, res) => {
  const { enabled, multiplier } = req.body;
  
  advancedMonitoringService.setAdaptiveMode(enabled, multiplier);
  res.json({ success: true, config: advancedMonitoringService.getConfiguration() });
});

// Get power history for a building
app.get('/api/monitoring/history/:buildingId', (req, res) => {
  const { buildingId } = req.params;
  const history = advancedMonitoringService.getPowerHistory(parseInt(buildingId));
  res.json({ history, config: advancedMonitoringService.getConfiguration() });
});

// Pause SMS notifications
app.post('/api/sms/pause', (req, res) => {
  notificationService.pauseSMS();
  res.json({ success: true, status: 'paused', message: 'SMS notifications paused' });
});

// Resume SMS notifications
app.post('/api/sms/resume', (req, res) => {
  notificationService.resumeSMS();
  res.json({ success: true, status: 'active', message: 'SMS notifications resumed' });
});

// Get SMS status
app.get('/api/sms/status', (req, res) => {
  const paused = notificationService.isSMSPaused();
  res.json({ 
    paused, 
    status: paused ? 'paused' : 'active',
    message: paused ? 'SMS notifications are currently paused' : 'SMS notifications are active'
  });
});

// Get ML model status
app.get('/api/ml/status', (req, res) => {
  const status = mlService.getModelStatus();
  res.json(status);
});

// ============================================
// DAILY EVALUATION REPORT API ENDPOINTS
// ============================================

// Import report service (unified API)
import reportService from './reports/reportService.js';
import { distributeReport } from './reports/reportDistributor.js';

// Initialize report service on server startup
reportService.initialize().catch(error => {
  console.error('Failed to initialize report service:', error);
});

// Generate a new report
app.post('/api/reports/generate', async (req, res) => {
  try {
    console.log('Generating new daily evaluation report...');
    const { distribute } = req.body;
    
    const report = await reportService.generateReport({ distribute });
    
    res.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report generated successfully',
      report: {
        id: report.id,
        generatedAt: report.generatedAt,
        summary: report.summary
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// List all reports with filtering
app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = parseInt(limit, 10);
    
    const reports = await reportService.listReports(filters);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get specific report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReport(id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: 'Report not found' 
      });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await reportService.deleteReport(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Report not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export report to PDF
app.get('/api/reports/:id/export/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await reportService.exportToPDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export report to CSV
app.get('/api/reports/:id/export/csv', async (req, res) => {
  try {
    const { id } = req.params;
    const csvPath = await reportService.exportToCSV(id);
    
    res.download(csvPath, `report-${id}.csv`, (err) => {
      if (err) {
        console.error('Error downloading CSV:', err);
        res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Distribute report via email/SMS
app.post('/api/reports/:id/distribute', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if report exists
    const report = await reportService.getReport(id);
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: 'Report not found' 
      });
    }
    
    // Distribute report
    const result = await reportService.distributeReport(id);
    
    res.json({ 
      success: true, 
      message: 'Report distributed successfully',
      emailsSent: result.emailsSent,
      smsSent: result.smsSent,
      failures: result.failures
    });
  } catch (error) {
    console.error('Error distributing report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get report configuration
app.get('/api/reports/config', async (req, res) => {
  try {
    const config = await reportService.getConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error getting configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update report configuration
app.put('/api/reports/config', async (req, res) => {
  try {
    const config = req.body;
    const updatedConfig = await reportService.updateConfig(config);
    
    res.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get next scheduled report run time
app.get('/api/reports/schedule/next', (req, res) => {
  try {
    const nextRun = reportService.getNextScheduledRun();
    
    res.json({ 
      success: true, 
      nextRun: nextRun ? nextRun.toISOString() : null,
      message: nextRun ? `Next report scheduled for ${nextRun.toLocaleString()}` : 'No report scheduled'
    });
  } catch (error) {
    console.error('Error getting next scheduled run:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get predictions for a building
app.get('/api/ml/predict/:buildingId', (req, res) => {
  const { buildingId } = req.params;
  const building = buildings.find(b => b.id === parseInt(buildingId));
  
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }
  
  const buildingData = {
    power: building.baseline,
    occupancy: 50,
    temperature: 23,
    energy: building.baseline * 0.8,
    water: 130,
    gas: 3.5
  };
  
  const predictions24h = mlService.predict24Hours(buildingData);
  const nextHour = mlService.predictNextHour(buildingData);
  
  res.json({
    buildingId: building.id,
    buildingName: building.name,
    nextHour,
    predictions24h,
    modelStatus: mlService.getModelStatus()
  });
});

// Get anomaly detection for current data
app.get('/api/ml/anomalies', (req, res) => {
  const anomalies = buildings.map(b => {
    const power = b.baseline + (Math.random() - 0.3) * 50;
    const buildingData = {
      power,
      occupancy: 50,
      temperature: 23,
      energy: power * 0.8,
      water: 130,
      gas: 3.5
    };
    
    const anomaly = mlService.detectAnomaly(buildingData);
    const predicted = mlService.predictPowerConsumption(buildingData);
    
    return {
      buildingId: b.id,
      buildingName: b.name,
      current: power,
      predicted,
      deviation: Math.abs(power - predicted),
      ...anomaly
    };
  });
  
  res.json({
    anomalies: anomalies.filter(a => a.isAnomaly),
    all: anomalies,
    modelStatus: mlService.getModelStatus()
  });
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Collect data every 3 seconds for surge detection
  const dataCollectionInterval = setInterval(() => {
    generateMockData(); // This records power readings for surge detection
  }, 3000);
  
  // Send updates to client every 1 minute
  const clientUpdateInterval = setInterval(() => {
    const data = generateMockData();
    ws.send(JSON.stringify(data));
  }, 60000);
  
  // Send initial data immediately
  const initialData = generateMockData();
  ws.send(JSON.stringify(initialData));

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(dataCollectionInterval);
    clearInterval(clientUpdateInterval);
  });
});

// Cleanup old notifications every 5 minutes
setInterval(() => {
  notificationService.cleanupLog();
}, 5 * 60 * 1000);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Enhanced Smart Campus Server running on port ${PORT}`);
  console.log(`📊 WebSocket: ws://localhost:${PORT}`);
  console.log(`🔌 REST API: http://localhost:${PORT}/api`);
});
