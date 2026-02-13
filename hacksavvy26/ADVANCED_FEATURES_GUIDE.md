# 🚀 Advanced Monitoring Features - Complete Guide

## ✅ What's Been Implemented

### 1. Surge Detection with 3-Minute Delay
- Alerts trigger ONLY after power surge sustains for 180+ seconds (3 minutes)
- Prevents false alarms from temporary spikes
- Tracks surge duration and peak power
- SMS notifications sent only for sustained surges

### 2. 1-Minute Update Intervals
- Dashboard updates every 1 minute (not 3 seconds)
- Power consumption data aggregated over 1-minute periods
- More stable and meaningful metrics
- Reduces noise from momentary fluctuations

### 3. Dynamic Threshold Controls
Located in **Analytics Tab** → **Threshold Configuration Panel**

#### Morning Period (6AM - 6PM)
- Warning Threshold: Adjustable (default 150 kW)
- Critical Threshold: Adjustable (default 200 kW)

#### Night Period (6PM - 6AM)
- Warning Threshold: Adjustable (default 100 kW)
- Critical Threshold: Adjustable (default 150 kW)

#### Real-Time Updates
- Change thresholds instantly via input boxes
- Alerts and charts update immediately
- No page refresh needed

### 4. Adaptive Threshold Mode
- Toggle: "🤖 Use Adaptive Thresholds" checkbox
- Automatically calculates thresholds from historical data
- Sensitivity Multiplier: 1.0x (conservative) to 2.0x (aggressive)
- Based on previous day's average and maximum power

### 5. Historical Data Display
Shows for both Morning and Night periods:
- Average power consumption
- Maximum power consumption
- Updates in real-time as system collects data

### 6. Current Period Indicator
- Shows whether it's currently Morning (☀️) or Night (🌙)
- Displays active time range
- Highlights which thresholds are currently in effect

## 📊 How to Use

### Access the Controls
1. Start your dashboard: `npm run dev`
2. Click the **📈 Analytics** tab
3. See **⚙️ Threshold Configuration** panel at the top

### Adjust Thresholds Manually
1. Type new values in the input boxes
2. Changes apply instantly
3. Watch the "Currently Active Thresholds" section update

### Enable Adaptive Mode
1. Check the "🤖 Use Adaptive Thresholds" box
2. Adjust the sensitivity multiplier slider
3. System calculates thresholds automatically
4. Based on historical averages × multiplier

### Monitor Historical Data
- View "📈 Historical Data (Previous Day)" section
- See morning and night averages/maximums
- Data updates as the system runs

## 🔧 Technical Details

### Backend Architecture

#### advancedMonitoringService.js
- Tracks power readings every 3 seconds
- Maintains 60-second rolling history per building
- Detects sustained surges (all readings > threshold for 60s)
- Calculates 1-minute aggregated power
- Manages morning/night thresholds
- Computes adaptive thresholds from historical stats

#### API Endpoints
```
GET  /api/monitoring/config          - Get current configuration
POST /api/monitoring/thresholds      - Update thresholds
POST /api/monitoring/adaptive        - Toggle adaptive mode
GET  /api/monitoring/history/:id     - Get power history
```

### Frontend Components

#### ThresholdControls.jsx
- Real-time threshold management UI
- Adaptive mode controls
- Historical data visualization
- Period indicator
- Info tooltips

### Data Flow

```
1. Server collects power every 3 seconds
   ↓
2. advancedMonitoringService records reading
   ↓
3. Checks if surge sustained for 60+ seconds
   ↓
4. If yes → Trigger alert & send SMS
   ↓
5. Aggregate data over 1 minute
   ↓
6. Send to client every 1 minute
   ↓
7. Dashboard updates with new data
```

## 🎯 Key Features Summary

| Feature | Description | Benefit |
|---------|-------------|---------|
| 1-Min Surge Detection | Alerts only after 60s sustained high power | Prevents false alarms |
| 1-Min Updates | Dashboard refreshes every minute | Stable, meaningful data |
| Morning/Night Thresholds | Separate limits for day/night | Accounts for usage patterns |
| Adaptive Mode | Auto-calculates from history | Self-adjusting system |
| Real-Time Controls | Instant threshold updates | No restart needed |
| Historical Stats | Shows previous day data | Informed decision making |

