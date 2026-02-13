# 📱 SMS Demo Checklist

## Before the Demo

### ✅ Twilio Setup (One-time, 5 minutes)
- [ ] Sign up at https://www.twilio.com/try-twilio
- [ ] Get Account SID and Auth Token from console
- [ ] Buy a phone number (uses free trial credit)
- [ ] Verify your phone number (trial accounts only)
- [ ] Copy `.env.example` to `.env`
- [ ] Add your Twilio credentials to `.env`
- [ ] Update phone numbers in `server/notificationService.js` (line 23-29)

### ✅ Test Before Demo (2 minutes)
```bash
# Start the server
npm run server

# You should see:
# ✅ Twilio initialized - Real SMS/WhatsApp enabled

# Test SMS
node test-sms.js 1 sms

# Check your phone - you should receive SMS!
```

## During the Demo

### Option 1: Automatic Notifications
Just run the dashboard normally. The system will automatically send SMS when:
- Energy wastage exceeds 20% over baseline
- HVAC faults are detected
- Rate limited to 1 per building per 15 minutes

### Option 2: Manual Test (Recommended for Demos)

**Method A: Command Line**
```bash
# Open a second terminal
node test-sms.js 1 sms
```

**Method B: Web Interface**
1. Open `test-sms.html` in your browser
2. Select a building
3. Click "Send SMS" button
4. Show your phone receiving the message!

**Method C: API Call**
```bash
curl -X POST http://localhost:8080/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"buildingId": 1, "type": "sms"}'
```

### What to Show

1. **Dashboard Alert Panel**
   - Point to the alert with "SMS Sent to [Manager Name]" badge
   - Show the notification log at the bottom

2. **Your Phone**
   - Show the actual SMS message received
   - Read the message content:
     ```
     🚨 High wastage in Engineering: 25.3% over baseline 
     (150.2 kWh vs 120 kWh baseline). 
     Check HVAC/lighting systems.
     ```

3. **Server Console**
   - Show the log: `✅ SMS sent successfully to +1234567890: SMxxxxx`

4. **Twilio Console** (Optional)
   - Open https://console.twilio.com
   - Go to Monitor → Logs → Messaging
   - Show the delivery status

## Demo Script

> "Now let me show you the automated notification system. When the AI detects high energy wastage, it automatically sends SMS alerts to the building manager."

> [Trigger test SMS]

> "As you can see, I just received an SMS on my phone with the alert details - the building name, wastage percentage, and a link to the dashboard."

> [Show phone to camera/audience]

> "The system includes rate limiting to prevent spam - maximum one notification per building every 15 minutes. All notifications are logged here in the dashboard for audit purposes."

> [Point to notification log]

> "This works with both SMS and WhatsApp, and in production, we can configure different managers for each building."

## Troubleshooting During Demo

### SMS Not Received?
1. Check server console for errors
2. Verify phone number format: `+1234567890` (no spaces/dashes)
3. Check Twilio Console → Monitor → Logs
4. Trial accounts: Make sure number is verified

### "Rate Limited" Message?
- Wait 15 minutes, or
- Restart the server to reset rate limits

### Server Not Running?
```bash
npm run server
```

### Wrong Phone Number?
Edit `server/notificationService.js` line 23-29 and restart server

## Backup Plan (If SMS Fails)

If real SMS doesn't work during demo:
1. Show the mock notifications in console
2. Show the notification log in dashboard
3. Show the Twilio setup documentation
4. Explain: "In production, this sends real SMS via Twilio"

## After the Demo

### Show Additional Features
- WhatsApp integration (if set up)
- Notification log with timestamps
- Rate limiting configuration
- Multiple building managers
- Twilio delivery tracking

### Answer Common Questions

**Q: How much does it cost?**
A: ~$0.0079 per SMS. For 7 buildings with 10 alerts/day = ~$17/month

**Q: Can we use WhatsApp?**
A: Yes! WhatsApp is cheaper ($0.005/message) and included in Twilio

**Q: What about email?**
A: Easy to add - just need SMTP configuration

**Q: Can we customize the message?**
A: Yes, edit `formatWastageMessage()` in `notificationService.js`

**Q: How do we prevent spam?**
A: Built-in rate limiting (15 min cooldown) + configurable thresholds

## Files Reference

- **Setup Guide**: `SMS_QUICK_SETUP.md` (5-minute setup)
- **Full Guide**: `TWILIO_SETUP.md` (production deployment)
- **Test Script**: `test-sms.js` (command line testing)
- **Test UI**: `test-sms.html` (web interface testing)
- **Config**: `.env` (Twilio credentials)
- **Service**: `server/notificationService.js` (notification logic)

## Quick Commands

```bash
# Start server
npm run server

# Test SMS
node test-sms.js 1 sms

# Test WhatsApp
node test-sms.js 1 whatsapp

# View logs
# Check server console output

# Open test UI
# Open test-sms.html in browser
```

---

**You're ready to demo real SMS notifications! 🚀**

Remember: The wow factor is showing the actual SMS on your phone in real-time!
