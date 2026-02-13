# Dashboard Fix Summary

## Issue
The Analytics and Sustainability tabs were not displaying properly due to CSS grid layout constraints.

## Root Cause
The `.main-content` div had a fixed 2-column grid layout that was applied to ALL view modes, causing the full-width panels (Analytics, Sustainability, Reports) to be constrained into the grid columns instead of spanning the full width.

## Solution Applied
Added `grid-column: 1 / -1` to the `.full-width-panel` class in `App.css`. This CSS property makes the full-width panel span across all grid columns, allowing it to take up the entire width of the container.

## Server Configuration
Your application uses **TWO servers**:

1. **enhancedServer.js** (Port 3001) - **PRIMARY SERVER** ✅
   - Location: `hacksavvy26/server/enhancedServer.js`
   - Port: **3001**
   - Features:
     - WebSocket for real-time data
     - All API endpoints (analytics, sustainability, reports, monitoring, alerts, etc.)
     - ML service integration
     - Notification service
     - Report generation and export
   - **This is the server your React app connects to**

2. **index.js** (Port 8080) - **LEGACY SERVER** ⚠️
   - Location: `hacksavvy26/server/index.js`
   - Port: **8080**
   - This appears to be an older version
   - **NOT USED by the React app**

## How to Run the Application

### Step 1: Start the Server
```bash
cd hacksavvy26
node server/enhancedServer.js
```

You should see:
```
🚀 Enhanced Smart Campus Server running on port 3001
📊 WebSocket: ws://localhost:3001
```

### Step 2: Start the React App (in a new terminal)
```bash
cd hacksavvy26
npm run dev
```

The React app will start on `http://localhost:5173` (or another port if 5173 is busy)

## All Localhost Connections (Port 3001)

All React components connect to `http://localhost:3001`:

### Overview Tab
- WebSocket: `ws://localhost:3001` (real-time energy data)

### Analytics Tab
- `http://localhost:3001/api/analytics/{buildingId}?range={timeRange}`
- `http://localhost:3001/api/monitoring/config`
- `http://localhost:3001/api/monitoring/thresholds`
- `http://localhost:3001/api/monitoring/adaptive`
- `http://localhost:3001/api/alerts`
- `http://localhost:3001/api/notifications`

### Sustainability Tab
- `http://localhost:3001/api/sustainability`
- `http://localhost:3001/api/analytics/{buildingId}?range={timeRange}`
- `http://localhost:3001/api/monitoring/config`

### Reports Tab
- `http://localhost:3001/api/reports` (list reports)
- `http://localhost:3001/api/reports/generate` (generate new report)
- `http://localhost:3001/api/reports/{id}` (get specific report)
- `http://localhost:3001/api/reports/{id}/export/pdf` (export PDF)
- `http://localhost:3001/api/reports/{id}/export/csv` (export CSV)
- `http://localhost:3001/api/reports/config` (get/update configuration)

## Expected Behavior After Fix

### Overview Tab ✅
- Shows 2-column grid layout
- Left panel: Metrics grid + Campus map
- Right panel: Building details

### Analytics Tab ✅
- Shows full-width layout
- Threshold controls
- Historical analytics charts
- Smart alerts panel

### Sustainability Tab ✅
- Shows full-width layout
- Sustainability metrics
- Historical analytics charts

### Reports Tab ✅
- Shows full-width layout
- Report list or report detail view
- Generate, view, export, and configure reports

## Troubleshooting

### If tabs still don't work:

1. **Check if server is running:**
   ```bash
   # Should show server running on port 3001
   netstat -ano | findstr :3001
   ```

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for network errors or failed API calls
   - All API calls should go to `localhost:3001`

3. **Verify WebSocket connection:**
   - In browser console, you should see: "Connected to energy monitoring system"
   - If not, the server might not be running

4. **Clear browser cache:**
   - Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)

5. **Restart both server and React app:**
   ```bash
   # Terminal 1: Stop server (Ctrl+C) and restart
   node server/enhancedServer.js
   
   # Terminal 2: Stop React app (Ctrl+C) and restart
   npm run dev
   ```

## Files Modified
- `hacksavvy26/src/App.css` - Added `grid-column: 1 / -1` to `.full-width-panel`

## Files Verified (No Changes Needed)
- `hacksavvy26/src/App.jsx` - Correct viewMode routing
- `hacksavvy26/src/components/Header.jsx` - Correct navigation buttons
- All component files - All using correct port (3001)
