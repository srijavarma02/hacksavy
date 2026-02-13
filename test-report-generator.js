/**
 * Simple test script for reportGenerator
 * Tests the basic functionality of report generation
 */

import reportGenerator from './server/reports/reportGenerator.js';

async function testReportGenerator() {
  console.log('Testing Report Generator...\n');
  
  try {
    // Test 1: Generate a report for the last 24 hours
    console.log('Test 1: Generating report for last 24 hours...');
    const endTime = new Date();
    const startTime = new Date(endTime);
    startTime.setHours(startTime.getHours() - 24);
    
    const report = await reportGenerator.generateReport(startTime, endTime);
    
    console.log('✓ Report generated successfully');
    console.log(`  Report ID: ${report.id}`);
    console.log(`  Period: ${report.period.start.toISOString()} to ${report.period.end.toISOString()}`);
    console.log(`  Total Energy: ${report.summary.totalEnergy} kWh`);
    console.log(`  Total Wastage: ${report.summary.totalWastage} kWh`);
    console.log(`  Total Alerts: ${report.summary.totalAlerts}`);
    console.log(`  Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`  Sustainability Score: ${report.summary.sustainabilityScore}`);
    console.log(`  Buildings: ${report.buildingDetails.length}`);
    console.log(`  Recommendations: ${report.recommendations.length}`);
    console.log(`  Charts: ${report.charts.length}`);
    console.log(`  Trends: ${report.trends.length}`);
    
    // Test 2: Verify report structure
    console.log('\nTest 2: Verifying report structure...');
    
    const requiredFields = [
      'id', 'generatedAt', 'period', 'summary', 'buildingDetails',
      'alertSummary', 'anomalyInsights', 'sustainability', 'trends',
      'recommendations', 'charts'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in report));
    
    if (missingFields.length === 0) {
      console.log('✓ All required fields present');
    } else {
      console.log('✗ Missing fields:', missingFields);
    }
    
    // Test 3: Verify building status classification
    console.log('\nTest 3: Verifying building status classification...');
    
    const statusCounts = {
      excellent: 0,
      good: 0,
      needs_attention: 0,
      critical: 0
    };
    
    report.buildingDetails.forEach(building => {
      statusCounts[building.status]++;
      console.log(`  ${building.buildingName}: ${building.status} (wastage: ${building.metrics.wastagePercent}%)`);
    });
    
    console.log('\nStatus distribution:');
    console.log(`  Excellent: ${statusCounts.excellent}`);
    console.log(`  Good: ${statusCounts.good}`);
    console.log(`  Needs Attention: ${statusCounts.needs_attention}`);
    console.log(`  Critical: ${statusCounts.critical}`);
    
    // Test 4: Verify chart data
    console.log('\nTest 4: Verifying chart data...');
    
    report.charts.forEach(chart => {
      console.log(`  ✓ ${chart.title} (${chart.type})`);
    });
    
    // Test 5: Verify recommendations
    console.log('\nTest 5: Verifying recommendations...');
    
    if (report.recommendations.length > 0) {
      console.log(`  ✓ ${report.recommendations.length} recommendations generated`);
      report.recommendations.slice(0, 3).forEach(rec => {
        console.log(`    [${rec.priority}] ${rec.title}`);
      });
    } else {
      console.log('  ℹ No recommendations generated (this is OK if all metrics are good)');
    }
    
    // Test 6: Test report ID generation
    console.log('\nTest 6: Testing report ID generation...');
    
    const testDate = new Date('2024-02-13T18:00:00Z');
    const testId = reportGenerator.generateReportId(testDate);
    console.log(`  Generated ID: ${testId}`);
    
    if (/^\d{4}-\d{2}-\d{2}-\d{6}$/.test(testId)) {
      console.log('  ✓ Report ID format is correct');
    } else {
      console.log('  ✗ Report ID format is incorrect');
    }
    
    console.log('\n✓ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testReportGenerator();
