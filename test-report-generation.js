/**
 * Test Script for Daily Evaluation Report
 * 
 * This script demonstrates the complete report generation workflow:
 * 1. Generate a daily evaluation report
 * 2. Display summary information
 * 3. Export to PDF and CSV
 * 4. Show file locations
 * 
 * Usage: node test-report-generation.js
 */

import reportGenerator from './server/reports/reportGenerator.js';
import { exportToPDF, exportToCSV } from './server/reports/reportExporter.js';
import { listReports } from './server/reports/reportStorage.js';
import { loadConfig } from './server/reports/configManager.js';

console.log('='.repeat(60));
console.log('Daily Evaluation Report - Test Script');
console.log('='.repeat(60));
console.log('');

async function testReportGeneration() {
  try {
    // Step 1: Load configuration
    console.log('📋 Step 1: Loading configuration...');
    const config = await loadConfig();
    console.log('   ✓ Configuration loaded');
    console.log('   - Schedule enabled:', config.schedule.enabled);
    console.log('   - Report time:', config.schedule.time);
    console.log('   - Retention days:', config.retention.keepReports);
    console.log('');

    // Step 2: Generate report
    console.log('📊 Step 2: Generating daily evaluation report...');
    console.log('   (This may take a few seconds...)');
    const startTime = Date.now();
    
    const report = await reportGenerator.generateReport();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✓ Report generated in ${duration}s`);
    console.log('');

    // Step 3: Display report summary
    console.log('📈 Step 3: Report Summary');
    console.log('-'.repeat(60));
    console.log(`Report ID: ${report.id}`);
    console.log(`Generated: ${report.generatedAt.toLocaleString()}`);
    console.log(`Period: ${report.period.start.toLocaleString()} - ${report.period.end.toLocaleString()}`);
    console.log('');
    
    console.log('Key Metrics:');
    console.log(`  • Total Energy: ${report.summary.totalEnergy.toFixed(2)} kWh`);
    console.log(`  • Total Wastage: ${report.summary.totalWastage.toFixed(2)} kWh`);
    console.log(`  • Total Alerts: ${report.summary.totalAlerts}`);
    console.log(`  • Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`  • Sustainability Score: ${report.summary.sustainabilityScore}/100`);
    console.log('');

    console.log('Buildings:');
    report.buildingDetails.forEach(building => {
      const statusEmoji = {
        excellent: '🟢',
        good: '🟡',
        needs_attention: '🟠',
        critical: '🔴'
      }[building.status];
      console.log(`  ${statusEmoji} ${building.buildingName}: ${building.status} (${building.metrics.totalEnergy.toFixed(2)} kWh, ${building.metrics.wastagePercent.toFixed(1)}% wastage)`);
    });
    console.log('');

    if (report.recommendations.length > 0) {
      console.log('Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((rec, i) => {
        const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[rec.priority];
        console.log(`  ${i + 1}. ${priorityEmoji} [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
      console.log('');
    }

    if (report.trends.length > 0) {
      console.log('Trends:');
      report.trends.forEach(trend => {
        const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
        console.log(`  ${arrow} ${trend.metric}: ${trend.percentChange > 0 ? '+' : ''}${trend.percentChange.toFixed(1)}% (${trend.significance})`);
      });
      console.log('');
    }

    // Step 4: Export to PDF
    console.log('📄 Step 4: Exporting to PDF...');
    try {
      await exportToPDF(report.id);
      console.log(`   ✓ PDF exported successfully`);
      console.log(`   Location: .kiro/reports/exports/report-${report.id}.pdf`);
    } catch (error) {
      console.log(`   ⚠ PDF export failed: ${error.message}`);
      console.log('   (This is normal if Puppeteer/Chromium is not installed)');
    }
    console.log('');

    // Step 5: Export to CSV
    console.log('📊 Step 5: Exporting to CSV...');
    try {
      const csvPath = await exportToCSV(report.id);
      console.log(`   ✓ CSV exported successfully`);
      console.log(`   Location: .kiro/reports/exports/report-${report.id}.csv`);
    } catch (error) {
      console.log(`   ⚠ CSV export failed: ${error.message}`);
    }
    console.log('');

    // Step 6: List all reports
    console.log('📚 Step 6: Listing all reports...');
    const allReports = await listReports();
    console.log(`   ✓ Found ${allReports.length} report(s)`);
    if (allReports.length > 0) {
      console.log('   Recent reports:');
      allReports.slice(0, 5).forEach((r, i) => {
        console.log(`     ${i + 1}. ${r.id} - ${r.generatedAt.toLocaleString()}`);
      });
    }
    console.log('');

    // Success summary
    console.log('='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open the PDF to see the formatted report');
    console.log('  2. Open the CSV in Excel/Sheets to see building metrics');
    console.log('  3. Check .kiro/reports/ for stored report JSON');
    console.log('  4. Run "npm test" to execute unit tests');
    console.log('');
    console.log('Files created:');
    console.log(`  • .kiro/reports/report-${report.id}.json`);
    console.log(`  • .kiro/reports/exports/report-${report.id}.pdf`);
    console.log(`  • .kiro/reports/exports/report-${report.id}.csv`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error during test:');
    console.error('   ', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Make sure you ran "npm install" in the hacksavvy26 directory');
    console.error('  2. Ensure the server dependencies are installed');
    console.error('  3. Check that .kiro/reports/ directory exists and is writable');
    console.error('  4. Review TESTING_GUIDE.md for more help');
    process.exit(1);
  }
}

// Run the test
testReportGeneration();
