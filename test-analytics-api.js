// Test script to verify Analytics and Sustainability API endpoints
// Run with: node test-analytics-api.js

async function testEndpoint(name, url) {
  try {
    console.log(`\nTesting ${name}...`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Response:`, JSON.stringify(data, null, 2).substring(0, 500));
    
    return { success: true, data };
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('ANALYTICS & SUSTAINABILITY API TESTS');
  console.log('='.repeat(60));
  
  // Test Analytics endpoint
  await testEndpoint(
    'Analytics API',
    'http://localhost:3001/api/analytics/campus?range=24h'
  );
  
  // Test Sustainability endpoint
  await testEndpoint(
    'Sustainability API',
    'http://localhost:3001/api/sustainability'
  );
  
  // Test Monitoring Config endpoint
  await testEndpoint(
    'Monitoring Config API',
    'http://localhost:3001/api/monitoring/config'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(60));
  console.log('\nIf all tests passed, the server is working correctly.');
  console.log('If tests failed, make sure the server is running:');
  console.log('  cd hacksavvy26');
  console.log('  node server/enhancedServer.js');
}

runTests();
