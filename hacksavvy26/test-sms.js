// Quick SMS test script for demos
// Usage: node test-sms.js [buildingId] [type]
// Example: node test-sms.js 1 sms

const buildingId = process.argv[2] || '1';
const type = process.argv[3] || 'sms';

const data = {
  buildingId: parseInt(buildingId),
  type: type
};

console.log(`\n📱 Sending test ${type.toUpperCase()} notification for Building ${buildingId}...\n`);

fetch('http://localhost:8080/api/test-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      console.log('✅ Success!');
      console.log(`   ${result.message}`);
      if (result.notification) {
        console.log(`\n📋 Notification Details:`);
        console.log(`   Recipient: ${result.notification.recipient}`);
        console.log(`   Phone: ${result.notification.phone}`);
        console.log(`   Channel: ${result.notification.channel}`);
        console.log(`   Status: ${result.notification.status}`);
        console.log(`   Time: ${result.notification.timestamp}`);
        if (result.notification.twilioSid) {
          console.log(`   Twilio SID: ${result.notification.twilioSid}`);
        }
        console.log(`\n💬 Message:`);
        console.log(`   ${result.notification.message}`);
      }
    } else {
      console.log('❌ Failed!');
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  })
  .catch(error => {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run server\n');
  });
