/**
 * Manual test script for reportStorage
 * Run with: node test-report-storage-manual.js
 */

import {
  saveReport,
  getReport,
  listReports,
  deleteReport,
  cleanupOldReports
} from './server/reports/reportStorage.js';

// Create a test report
const testReport = {
  id: 'manual-test-' + Date.now(),
  generatedAt: new Date(),
  period: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  },
  summary: {
    totalEnergy: 1000,
    totalWastage: 50,
    totalAlerts: 10,
    criticalIssues: 2,
    sustainabilityScore: 85,
    keyHighlights: ['Test highlight']
  },
  buildingDetails: [
    {
      buildingId: 1,
      buildingName: 'Engineering Building',
      metrics: {
        buildingId: 1,
        buildingName: 'Engineering Building',
        totalEnergy: 500,
        avgPower: 20,
        peakPower: 40,
        avgOccupancy: 75,
        avgTemperature: 22,
        totalWastage: 25,
        wastagePercent: 5
      },
      status: 'good',
      issues: [],
      achievements: ['Reduced energy consumption']
    }
  ],
  alertSummary: {
    total: 10,
    critical: 2,
    warning: 5,
    info: 3,
    avgResponseTime: 15,
    topAlerts: []
  },
  anomalyInsights: {
    totalDetected: 3,
    byBuilding: new Map([[1, 3]]),
    criticalAnomalies: [],
    patterns: ['High energy usage at night']
  },
  sustainability: {
    totalCO2: 500,
    energyIntensity: 10,
    renewablePercent: 30,
    costSavings: 1000,
    netZeroProgress: 40
  },
  trends: [],
  recommendations: [],
  charts: []
};

async function runTests() {
  console.log('🧪 Testing reportStorage...\n');

  try {
    // Test 1: Save report
    console.log('1️⃣ Testing saveReport()...');
    await saveReport(testReport);
    console.log('✅ Report saved successfully\n');

    // Test 2: Get report
    console.log('2️⃣ Testing getReport()...');
    const retrieved = await getReport(testReport.id);
    if (retrieved && retrieved.id === testReport.id) {
      console.log('✅ Report retrieved successfully');
      console.log(`   ID: ${retrieved.id}`);
      console.log(`   Generated: ${retrieved.generatedAt}`);
      console.log(`   Total Energy: ${retrieved.summary.totalEnergy} kWh\n`);
    } else {
      console.log('❌ Failed to retrieve report\n');
    }

    // Test 3: List reports
    console.log('3️⃣ Testing listReports()...');
    const reports = await listReports();
    console.log(`✅ Found ${reports.length} report(s)`);
    if (reports.length > 0) {
      console.log(`   Most recent: ${reports[0].id}\n`);
    }

    // Test 4: List with filters
    console.log('4️⃣ Testing listReports() with limit...');
    const limitedReports = await listReports({ limit: 2 });
    console.log(`✅ Retrieved ${limitedReports.length} report(s) with limit\n`);

    // Test 5: Delete report
    console.log('5️⃣ Testing deleteReport()...');
    const deleted = await deleteReport(testReport.id);
    if (deleted) {
      console.log('✅ Report deleted successfully\n');
    } else {
      console.log('❌ Failed to delete report\n');
    }

    // Test 6: Verify deletion
    console.log('6️⃣ Verifying deletion...');
    const afterDelete = await getReport(testReport.id);
    if (afterDelete === null) {
      console.log('✅ Report confirmed deleted\n');
    } else {
      console.log('❌ Report still exists after deletion\n');
    }

    // Test 7: Cleanup old reports
    console.log('7️⃣ Testing cleanupOldReports()...');
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const cleanedCount = await cleanupOldReports(threshold);
    console.log(`✅ Cleaned up ${cleanedCount} old report(s)\n`);

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
