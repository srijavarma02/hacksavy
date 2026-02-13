# 📱 Quick SMS Setup for Demo (5 Minutes)

## Step 1: Get Twilio Account (2 minutes)

1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. Get **$15 free trial credit**

## Step 2: Get Your Credentials (1 minute)

1. Login to Twilio Console: https://console.twilio.com
2. Copy these from the dashboard:
   - **Account SID**: `ACxxxxx...`
   - **Auth Token**: Click "Show" and copy

## Step 3: Get a Phone Number (1 minute)

1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Choose any number with SMS capability
4. Click **Buy** (uses trial credit, no charge)
5. Copy your new number: `+1234567890`

## Step 4: Configure Your App (1 minute)

1. Copy the example env file:
   ```bash
   cd hacksavvy26
   copy .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx...
   TWILIO_AUTH_TOKEN=your_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **IMPORTANT**: Update `server/notificationService.js` line 23-29 with YOUR phone number:
   ```javascript
   this.blockManagers = {
     1: { name: 'Your Name', phone: '+1234567890', email: 'you@email.com' },
     // ... update with your real number
   };
   ```

## Step 5: Verify Your Phone (Trial Accounts Only)

1. Go to Twilio Console → **Phone Numbers** → **Verified Caller IDs**
2. Click **Add a new Caller ID**
3. Enter your phone number
4. Enter the verification code you receive
5. Done!

## Step 6: Test It!

1. Start the server:
   ```bash
   npm run server
   ```

2. You should see:
   ```
   ✅ Twilio initialized - Real SMS/WhatsApp enabled
   ```

3. Send a test SMS:
   ```bash
   curl -X POST http://localhost:8080/api/test-notification -H "Content-Type: application/json" -d "{\"buildingId\": 1, \"type\": \"sms\"}"
   ```

4. **Check your phone!** You should receive an SMS within seconds! 📱

## Demo Tips

### Trigger SMS During Demo

The system automatically sends SMS when:
- Energy wastage exceeds 20% over baseline
- HVAC faults are detected
- Rate limited to 1 message per building per 15 minutes

### Manual Test During Demo

Open a new terminal and run:
```bash
# Test SMS
curl -X POST http://localhost:8080/api/test-notification -H "Content-Type: application/json" -d "{\"buildingId\": 1, \"type\": \"sms\"}"

# Test WhatsApp (after joining sandbox)
curl -X POST http://localhost:8080/api/test-notification -H "Content-Type: application/json" -d "{\"buildingId\": 1, \"type\": \"whatsapp\"}"
```

### WhatsApp Setup (Optional, +2 minutes)

1. Go to Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Send `join [your-code]` to `+1 415 523 8886` from WhatsApp
3. Now you can receive WhatsApp alerts!

## Troubleshooting

### "Authentication Error"
- Double-check Account SID and Auth Token in `.env`
- Make sure there are no extra spaces

### "Permission Denied" or "Unverified Number"
- Verify your phone number in Twilio Console (trial accounts only)
- Use E.164 format: `+[country code][number]` (e.g., `+919876543210`)

### "Invalid Phone Number"
- Remove spaces and dashes: `+919876543210` not `+91-987-654-3210`
- Include country code with `+`

### Not Receiving SMS
- Check Twilio Console → **Monitor** → **Logs** → **Messaging**
- Verify phone number is correct in `notificationService.js`
- Check your phone's spam folder

## Cost

- **Trial**: $15 free credit (enough for ~1,900 SMS messages)
- **Production**: ~$0.0079 per SMS
- **Phone Number**: $1.15/month

For a 7-building campus with 10 alerts/day = ~$17/month

## What You Get

✅ Real SMS notifications to your phone
✅ Automatic alerts when wastage detected
✅ HVAC fault notifications
✅ Rate limiting (max 1 per building per 15 min)
✅ Notification log in dashboard
✅ Twilio delivery tracking

## Next Steps

- Add more phone numbers for different building managers
- Set up WhatsApp for cheaper messaging
- Customize alert thresholds
- Add email notifications
- Deploy to production

---

**You're ready to demo real SMS notifications! 🚀**

Check the full guide in `TWILIO_SETUP.md` for production deployment.
