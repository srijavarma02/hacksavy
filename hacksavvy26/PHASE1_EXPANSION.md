# 🚀 Smart Campus Dashboard - Phase 1 Expansion

## Overview
Enhanced Smart Campus Energy Dashboard with historical analytics, AI-powered anomaly detection, automated SMS/WhatsApp notifications, and comprehensive sustainability metrics.

## 🎯 New Features

### 1. Historical Analytics Dashboard
- **Trend Charts**: Daily/weekly/seasonal consumption patterns
- **Consumption Heatmaps**: 24x7 hourly consumption visualization
- **Baseline Comparisons**: Actual vs baseline energy usage
- **Wastage Tracking**: Real-time wastage percentage and cost impact
- **AI Insights**: ML-generated recommendations and patterns

### 2. Smart Alert System
- **AI Anomaly Detection**: Z-score based statistical analysis
- **HVAC Fault Detection**: Automatic detection of HVAC malfunctions
- **Multi-level Alerts**: Critical, Warning, Info severity levels
- **Alert Filtering**: Filter by severity type
- **Acknowledgment System**: Track and manage alert responses

### 3. Automated Notifications (SMS/WhatsApp)
- **Threshold-Based Triggers**: >20% wastage triggers instant notifications
- **Per-Block Management**: Each building has assigned manager
- **Multi-Channel**: SMS and WhatsApp support (mock implementation)
- **Notification Log**: Complete audit trail of sent messages
- **Message Format**: 
  ```
  🚨 High wastage in [Block X]: [Y]% over baseline 
  ([Z] kWh). Check HVAC/lighting. 
  Dashboard: [short-link]
  ```

### 4. Sustainability Metrics
- **CO₂ Emissions**: Real-time carbon footprint tracking
- **Energy Intensity**: kWh/m² monitoring
- **Renewable Energy %**: Solar/wind contribution tracking
- **Net-Zero Progress**: 2030 target progress visualization
- **Emission Breakdown**: Scope 1, 2, 3 emissions
- **Cost Savings**: Daily savings vs baseline

### 5. ML Anomaly Detection
- **Statistical Analysis**: Z-score based detection (>2.5σ)
- **Pattern Recognition**: Identifies unusual consumption patterns
- **HVAC Fault Detection**: 
  - High power + low occupancy alerts
  - Equipment malfunction detection
- **Predictive Analytics**: Next-hour consumption prediction
- **Anomaly Scoring**: Confidence scores for each detection

## 📊 Technical Architecture

### Frontend Components
```
src/components/
├── HistoricalAnalytics.jsx    # Trend charts, heatmaps, comparisons
├── SmartAlerts.jsx             # AI-powered alert management
├── SustainabilityMetrics.jsx   # CO₂, renewable %, net-zero
├── MetricsGrid.jsx             # Real-time KPI cards
├── CampusMap.jsx               # Interactive building map
└── BuildingDetails.jsx         # Per-building analytics
```

### Backend Services
```
server/
├── enhancedServer.js           # Main server with REST + WebSocket
├── mlService.js                # ML anomaly detection engine
└── notificationService.js      # SMS/WhatsApp notification handler
```

### API Endpoints
- `GET /api/analytics/:buildingId?range=24h` - Historical data
- `GET /api/alerts` - All active alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/notifications` - Notification log
- `GET /api/sustainability` - Sustainability metrics
- `WebSocket ws://localhost:8080` - Real-time data stream

## 🔧 Configuration

### Wastage Thresholds
```javascript
wastageThresholds: {
  default: 20,    // 20% triggers warning + SMS
  critical: 30    // 30% triggers critical + escalation
}
```

### Block Managers
Each building has an assigned manager for notifications:
```javascript
blockManagers: {
  1: { name: 'John Doe', phone: '+91-9876543210' },
  2: { name: 'Jane Smith', phone: '+91-9876543211' },
  // ... more managers
}
```

