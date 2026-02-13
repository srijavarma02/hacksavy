# Smart Campus Dashboard - Running Status

## ✅ System is Live!

### Backend Server
- **Status**: ✅ Running
- **URL**: http://localhost:3001
- **Port**: 3001
- **Features**:
  - Real-time building monitoring
  - ML anomaly detection
  - SMS/WhatsApp notifications via Twilio
  - **Daily Evaluation Reports** (NEW!)
  - Historical analytics
  - Sustainability metrics

### Frontend Dashboard
- **Status**: ✅ Running
- **URL**: http://localhost:3000
- **Port**: 3000 (Vite dev server)
- **Features**:
  - 📊 Overview - Real-time campus metrics
  - 📈 Analytics - Historical trends and insights
  - 🌱 Sustainability - Carbon footprint tracking
  - **📄 Reports - Daily evaluation reports** (NEW!)

## 🎉 Daily Evaluation Report Feature

### What Just Happened
A test report was successfully generated:
- **Report ID**: 2026-02-13-191310
- **Period**: Last 24 hours
- **Status**: ✅ Generated and stored

### How to Access Reports

1. **Open the Dashboard**: http://localhost:3000

2. **Navigate to Reports**:
   - Click the "📄 Reports" button in the header
   - You'll see the Reports view with:
     - List of all generated reports
     - Report details with charts and metrics
     - Export options (PDF/CSV)
     - Settings for scheduling and distribution

3. **Generate a New Report**:
   - Click "📄 Generate Report" button in the header
   - Report will be generated in ~5 seconds
   - Download links for PDF and CSV will appear

### Report Contents

Each report includes:
- **Summary Section**: Key metrics and highlights
- **Building Performance**: Per-building energy consumption and status
- **Alert Summary**: Critical alerts and response times
- **Anomaly Insights**: ML-detected unusual patterns
- **Sustainability Metrics**: Carbon footprint and efficiency scores
- **Trends & Comparisons**: Day-over-day and week-over-week changes
- **Recommendations**: Actionable insights for improvement
- **Charts & Visualizations**: Line charts, bar charts, and trend graphs

### API Endpoints Available

- `POST /api/reports/generate` - Generate new report
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/:id/export/pdf` - Download PDF
- `GET /api/reports/:id/export/csv` - Download CSV
- `POST /api/reports/:id/distribute` - Send via email/SMS
- `GET /api/reports/config` - Get configuration
- `PUT /api/reports/config` - Update configuration

## 🏢 Campus Buildings Monitored

1. Engineering
2. Science Lab
3. Library
4. Dorm A
5. Dorm B
6. Sports Center
7. Admin

## 📊 Real-Time Features

- **HTTP Polling**: Dashboard updates every 5 seconds
- **Live Metrics**: Power, energy, water, gas consumption
- **ML Anomaly Detection**: Isolation Forest algorithm
- **Smart Alerts**: Threshold-based notifications
- **HVAC Fault Detection**: Predictive maintenance
- **Surge Detection**: 3-minute sustained surge alerts

## 🔧 Troubleshooting

### If Backend Disconnects After Sleep
Run the restart script:
```cmd
restart-backend.bat
```

Or manually:
```cmd
taskkill /F /IM node.exe
cd hacksavvy26
node server/enhancedServer.js
```

### If Frontend Stops
```cmd
cd hacksavvy26
npx vite
```

## 📝 Next Steps

1. **View the Dashboard**: Open http://localhost:3000
2. **Click Reports Tab**: See the generated report
3. **Generate More Reports**: Use the "Generate Report" button
4. **Export Reports**: Download as PDF or CSV
5. **Configure Scheduling**: Set up automatic daily reports
6. **Add Recipients**: Configure email/SMS distribution

## 🎯 Key Features Demonstrated

✅ Automated report generation
✅ Data collection from all buildings
✅ ML anomaly insights integration
✅ Trend analysis and comparisons
✅ Actionable recommendations
✅ PDF/CSV export capability
✅ Email/SMS distribution ready
✅ Scheduling configuration
✅ React dashboard integration
✅ HTTP polling for reliability

---

**Enjoy your Smart Campus Energy Dashboard with Daily Evaluation Reports!** 🚀
