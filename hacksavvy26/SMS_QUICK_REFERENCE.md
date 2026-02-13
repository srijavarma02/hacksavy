# 📱 SMS Quick Reference Card

## Setup (5 Minutes)

1. **Get Twilio Account**: https://www.twilio.com/try-twilio
2. **Copy env file**: `copy .env.example .env`
3. **Add credentials** to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. **Update phone numbers** in `server/notificationService.js` (line 23)
5. **Verify your number** in Twilio Console (trial accounts)

## Test Commands

```bash
# Start server
npm run server

# Test SMS (command line)
node test-sms.js 1 sms

# Test WhatsApp
node test-sms.js 1 whatsapp

# Test via API
curl -X POST http://localhost:8080/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"buildingId": 1, "type": "sms"}'
```

## Test UI

Open `test-sms.html` in browser → Select building → Click "Send SMS"

## Files

| File | Purpose |
|------|---------|
| `.env` | Twilio credentials (create from `.env.example`) |
| `server/notificationService.js` | SMS/WhatsApp logic |
| `test-sms.js` | Command line test script |
| `test-sms.html` | Web UI for testing |
| `SMS_QUICK_SETUP.md` | 5-minute setup guide |
| `TWILIO_SETUP.md` | Full production guide |
| `SMS_DEMO_CHECKLIST.md` | Demo preparation checklist |

## Automatic Triggers

SMS sent automatically when:
- Wastage > 20% over baseline (warning)
- Wastage > 30% over baseline (critical)
- HVAC fault detected
- Rate limited: 1 per building per 15 minutes

## Message Format

```
🚨 High wastage in Engineering: 25.3% over baseline 
(150.2 kWh vs 120 kWh baseline). 
Check HVAC/lighting systems. 
Dashboard: https://campus.edu/energy
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Authentication Error" | Check Account SID and Auth Token in `.env` |
| "Permission Denied" | Verify phone number in Twilio Console |
| "Invalid Phone Number" | Use E.164 format: `+1234567890` |
| Not receiving SMS | Check Twilio Console → Monitor → Logs |
| Rate limited | Wait 15 min or restart server |

## Cost

- **Trial**: $15 free credit (~1,900 SMS)
- **Production**: $0.0079 per SMS
- **Example**: 7 buildings × 10 alerts/day = $17/month

## Demo Tips

1. **Before demo**: Test with `node test-sms.js 1 sms`
2. **During demo**: Use `test-sms.html` or command line
3. **Show**: Your phone receiving the SMS in real-time
4. **Backup**: Show console logs if SMS fails

## Quick Links

- Twilio Console: https://console.twilio.com
- Message Logs: Console → Monitor → Logs → Messaging
- Buy Number: Console → Phone Numbers → Buy a number
- Verify Number: Console → Phone Numbers → Verified Caller IDs

## Support

- Setup issues: See `SMS_QUICK_SETUP.md`
- Production: See `TWILIO_SETUP.md`
- Demo prep: See `SMS_DEMO_CHECKLIST.md`
- Twilio help: help@twilio.com

---

**Ready to send real SMS! 🚀**
