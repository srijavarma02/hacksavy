// SMS Control Script
// Usage: 
//   node sms-control.js status  - Check if SMS is paused
//   node sms-control.js pause   - Pause SMS notifications
//   node sms-control.js resume  - Resume SMS notifications

const action = process.argv[2] || 'status';

async function controlSMS(action) {
  let url, method;
  
  switch(action) {
    case 'pause':
      url = 'http://localhost:8080/api/sms/pause';
      method = 'POST';
      break;
    case 'resume':
      url = 'http://localhost:8080/api/sms/resume';
      method = 'POST';
      break;
    case 'status':
    default:
      url = 'http://localhost:8080/api/sms/status';
      method = 'GET';
  }
  
  try {
    const response = await fetch(url, { method });
    const data = await response.json();
    
    console.log('\n📱 SMS Notification Status:');
    console.log('─'.repeat(40));
    console.log(`Status: ${data.status.toUpperCase()}`);
    console.log(`Message: ${data.message}`);
    console.log('─'.repeat(40));
    
    if (data.paused) {
      console.log('📵 SMS notifications are PAUSED');
      console.log('   No messages will be sent');
      console.log('   Run: node sms-control.js resume');
    } else {
      console.log('✅ SMS notifications are ACTIVE');
      console.log('   Messages will be sent for critical alerts');
      console.log('   Run: node sms-control.js pause');
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the server is running: npm run server\n');
  }
}

controlSMS(action);
