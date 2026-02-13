# 📱 Twilio SMS/WhatsApp Setup Guide

## Overview
This guide walks you through integrating real SMS and WhatsApp notifications using Twilio for production deployment.

## Prerequisites
- Twilio account (sign up at https://www.twilio.com)
- Verified phone numbers for testing
- Credit balance or paid Twilio account

---

## Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with email and verify your account
3. Complete phone verification
4. Get $15 free trial credit

---

## Step 2: Get Twilio Credentials

### Find Your Credentials
1. Log in to Twilio Console: https://console.twilio.com
2. Navigate to **Dashboard**
3. Copy these values:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" and copy

### Get a Phone Number
1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Choose a number with SMS and Voice capabilities
4. Purchase the number (free with trial credit)
5. Copy your Twilio phone number: `+1234567890`

---

## Step 3: Configure Environment Variables

### Create `.env` File
In your project root (`hacksavvy26/`), create `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Configuration (optional)
TWILIO_WHATSAPP_NUMBER=+14155238886

# Application Configuration
NODE_ENV=production
PORT=8080
```

### Add to `.gitignore`
```bash
echo ".env" >> .gitignore
```

---

## Step 4: Install Twilio SDK

```bash
npm install twilio dotenv
```

---

## Step 5: Update Notification Service

Replace `server/notificationService.js` with production code:

```javascript
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

class NotificationService {
  constructor() {
    // Initialize Twilio client
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    this.notificationLog = [];
    this.blockManagers = {
      1: { name: 'John Doe', phone: '+919876543210', email: 'john@campus.edu' },
      2: { name: 'Jane Smith', phone: '+919876543211', email: 'jane@campus.edu' },
      // Add your real phone numbers here
    };
    
    this.wastageThresholds = {
      default: 20,
      critical: 30
    };
  }

  // Send real SMS via Twilio
  async sendSMS(buildingId, wastageData) {
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    const message = this.formatWastageMessage(buildingId, wastageData);
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.twilioPhone,
        to: manager.phone
      });
      
      console.log(`✅ SMS sent successfully: ${result.sid}`);
      
      const notification = {
        id: result.sid,
        channel: 'sms',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        twilioSid: result.sid
      };
      
      this.notificationLog.unshift(notification);
      return notification;
      
    } catch (error) {
      console.error('❌ SMS failed:', error.message);
      
      const notification = {
        id: Date.now(),
        channel: 'sms',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'failed',
        buildingId,
        error: error.message
      };
      
      this.notificationLog.unshift(notification);
      return notification;
    }
  }

  // Send real WhatsApp via Twilio
  async sendWhatsApp(buildingId, wastageData) {
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    const message = this.formatWastageMessage(buildingId, wastageData);
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.whatsappNumber,
        to: `whatsapp:${manager.phone}`
      });
      
      console.log(`✅ WhatsApp sent successfully: ${result.sid}`);
      
      const notification = {
        id: result.sid,
        channel: 'whatsapp',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        twilioSid: result.sid
      };
      
      this.notificationLog.unshift(notification);
      return notification;
      
    } catch (error) {
      console.error('❌ WhatsApp failed:', error.message);
      
      const notification = {
        id: Date.now(),
        channel: 'whatsapp',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'failed',
        buildingId,
        error: error.message
      };
      
      this.notificationLog.unshift(notification);
      return notification;
    }
  }

  // Rest of the methods remain the same...
  checkWastageThreshold(buildingId, actual, baseline) {
    const wastagePercent = ((actual - baseline) / baseline) * 100;
    
    if (wastagePercent > this.wastageThresholds.critical) {
      return { shouldNotify: true, severity: 'critical', wastagePercent };
    } else if (wastagePercent > this.wastageThresholds.default) {
      return { shouldNotify: true, severity: 'warning', wastagePercent };
    }
    
    return { shouldNotify: false, wastagePercent };
  }

  formatWastageMessage(buildingId, wastageData) {
    const { buildingName, wastagePercent, actualKwh, baselineKwh, severity } = wastageData;
    const emoji = severity === 'critical' ? '🚨🚨' : '⚠️';
    const dashboardLink = 'https://campus.edu/energy';
    
    return `${emoji} High wastage in ${buildingName}: ${wastagePercent.toFixed(1)}% over baseline (${actualKwh.toFixed(1)} kWh vs ${baselineKwh.toFixed(1)} kWh baseline). Check HVAC/lighting systems. Dashboard: ${dashboardLink}`;
  }

  async sendHVACAlert(buildingId, faultData) {
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    const message = `🔧 HVAC Alert - ${faultData.buildingName}: ${faultData.message}. ${faultData.recommendation}`;
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.twilioPhone,
        to: manager.phone
      });
      
      console.log(`✅ HVAC alert sent: ${result.sid}`);
      
      const notification = {
        id: result.sid,
        channel: 'sms',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        type: 'hvac_fault',
        twilioSid: result.sid
      };
      
      this.notificationLog.unshift(notification);
      return notification;
      
    } catch (error) {
      console.error('❌ HVAC alert failed:', error.message);
      return null;
    }
  }

  getNotificationLog(limit = 50) {
    return this.notificationLog.slice(0, limit);
  }

  cleanupLog() {
    if (this.notificationLog.length > 100) {
      this.notificationLog = this.notificationLog.slice(0, 100);
    }
  }
}

export default new NotificationService();
```

---

## Step 6: Update Server Configuration

In `server/enhancedServer.js`, add at the top:

```javascript
import dotenv from 'dotenv';
dotenv.config();
```

---

## Step 7: WhatsApp Setup (Optional)

### Enable WhatsApp Sandbox (Testing)
1. Go to Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join sandbox:
   - Send "join [your-code]" to +1 415 523 8886 from your WhatsApp
3. Use sandbox number for testing: `whatsapp:+14155238886`

### Production WhatsApp (Requires Approval)
1. Go to **Messaging** → **WhatsApp** → **Senders**
2. Click **Request to enable my WhatsApp sender**
3. Submit business profile for approval
4. Wait 1-3 business days for approval
5. Once approved, use your business number

---

## Step 8: Testing

### Test SMS
```bash
# Start server
npm run server

# Trigger a test notification
curl -X POST http://localhost:8080/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"buildingId": 1, "type": "sms"}'
```

### Test WhatsApp
```bash
curl -X POST http://localhost:8080/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"buildingId": 1, "type": "whatsapp"}'
```

### Add Test Endpoint
In `server/enhancedServer.js`:

```javascript
app.post('/api/test-notification', async (req, res) => {
  const { buildingId, type } = req.body;
  
  const testData = {
    buildingName: buildings.find(b => b.id === buildingId)?.name || 'Test Building',
    wastagePercent: 25.5,
    actualKwh: 150.2,
    baselineKwh: 120.0,
    severity: 'warning'
  };
  
  let result;
  if (type === 'whatsapp') {
    result = await notificationService.sendWhatsApp(buildingId, testData);
  } else {
    result = await notificationService.sendSMS(buildingId, testData);
  }
  
  res.json({ success: true, notification: result });
});
```

---

## Step 9: Phone Number Verification

### Trial Account Limitations
- Can only send to verified phone numbers
- Add numbers in Twilio Console → **Phone Numbers** → **Verified Caller IDs**

### Verify a Number
1. Click **Add a new Caller ID**
2. Enter phone number with country code
3. Receive verification code via SMS
4. Enter code to verify

### Upgrade to Paid Account
- Remove verification restrictions
- Send to any phone number
- Higher rate limits
- Better deliverability

---

## Step 10: Rate Limiting & Best Practices

### Implement Rate Limiting
```javascript
class NotificationService {
  constructor() {
    // ... existing code ...
    this.rateLimits = new Map(); // Track notifications per building
    this.cooldownPeriod = 15 * 60 * 1000; // 15 minutes
  }

  canSendNotification(buildingId) {
    const lastSent = this.rateLimits.get(buildingId);
    if (!lastSent) return true;
    
    const timeSince = Date.now() - lastSent;
    return timeSince > this.cooldownPeriod;
  }

  async sendSMS(buildingId, wastageData) {
    // Check rate limit
    if (!this.canSendNotification(buildingId)) {
      console.log(`⏳ Rate limit: Skipping notification for building ${buildingId}`);
      return null;
    }
    
    // ... send SMS ...
    
    // Update rate limit
    this.rateLimits.set(buildingId, Date.now());
    
    return notification;
  }
}
```

### Best Practices
1. **Rate Limiting**: Max 1 notification per building per 15 minutes
2. **Error Handling**: Log failures, retry with exponential backoff
3. **Message Length**: Keep under 160 characters for single SMS
4. **Opt-out**: Include "Reply STOP to unsubscribe"
5. **Timing**: Avoid sending between 10 PM - 8 AM
6. **Monitoring**: Track delivery rates and failures

---

## Step 11: Monitoring & Debugging

### View Twilio Logs
1. Go to Twilio Console → **Monitor** → **Logs** → **Messaging**
2. See all sent messages, delivery status, errors
3. Filter by date, status, phone number

### Check Message Status
```javascript
async getMessageStatus(messageSid) {
  try {
    const message = await this.client.messages(messageSid).fetch();
    return {
      status: message.status, // queued, sent, delivered, failed
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Failed to fetch message status:', error);
    return null;
  }
}
```

### Common Error Codes
- **21211**: Invalid phone number format
- **21408**: Permission denied (unverified number on trial)
- **21610**: Message blocked (opt-out)
- **30007**: Message filtered (spam)

---

## Step 12: Cost Estimation

### Twilio Pricing (US, as of 2024)
- **SMS**: $0.0079 per message
- **WhatsApp**: $0.005 per message (first 1,000 free/month)
- **Phone Number**: $1.15/month

### Example Calculation
- 7 buildings × 10 alerts/day = 70 messages/day
- 70 × $0.0079 = $0.55/day
- Monthly: $16.50 + $1.15 = $17.65/month

### Cost Optimization
1. Use WhatsApp (cheaper than SMS)
2. Implement smart rate limiting
3. Batch non-critical alerts
4. Use email for detailed reports

---

## Step 13: Production Deployment

### Environment Setup
```bash
# Set environment variables on server
export TWILIO_ACCOUNT_SID=ACxxxxx
export TWILIO_AUTH_TOKEN=xxxxx
export TWILIO_PHONE_NUMBER=+1234567890
export NODE_ENV=production
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/enhancedServer.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    restart: unless-stopped
```

---

## Troubleshooting

### Issue: "Authentication Error"
**Solution**: Verify Account SID and Auth Token are correct

### Issue: "Invalid Phone Number"
**Solution**: Use E.164 format: `+[country code][number]` (e.g., `+919876543210`)

### Issue: "Permission Denied"
**Solution**: Verify phone number in Twilio Console (trial accounts only)

### Issue: "Message Not Delivered"
**Solution**: Check Twilio logs for delivery status and error codes

### Issue: WhatsApp Not Working
**Solution**: Ensure recipient has joined WhatsApp sandbox or use approved business number

---

## Additional Resources

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **WhatsApp API**: https://www.twilio.com/docs/whatsapp
- **Node.js SDK**: https://www.twilio.com/docs/libraries/node
- **Error Codes**: https://www.twilio.com/docs/api/errors
- **Best Practices**: https://www.twilio.com/docs/sms/best-practices

---

## Support

For Twilio-specific issues:
- Email: help@twilio.com
- Support Portal: https://support.twilio.com
- Community Forum: https://www.twilio.com/community

For application issues:
- Check server logs
- Review notification log in dashboard
- Test with curl commands

---

**You're now ready for production SMS/WhatsApp notifications! 🚀**