### ML Detection Parameters
```javascript
baselineThresholds: {
  power: { mean: 100, stdDev: 20 },
  energy: { mean: 80, stdDev: 15 },
  water: { mean: 130, stdDev: 25 },
  gas: { mean: 3.5, stdDev: 0.8 }
}
```

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd hacksavvy26
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
This starts:
- Backend server on `http://localhost:8080`
- Frontend on `http://localhost:5173`

### 3. Production Build
```bash
npm run build
```

## 📱 Notification Integration

### Twilio SMS (Production)
```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE,
  to: recipientPhone
});
```

### WhatsApp Business API (Production)
```javascript
await client.messages.create({
  body: message,
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${recipientPhone}`
});
```

## 🎨 UI Features

### View Modes
1. **Overview**: Real-time monitoring + alerts
2. **Analytics**: Historical trends + heatmaps
3. **Sustainability**: CO₂, renewable %, net-zero progress

### Time Filters
- 15 Minutes
- 1 Hour
- 24 Hours
- 7 Days

### Interactive Elements
- Click buildings on map for details
- Hover heatmap cells for exact values
- Filter alerts by severity
- Acknowledge/escalate alerts

## 📈 Data Visualization

### Charts (Recharts)
- **Area Charts**: Energy consumption trends
- **Line Charts**: Baseline vs actual comparison
- **Heatmaps**: 24x7 consumption patterns
- **Gauge Charts**: Renewable energy percentage
- **Progress Bars**: Net-zero target progress

### Real-time Updates
- WebSocket connection for live data
- 3-second update interval
- Smooth animations and transitions

## 🔍 ML Insights Examples

```javascript
// Anomaly Detection
{
  isAnomaly: true,
  score: 3.2,
  severity: 'critical',
  expectedRange: { min: 60, max: 140 }
}

// HVAC Fault
{
  detected: true,
  type: 'hvac_overcooling',
  message: 'HVAC running at high capacity with low occupancy',
  recommendation: 'Adjust HVAC schedule or check thermostat'
}

// Wastage Alert
{
  wastagePercent: 25.3,
  actualKwh: 150.2,
  baselineKwh: 120.0,
  costImpact: 242.4  // ₹8 per kWh
}
```

## 🌟 Key Metrics Tracked

### Energy
- Total Power (kW)
- Energy Today (kWh)
- Peak Load
- Wastage %
- Energy Intensity (kWh/m²)

### Sustainability
- CO₂ Emissions (kg)
- Renewable Energy %
- Emission Reduction %
- Net-Zero Progress
- Scope 1/2/3 Emissions

### Operations
- Water Usage (L/min)
- Gas Flow (m³/h)
- Occupancy %
- HVAC Status
- Alert Count

## 🎯 Future Enhancements

### Phase 2 Roadmap
- [ ] TimescaleDB integration for time-series data
- [ ] Python ML microservice with scikit-learn
- [ ] Advanced ML models (LSTM, Prophet)
- [ ] Predictive maintenance alerts
- [ ] Energy optimization recommendations
- [ ] Mobile app (React Native)
- [ ] Multi-campus support
- [ ] Custom alert rules engine
- [ ] Integration with BMS systems
- [ ] Weather data correlation

## 📊 Demo Data

The system uses realistic mock data for demonstration:
- 7 campus buildings with unique characteristics
- Simulated consumption patterns (day/night cycles)
- Random anomalies and faults
- Historical data generation
- Realistic wastage scenarios

## 🔐 Security Considerations

### Production Deployment
- Secure WebSocket connections (WSS)
- API authentication (JWT)
- Rate limiting on notifications
- Encrypted notification credentials
- RBAC for alert management
- Audit logging

## 📞 Support & Documentation

### Resources
- API Documentation: `/api/docs`
- Component Storybook: `npm run storybook`
- Test Suite: `npm test`

### Contact
For questions or issues, contact the development team.

---

**Built with**: React, Node.js, WebSocket, Recharts, Express
**License**: MIT
**Version**: 2.0.0 (Phase 1 Expansion)
