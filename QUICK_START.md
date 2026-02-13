# 🚀 Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

## Installation

### Step 1: Install Dependencies
```bash
cd hacksavvy26
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

This command starts:
- **Backend Server**: http://localhost:8080
- **Frontend App**: http://localhost:5173

### Step 3: Open in Browser
Navigate to: **http://localhost:5173**

## 🎯 What You'll See

### Overview Tab (Default)
- **Real-time Metrics**: Power, Energy, Water, Gas
- **Campus Map**: Interactive building visualization
- **Smart Alerts**: AI-detected anomalies and faults
- **Building Details**: Per-building consumption charts

### Analytics Tab
- **Trend Charts**: 24-hour consumption patterns
- **Heatmaps**: Hourly consumption visualization
- **Baseline Comparison**: Actual vs expected usage
- **Wastage Analysis**: Cost impact calculations
- **AI Insights**: ML-generated recommendations

### Sustainability Tab
- **CO₂ Emissions**: Real-time carbon tracking
- **Renewable Energy**: Solar/wind contribution
- **Net-Zero Progress**: 2030 target visualization
- **Energy Intensity**: kWh/m² metrics
- **Emission Breakdown**: Scope 1/2/3 analysis

## 🔔 Testing Notifications

### Trigger High Wastage Alert
The system automatically generates alerts when:
- Energy consumption exceeds baseline by >20%
- HVAC faults are detected
- Anomalies are identified by ML

### View Notification Log
1. Go to **Analytics** or **Overview** tab
2. Scroll to **Smart Alerts** section
3. Check **Notification Log** at bottom
4. See SMS/WhatsApp messages sent to block managers

## 🎮 Interactive Features

### Click on Buildings
- Select any building on the campus map
- View detailed consumption charts
- See zone-level breakdowns
- Check occupancy and temperature

### Filter Alerts
- Click **All**, **Critical**, **Warning**, or **Info**
- Acknowledge alerts with action buttons
- View ML anomaly scores

### Switch Time Ranges
- Use **15 Min**, **1 Hour**, **24 Hours**, **7 Days** buttons
- Charts update automatically
- Historical data loads dynamically

## 📊 Understanding the Data

### Color Coding
- 🟢 **Green**: Normal operation, good performance
- 🟡 **Yellow**: Warning, attention needed
- 🔴 **Red**: Critical, immediate action required

### Alert Icons
- 🚨 High wastage detected
- 🔧 HVAC fault
- ⚠️ Anomaly detected
- ✅ Efficiency improvement
- ℹ️ Informational

### Metrics Explained
- **Total Power**: Current campus-wide consumption (kW)
- **Energy Today**: Cumulative daily usage (kWh)
- **Wastage %**: Excess consumption over baseline
- **CO₂ Emissions**: Carbon footprint (kg)
- **Renewable %**: Clean energy contribution

## 🔧 Configuration

### Modify Wastage Thresholds
Edit `server/notificationService.js`:
```javascript
wastageThresholds: {
  default: 20,    // Change warning threshold
  critical: 30    // Change critical threshold
}
```

### Update Block Managers
Edit `server/notificationService.js`:
```javascript
blockManagers: {
  1: { name: 'Your Name', phone: '+91-XXXXXXXXXX' }
}
```

### Adjust ML Sensitivity
Edit `server/mlService.js`:
```javascript
const isAnomaly = zScore > 2.5; // Lower = more sensitive
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
npx kill-port 8080

# Or change port in server/enhancedServer.js
const PORT = 8081;
```

### WebSocket Connection Failed
- Check if backend server is running
- Verify port 8080 is accessible
- Check browser console for errors

### Charts Not Displaying
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Missing Dependencies
```bash
npm install axios recharts date-fns twilio
```

## 📱 Production Deployment

### Environment Variables
Create `.env` file:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE=+1234567890
WHATSAPP_NUMBER=+1234567890
```

### Build for Production
```bash
npm run build
```

### Deploy Backend
```bash
node server/enhancedServer.js
```

## 🎓 Learning Resources

### Key Files to Explore
- `src/App.jsx` - Main application structure
- `server/enhancedServer.js` - Backend API + WebSocket
- `server/mlService.js` - ML anomaly detection
- `server/notificationService.js` - SMS/WhatsApp handler
- `src/components/HistoricalAnalytics.jsx` - Charts & analytics
- `src/components/SmartAlerts.jsx` - Alert management

### Technologies Used
- **React 18**: Frontend framework
- **Recharts**: Data visualization
- **WebSocket**: Real-time communication
- **Express**: Backend API
- **Node.js**: Server runtime

## 💡 Tips

1. **Best Performance**: Use Chrome or Edge browser
2. **Mobile View**: Responsive design works on tablets/phones
3. **Data Refresh**: WebSocket updates every 3 seconds
4. **Alert Throttling**: Notifications throttled to prevent spam
5. **Historical Data**: Generated on-demand for demo purposes

## 🎉 Next Steps

1. Explore all three view modes (Overview, Analytics, Sustainability)
2. Click different buildings to see their details
3. Watch alerts appear in real-time
4. Check notification log for SMS/WhatsApp messages
5. Try different time ranges (15m, 1h, 24h, 7d)
6. Review the AI insights and recommendations

## 📞 Need Help?

- Check `PHASE1_EXPANSION.md` for detailed documentation
- Review code comments in source files
- Open browser DevTools console for debug info

---

**Enjoy your Smart Campus Dashboard! 🌟**
