# 📱 How to Trigger SMS in Real-Time During Demo

## 3 Easy Ways to Send SMS On-Demand

### Method 1: Dashboard Button (EASIEST for Live Demo) ⭐

1. Start your dashboard: `npm run dev`
2. Go to the **Smart Alerts** tab
3. Click the **"📱 Send Test SMS"** button in the top right
4. SMS sent instantly to your phone!
5. Show your phone to the audience

**Perfect for**: Live demos where you want to click and show

---

### Method 2: Test Web UI (BEST for Testing)

1. Open `test-sms.html` in your browser
2. Select a building from dropdown
3. Click "Send SMS" button
4. Beautiful UI shows success message
5. Check your phone!

**Perfect for**: Pre-demo testing, showing the notification system

---

### Method 3: Command Line (FASTEST)

```bash
node test-sms.js 1 sms
```

Sends SMS immediately. Replace `1` with any building ID (1-7).

**Perfect for**: Quick testing, automation

---

## Automatic SMS (Background)

The system also sends SMS automatically when:
- Energy wastage > 20% over baseline
- HVAC faults detected
- Rate limited: 1 per building per 15 minutes

These happen randomly as the mock data generates anomalies.

---

## Demo Script

**What to say during demo:**

> "Now let me show you the real-time notification system. When our AI detects high energy wastage..."

> [Click "Send Test SMS" button in dashboard]

> "...it instantly sends an SMS alert to the building manager."

> [Show your phone receiving the SMS]

> "As you can see, I just received the alert on my phone with the building name, wastage percentage, and a link to the dashboard. This happens automatically 24/7, ensuring managers are always informed of energy issues."

---

## Troubleshooting

### Button doesn't work?
- Make sure server is running: `npm run server`
- Check console for errors
- Verify Twilio credentials in `.env`

### SMS not received?
- Check Twilio Console logs: https://console.twilio.com → Monitor → Logs
- Verify phone number is correct: +918008584156
- Check phone's spam folder
- Ensure phone can receive international SMS

### Rate limited?
- Wait 15 minutes between messages to same building
- Or restart server to reset rate limits
- Or use different building IDs (1-7)

---

## Quick Reference

| Method | Command/Action | Speed | Best For |
|--------|---------------|-------|----------|
| Dashboard Button | Click "Send Test SMS" | Instant | Live demos |
| Web UI | Open test-sms.html | Instant | Testing |
| Command Line | `node test-sms.js 1 sms` | Instant | Quick tests |
| Automatic | Wait for anomaly | Random | Real-world demo |

---

## Your Setup

✅ Phone: +918008584156  
✅ Twilio Number: +19154652632  
✅ Server: http://localhost:8080  
✅ Dashboard: http://localhost:5173  

**You're ready to send SMS on demand!** 🚀
