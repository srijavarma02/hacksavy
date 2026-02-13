# Analytics & Sustainability Tabs Fix

## Issues Fixed

### 1. CSS Grid Layout Issue
**Problem**: The `.main-content` div had a fixed 2-column grid layout that constrained full-width panels.

**Solution**: Added `grid-column: 1 / -1` to `.full-width-panel` class in `App.css` to span all grid columns.

### 2. ThresholdControls Styling Issue
**Problem**: The ThresholdControls component had a white background with light-colored text, making it invisible on the dark theme.

**Solution**: Updated `ThresholdControls.css` to use dark theme colors:
- Changed background from `white` to `rgba(15, 23, 42, 0.6)` with backdrop blur
- Updated all text colors from dark (#333, #666) to light (#ccd6f6, #8892b0)
- Changed input backgrounds to dark with proper contrast
- Updated section backgrounds to use dark transparent colors

## How to Test

### Step 1: Start the Server
```bash
cd hacksavvy26
node server/enhancedServer.js
```

You should see:
```
🚀 Enhanced Smart Campus Server running on port 3001
📊 WebSocket: ws://localhost:3001
🔌 REST API: http://localhost:3001/api
```

### Step 2: Start the React App (in a new terminal)
```bash
cd hacksavvy26
npm run dev
```

### Step 3: Test the Tabs
1. Open the app in your browser (usually http://localhost:5173)
2. Click on the "📈 Analytics" tab
   - You should see:
     - Threshold Controls panel (dark themed)
     - Historical Analytics charts
     - Smart Alerts panel
3. Click on the "🌱 Sustainability" tab
   - You should see:
     - Sustainability metrics dashboard
     - Historical analytics charts

### Step 4: Verify API Endpoints (Optional)
Run the test script to verify all endpoints are working:
```bash
cd hacksavvy26
node test-analytics-api.js
```

## What Each Tab Should Display

### Analytics Tab
1. **Threshold Controls**
   - Morning/Night threshold configuration
   - Adaptive mode toggle
   - Current active thresholds
   - Historical data stats

2. **Historical Analytics**
   - Energy consumption trends (area chart)
   - Heatmap view (hourly consumption)
   - Baseline comparison (line chart with wastage)
   - Key insights cards

3. **Smart Alerts**
   - Recent alerts list
   - Alert filtering and acknowledgment

### Sustainability Tab
1. **Sustainability Metrics**
   - CO₂ emissions
   - Energy intensity
   - Renewable energy percentage (with circular gauge)
   - Cost savings
   - Net-zero progress bars
   - Emissions breakdown (Scope 1, 2, 3)

2. **Historical Analytics**
   - Same charts as Analytics tab

## Troubleshooting

### If tabs are still not visible:

1. **Check browser console for errors**
   - Press F12 to open DevTools
   - Look for red error messages
   - Common issues:
     - Network errors (server not running)
     - CORS errors (wrong port)
     - Component rendering errors

2. **Verify server is running on port 3001**
   ```bash
   netstat -ano | findstr :3001
   ```
   Should show a process listening on port 3001

3. **Check WebSocket connection**
   - In browser console, you should see: "Connected to energy monitoring system"
   - If not, the server might not be running

4. **Clear browser cache**
   - Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
   - Or clear cache in DevTools

5. **Check if components are rendering**
   - In browser DevTools, go to Elements tab
   - Look for `.full-width-panel` div
   - Check if it has `grid-column: 1 / -1` style applied

6. **Verify API responses**
   - In browser DevTools, go to Network tab
   - Click on Analytics tab
   - You should see requests to:
     - `/api/analytics/campus?range=24h`
     - `/api/monitoring/config`
   - Click on each request to see the response

### If data is not loading:

1. **Check server logs**
   - Look at the terminal where the server is running
   - You should see API requests being logged

2. **Test API endpoints directly**
   - Open in browser: http://localhost:3001/api/analytics/campus?range=24h
   - Should return JSON data with trendData, heatmapData, insights

3. **Check for rate limiting or errors**
   - Server might be returning errors
   - Check server terminal for error messages

## Files Modified

1. `hacksavvy26/src/App.css`
   - Added `grid-column: 1 / -1` to `.full-width-panel`

2. `hacksavvy26/src/components/ThresholdControls.css`
   - Changed background from white to dark theme
   - Updated all text colors for dark theme
   - Updated input and section backgrounds

## API Endpoints Used

### Analytics Tab
- `GET /api/analytics/:buildingId?range=24h` - Historical data
- `GET /api/monitoring/config` - Threshold configuration
- `POST /api/monitoring/thresholds` - Update thresholds
- `POST /api/monitoring/adaptive` - Update adaptive mode
- `GET /api/alerts` - Get alerts list
- `GET /api/notifications` - Get notification log

### Sustainability Tab
- `GET /api/sustainability` - Sustainability metrics
- `GET /api/analytics/:buildingId?range=24h` - Historical data
- `GET /api/monitoring/config` - Monitoring configuration

## Next Steps

If the tabs are still not working after these fixes:
1. Share the browser console errors
2. Share the Network tab showing failed requests
3. Share the server terminal output
4. Check if there are any JavaScript errors preventing rendering
