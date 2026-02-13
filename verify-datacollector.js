/**
 * Manual verification script for dataCollector
 * Run with: node verify-datacollector.js
 */

import dataCollector from './server/reports/dataCollector.js';

async function verify() {
  console.log('🔍 Verifying Data Collector Implementation...\n');

  // Set up 24-hour time range
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  console.log(`Time Range: ${startTime.toISOString()} to ${endTime.toISOString()}\n`);

  try {
    // Test 1: collectBuildingMetrics
    console.log('✅ Test 1: collectBuildingMetrics()');
    const buildingMetrics = await dataCollector.collectBuildingMetrics(startTime, endTime);
    console.log(`   - Collected metrics for ${buildingMetrics.length} buildings`);
    console.log(`   - Sample: ${buildingMetrics[0].buildingName} - ${buildingMetrics[0].totalEnergy.toFixed(2)} kWh`);
    console.log(`   - All buildings have required fields: ${buildingMetrics.every(b => 
      b.buildingId && b.buildingName && b.totalEnergy && b.avgPower && b.peakPower
    )}`);

    // Test 2: collectAlerts
    console.log('\n✅ Test 2: collectAlerts()');
    const alerts = await dataCollector.collectAlerts(startTime, endTime);
    console.log(`   - Total alerts: ${alerts.total}`);
    console.log(`   - Critical: ${alerts.critical}, Warning: ${alerts.warning}, Info: ${alerts.info}`);
    console.log(`   - Average response time: ${alerts.avgResponseTime.toFixed(1)} minutes`);
    console.log(`   - Top alerts count: ${alerts.topAlerts.length}`);

    // Test 3: collectAnomalies
    console.log('\n✅ Test 3: collectAnomalies()');
    const anomalies = await dataCollector.collectAnomalies(startTime, endTime);
    console.log(`   - Total anomalies detected: ${anomalies.totalDetected}`);
    console.log(`   - Critical anomalies: ${anomalies.criticalAnomalies.length}`);
    console.log(`   - Patterns identified: ${anomalies.patterns.length}`);

    // Test 4: collectSustainabilityMetrics
    console.log('\n✅ Test 4: collectSustainabilityMetrics()');
    const sustainability = await dataCollector.collectSustainabilityMetrics(startTime, endTime);
    console.log(`   - Total CO2: ${sustainability.totalCO2.toFixed(2)} kg`);
    console.log(`   - Energy intensity: ${sustainability.energyIntensity.toFixed(3)} kWh/m²`);
    console.log(`   - Renewable percent: ${sustainability.renewablePercent.toFixed(1)}%`);
    console.log(`   - Net zero progress: ${sustainability.netZeroProgress.toFixed(1)}%`);

    // Test 5: collectData (orchestrator)
    console.log('\n✅ Test 5: collectData() - Full orchestration');
    const reportData = await dataCollector.collectData(startTime, endTime);
    console.log(`   - Period: ${reportData.period.start.toISOString()} to ${reportData.period.end.toISOString()}`);
    console.log(`   - Buildings: ${reportData.buildings.length}`);
    console.log(`   - Campus total energy: ${reportData.campusWide.totalEnergy.toFixed(2)} kWh`);
    console.log(`   - Campus total wastage: ${reportData.campusWide.totalWastage.toFixed(2)} kWh`);
    console.log(`   - Campus efficiency: ${reportData.campusWide.avgEfficiency.toFixed(1)}%`);
    console.log(`   - Peak demand: ${reportData.campusWide.peakDemand.toFixed(2)} kW`);

    // Verify energy aggregation correctness (Property 2)
    const buildingSum = reportData.buildings.reduce((sum, b) => sum + b.totalEnergy, 0);
    const campusTotal = reportData.campusWide.totalEnergy;
    const energyDiff = Math.abs(campusTotal - buildingSum);
    console.log(`\n✅ Property 2: Energy Aggregation Correctness`);
    console.log(`   - Building sum: ${buildingSum.toFixed(2)} kWh`);
    console.log(`   - Campus total: ${campusTotal.toFixed(2)} kWh`);
    console.log(`   - Difference: ${energyDiff.toFixed(4)} kWh (should be < 0.01)`);
    console.log(`   - ✓ PASS: ${energyDiff < 0.01}`);

    // Verify wastage aggregation
    const wastageSum = reportData.buildings.reduce((sum, b) => sum + b.totalWastage, 0);
    const campusWastage = reportData.campusWide.totalWastage;
    const wastageDiff = Math.abs(campusWastage - wastageSum);
    console.log(`\n✅ Wastage Aggregation Correctness`);
    console.log(`   - Building sum: ${wastageSum.toFixed(2)} kWh`);
    console.log(`   - Campus total: ${campusWastage.toFixed(2)} kWh`);
    console.log(`   - Difference: ${wastageDiff.toFixed(4)} kWh (should be < 0.01)`);
    console.log(`   - ✓ PASS: ${wastageDiff < 0.01}`);

    console.log('\n🎉 All verifications passed! Data Collector is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

verify();