## 📱 SMS Integration

Surge alerts integrate with existing SMS system:
- SMS sent when surge sustained for 60+ seconds
- Includes building name, power level, threshold exceeded
- Rate limited (1 per building per 15 minutes)
- Works with both manual and adaptive thresholds

## 🎨 UI Features

### Visual Indicators
- ☀️ Morning period badge (orange gradient)
- 🌙 Night period badge (dark gradient)
- ⚠️ Warning threshold (yellow)
- 🚨 Critical threshold (red)
- 🤖 Adaptive mode badge (purple gradient)

### Interactive Controls
- Number inputs for thresholds
- Checkbox for adaptive mode
- Slider for sensitivity multiplier
- Real-time value display
- Info tooltips

## 🔍 Monitoring Dashboard

### What You See
1. **Current Period**: Morning or Night with time range
2. **Threshold Inputs**: Separate for morning/night, warning/critical
3. **Adaptive Controls**: Toggle and multiplier slider
4. **Active Thresholds**: Currently in effect (manual or adaptive)
5. **Historical Data**: Previous day's averages and maximums
6. **Info Box**: How the system works

### Color Coding
- **Orange**: Morning period
- **Dark Gray**: Night period
- **Yellow**: Warning thresholds
- **Red**: Critical thresholds
- **Purple**: Adaptive mode
- **Blue**: Info/help

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   npm run server
   ```

2. **Start the dashboard**:
   ```bash
   npm run dev
   ```

3. **Navigate to Analytics tab**

4. **Try it out**:
   - Change morning warning to 180 kW
   - Enable adaptive mode
   - Adjust multiplier to 1.8x
   - Watch thresholds update in real-time

## 📈 Example Scenarios

### Scenario 1: Manual Thresholds
- Set morning warning: 150 kW
- Set morning critical: 200 kW
- Set night warning: 100 kW
- Set night critical: 150 kW
- System uses these fixed values

### Scenario 2: Adaptive Mode (Conservative)
- Enable adaptive mode
- Set multiplier: 1.2x
- If morning average was 120 kW:
  - Warning: 120 × 1.2 = 144 kW
  - Critical: 144 × 1.5 = 216 kW (or max × 1.2, whichever is lower)

### Scenario 3: Adaptive Mode (Aggressive)
- Enable adaptive mode
- Set multiplier: 1.8x
- If morning average was 120 kW:
  - Warning: 120 × 1.8 = 216 kW
  - Critical: 216 × 1.5 = 324 kW (or max × 1.8, whichever is lower)

## 🎓 Best Practices

1. **Start with Manual Mode**: Set reasonable thresholds based on your campus
2. **Collect Data**: Run for 24 hours to gather historical stats
3. **Enable Adaptive**: Switch to adaptive mode after collecting data
4. **Tune Multiplier**: Start at 1.5x, adjust based on alert frequency
5. **Monitor Alerts**: Check if you're getting too many or too few alerts
6. **Adjust Accordingly**: Fine-tune multiplier or switch back to manual

## 🐛 Troubleshooting

### Thresholds Not Updating
- Check server is running
- Check browser console for errors
- Verify API endpoint is accessible

### Adaptive Mode Not Working
- Ensure system has run for at least 1 hour
- Check historical stats show non-zero values
- Try refreshing the page

### Alerts Not Triggering
- Verify power exceeds threshold for 60+ seconds
- Check current period (morning vs night)
- Confirm thresholds are set correctly

## 📝 Configuration Files

### Server Files
- `server/advancedMonitoringService.js` - Core monitoring logic
- `server/enhancedServer.js` - API endpoints and WebSocket
- `server/loadEnv.js` - Environment configuration

### Frontend Files
- `src/components/ThresholdControls.jsx` - UI component
- `src/components/ThresholdControls.css` - Styling
- `src/App.jsx` - Integration point

## 🎉 You're All Set!

The advanced monitoring system is fully implemented and ready to use. Navigate to the Analytics tab to start configuring your thresholds!

---

**Need Help?** Check the info box in the Threshold Configuration panel for quick tips.
