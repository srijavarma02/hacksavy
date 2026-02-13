# ⚡ Smart Campus Energy Dashboard - Phase 1 Expansion

Real-time energy monitoring system with AI-powered anomaly detection, automated SMS/WhatsApp notifications, historical analytics, and comprehensive sustainability tracking.

## 🌟 Key Features

### Real-Time Monitoring
- Live energy consumption tracking across 7 campus buildings
- WebSocket-based updates every 3 seconds
- Interactive campus map with building status visualization
- Per-building zone-level consumption breakdown
- Water, gas, and power metrics

### AI-Powered Smart Alerts
- **ML Anomaly Detection**: Z-score based statistical analysis (>2.5σ)
- **HVAC Fault Detection**: Automatic identification of equipment malfunctions
- **Pattern Recognition**: Identifies unusual consumption patterns
- **Multi-level Severity**: Critical, Warning, Info classifications
- **Anomaly Scoring**: Confidence scores for each detection

### Automated Notifications
- **SMS/WhatsApp Integration**: Instant alerts via Twilio
- **Threshold-Based Triggers**: >20% wastage triggers automatic notifications
- **Per-Block Managers**: Each building has assigned contact
- **Notification Log**: Complete audit trail of all messages
- **Rate Limiting**: Smart throttling to prevent notification spam

### Historical Analytics
- **Trend Charts**: Daily/weekly/seasonal consumption patterns
- **Consumption Heatmaps**: 24x7 hourly visualization
- **Baseline Comparisons**: Actual vs expected usage analysis
- **Wastage Tracking**: Real-time wastage % and cost impact
- **AI Insights**: ML-generated recommendations

### Sustainability Metrics
- **CO₂ Emissions**: Real-time carbon footprint tracking
- **Energy Intensity**: kWh/m² monitoring
- **Renewable Energy**: Solar/wind contribution tracking (%)
- **Net-Zero Progress**: 2030 target visualization
- **Emission Breakdown**: Scope 1, 2, 3 analysis
- **Cost Savings**: Daily savings vs baseline

## 🚀 Quick Start

### Installation
```bash
cd hacksavvy26
npm install
```

### Run Development Server
```bash
npm run dev
```

Access the dashboard at: **http://localhost:5173**

### Setup Real SMS Notifications (Optional, 5 minutes)

Want to receive real SMS during demos? Follow the [SMS Quick Setup Guide](SMS_QUICK_SETUP.md):

1. Sign up at Twilio (get $15 free credit)
2. Copy `.env.example` to `.env` and add your credentials
3. Update phone numbers in `server/notificationService.js`
4. Test: `node test-sms.js 1 sms`

See [SMS_QUICK_SETUP.md](SMS_QUICK_SETUP.md) for step-by-step instructions or [TWILIO_SETUP.md](TWILIO_SETUP.md) for full production guide.

### Production Build
```bash
npm run build
node server/enhancedServer.js
```

## 📊 Architecture

### Frontend
- **React 18**: Modern UI framework
- **Recharts**: Data visualization library
- **WebSocket**: Real-time data streaming
- **Responsive Design**: Works on desktop, tablet, mobile

### Backend
- **Node.js + Express**: REST API server
- **WebSocket Server**: Real-time data push
- **ML Service**: Anomaly detection engine
- **Notification Service**: SMS/WhatsApp handler

### Data Flow
```
Sensors → Backend → ML Analysis → Alerts → Notifications
                  ↓
              WebSocket → Frontend → User
```

## 🎯 Use Cases

1. **Energy Managers**: Monitor campus-wide consumption in real-time
2. **Facility Teams**: Receive instant HVAC fault alerts
3. **Sustainability Officers**: Track CO₂ emissions and renewable %
4. **Building Managers**: Get SMS alerts for high wastage in their buildings
5. **Administrators**: View historical trends and cost savings

## 📱 Notification System

### Alert Message Format
```
🚨 High wastage in Engineering: 25.3% over baseline 
(150.2 kWh vs 120 kWh baseline). 
Check HVAC/lighting systems. 
Dashboard: https://campus.edu/energy
```

### Trigger Conditions
- Wastage >20%: Warning + SMS notification
- Wastage >30%: Critical + immediate escalation
- HVAC fault detected: Instant SMS to building manager
- ML anomaly (Z-score >2.5): Alert logged + optional notification

## 🔧 Configuration

### Wastage Thresholds
Edit `server/notificationService.js`:
```javascript
wastageThresholds: {
  default: 20,    // 20% triggers warning
  critical: 30    // 30% triggers critical
}
```

### Block Managers
```javascript
blockManagers: {
  1: { name: 'John Doe', phone: '+91-9876543210' },
  2: { name: 'Jane Smith', phone: '+91-9876543211' }
}
```

### ML Sensitivity
Edit `server/mlService.js`:
```javascript
const isAnomaly = zScore > 2.5; // Lower = more sensitive
```

## 📈 API Endpoints

- `GET /api/analytics/:buildingId?range=24h` - Historical analytics
- `GET /api/alerts` - All active alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/notifications` - Notification log
- `GET /api/sustainability` - Sustainability metrics
- `WebSocket ws://localhost:8080` - Real-time data stream

## 🌱 Sustainability Features

- Real-time CO₂ emissions tracking
- Renewable energy percentage monitoring
- Net-zero 2030 progress visualization
- Energy intensity (kWh/m²) metrics
- Scope 1/2/3 emission breakdown
- Daily cost savings calculations

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)**: Get up and running in 5 minutes
- **[Phase 1 Expansion](PHASE1_EXPANSION.md)**: Detailed feature documentation
- **[Demo Script](DEMO_SCRIPT.md)**: Video walkthrough guide
- **[Twilio Setup](TWILIO_SETUP.md)**: SMS/WhatsApp integration guide

## 🎬 Demo Video

Follow the [Demo Script](DEMO_SCRIPT.md) to create a professional walkthrough showcasing:
- Real-time monitoring
- AI anomaly detection
- Automated notifications
- Historical analytics
- Sustainability tracking

## 🔐 Production Deployment

### Environment Variables
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
NODE_ENV=production
PORT=8080
```

### Twilio Integration
See [TWILIO_SETUP.md](TWILIO_SETUP.md) for complete setup instructions.

## 🛠️ Tech Stack

- **Frontend**: React 18, Recharts, WebSocket, CSS3
- **Backend**: Node.js, Express, WebSocket Server
- **ML**: Statistical analysis, Z-score anomaly detection
- **Notifications**: Twilio (SMS + WhatsApp)
- **Data Viz**: Recharts (Area, Line, Heatmap, Gauge charts)

## 📊 Key Metrics

- 7 buildings monitored
- 3-second real-time updates
- >20% wastage threshold
- Z-score >2.5 anomaly detection
- 24/7 heatmap visualization
- Instant SMS/WhatsApp alerts
- 50+ alerts logged

## 🎯 Future Roadmap (Phase 2)

- [ ] TimescaleDB for time-series data
- [ ] Python ML microservice (scikit-learn, Prophet)
- [ ] Advanced LSTM models for prediction
- [ ] Predictive maintenance alerts
- [ ] Mobile app (React Native)
- [ ] Multi-campus support
- [ ] Custom alert rules engine
- [ ] BMS system integration
- [ ] Weather data correlation

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- Documentation: See documentation files
- Issues: GitHub Issues
- Email: support@campus.edu

---

**Built with ❤️ for sustainable campus energy management**
