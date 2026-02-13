/**
 * Manual test script for report exporter
 * Run with: node test-exporter-manual.js
 */

import { saveReport } from './server/reports/reportStorage.js';
import { exportToPDF, exportToCSV, getExportPath } from './server/reports/reportExporter.js';
import { promises as fs } from 'fs';

// Create a mock report for testing
const mockReport = {
  id: '2024-01-15-test',
  generatedAt: new Date('2024-01-15T18:00:00Z'),
  period: {
    start: new Date('2024-01-14T18:00:00Z'),
    end: new Date('2024-01-15T18:00:00Z')
  },
  summary: {
    totalEnergy: 1250.5,
    totalWastage: 125.3,
    totalAlerts: 15,
    criticalIssues: 2,
    sustainabilityScore: 78.5,
    keyHighlights: ['Energy consumption down 5%', 'Two critical alerts resolved']
  },
  buildingDetails: [
    {
      buildingId: 1,
      buildingName: 'Engineering Building',
      status: 'good',
      metrics: {
        totalEnergy: 450.2,
        avgPower: 18.75,
        peakPower: 35.5,
        avgOccupancy: 65.3,
        avgTemperature: 22.5,
        totalWastage: 45.1,
        wastagePercent: 10.0
      },
      issues: [],
      achievements: ['Reduced wastage by 3%']
    },
    {
      buildingId: 2,
      buildingName: 'Science Lab',
      status: 'needs_attention',
      metrics: {
        totalEnergy: 800.3,
        avgPower: 33.35,
        peakPower: 55.2,
        avgOccupancy: 72.1,
        avgTemperature: 23.1,
        totalWastage: 80.2,
        wastagePercent: 10.0
      },
      issues: ['High energy consumption'],
      achievements: []
    }
  ],
  alertSummary: {
    total: 15,
    critical: 2,
    warning: 8,
    info: 5,
    avgResponseTime: 12.5,
    topAlerts: []
  },
  anomalyInsights: {
    totalDetected: 3,
    byBuilding: new Map([[1, 1], [2, 2]]),
    criticalAnomalies: [
      {
        id: 'anom-1',
        buildingId: 2,
        type: 'power_spike',
        description: 'Unusual power spike detected',
        impact: 'High energy consumption',
        detectedAt: new Date('2024-01-15T14:30:00Z')
      }
    ],
    patterns: ['Evening power spikes']
  },
  sustainability: {
    totalCO2: 625.25,
    energyIntensity: 15.6,
    renewablePercent: 25.0,
    costSavings: 5420.0,
    netZeroProgress: 35.0
  },
  trends: [
    {
      metric: 'energy',
      direction: 'down',
      percentChange: -5.2,
      significance: 'medium'
    }
  ],
  recommendations: [
    {
      priority: 'high',
      category: 'energy',
      title: 'Investigate Science Lab power consumption',
      description: 'Science Lab showing higher than normal energy usage',
      expectedImpact: 'Potential 10% energy reduction',
      buildingIds: [2]
    }
  ],
  charts: []
};

async function testExporter() {
  console.log('🧪 Testing Report Exporter...\n');

  try {
    // Step 1: Save the mock report
    console.log('1️⃣ Saving mock report...');
    await saveReport(mockReport);
    console.log('✅ Report saved successfully\n');

    // Step 2: Test getExportPath
    console.log('2️⃣ Testing getExportPath...');
    const pdfPath = getExportPath(mockReport.id, 'pdf');
    const csvPath = getExportPath(mockReport.id, 'csv');
    console.log(`   PDF path: ${pdfPath}`);
    console.log(`   CSV path: ${csvPath}`);
    console.log('✅ Export paths generated\n');

    // Step 3: Test CSV export
    console.log('3️⃣ Testing CSV export...');
    const csvFilePath = await exportToCSV(mockReport.id);
    console.log(`   CSV exported to: ${csvFilePath}`);
    
    // Verify CSV content
    const csvContent = await fs.readFile(csvFilePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    console.log(`   CSV has ${lines.length} lines (1 header + ${lines.length - 1} data rows)`);
    console.log(`   First line: ${lines[0].substring(0, 60)}...`);
    console.log('✅ CSV export successful\n');

    // Step 4: Test PDF export
    console.log('4️⃣ Testing PDF export...');
    const pdfBuffer = await exportToPDF(mockReport.id);
    console.log(`   PDF generated, size: ${pdfBuffer.length} bytes`);
    console.log(`   PDF saved to: ${pdfPath}`);
    console.log('✅ PDF export successful\n');

    console.log('🎉 All tests passed!\n');
    console.log('📁 Export files location:');
    console.log(`   - ${csvFilePath}`);
    console.log(`   - ${pdfPath}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testExporter();
