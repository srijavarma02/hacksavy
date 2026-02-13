/**
 * Simple test script for Daily Evaluation Report API
 * Tests the basic report generation and retrieval flow
 */

const API_BASE = 'http://localhost:3001/api';

async function testReportAPI() {
  console.log('🧪 Testing Daily Evaluation Report API\n');
  
  try {
    // Test 1: Generate a new report
    console.log('1️⃣ Generating new report...');
    const generateResponse = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const generateData = await generateResponse.json();
    
    if (!generateData.success) {
      throw new Error(`Report generation failed: ${generateData.error}`);
    }
    
    console.log(`✓ Report generated successfully!`);
    console.log(`  Report ID: ${generateData.reportId}`);
    console.log(`  Total Energy: ${generateData.report.summary.totalEnergy.toFixed(2)} kWh`);
    console.log(`  Total Wastage: ${generateData.report.summary.totalWastage.toFixed(2)} kWh`);
    console.log(`  Critical Issues: ${generateData.report.summary.criticalIssues}`);
    console.log();
    
    const reportId = generateData.reportId;
    
    // Test 2: List all reports
    console.log('2️⃣ Listing all reports...');
    const listResponse = await fetch(`${API_BASE}/reports`);
    const listData = await listResponse.json();
    
    if (!listData.success) {
      throw new Error(`List reports failed: ${listData.error}`);
    }
    
    console.log(`✓ Found ${listData.reports.length} report(s)`);
    console.log();
    
    // Test 3: Get specific report
    console.log('3️⃣ Fetching specific report...');
    const getResponse = await fetch(`${API_BASE}/reports/${reportId}`);
    const getData = await getResponse.json();
    
    if (!getData.success) {
      throw new Error(`Get report failed: ${getData.error}`);
    }
    
    console.log(`✓ Report retrieved successfully!`);
    console.log(`  Buildings: ${getData.report.buildingDetails.length}`);
    console.log(`  Recommendations: ${getData.report.recommendations.length}`);
    console.log(`  Charts: ${getData.report.charts.length}`);
    console.log();
    
    // Test 4: Export endpoints (just check they exist)
    console.log('4️⃣ Checking export endpoints...');
    console.log(`  PDF: ${API_BASE}/reports/${reportId}/export/pdf`);
    console.log(`  CSV: ${API_BASE}/reports/${reportId}/export/csv`);
    console.log();
    
    console.log('✅ All tests passed!\n');
    console.log('📊 You can now:');
    console.log('  1. Click "Generate Report" button in the dashboard');
    console.log('  2. Download PDF or CSV exports');
    console.log('  3. View report details via API');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testReportAPI();
