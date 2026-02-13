# ML Models Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd hacksavvy26
npm install
```

This will install the new `ml-random-forest` package along with existing dependencies.

### 2. Start the Server

```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 3. Access the Dashboard

Open your browser to: `http://localhost:5173`

### 4. View ML Models

1. Click on the **Analytics** tab in the header
2. The ML Model Status card will appear at the top
3. Wait ~10 minutes for models to collect 200+ data points and train

## What Was Added

### New Files Created

1. **`server/mlService.js`** - Enhanced ML service with:
   - Isolation Forest implementation for anomaly detection
   - Random Forest integration for predictions
   - Automatic model training
   - Feature extraction and preprocessing

2. **`src/components/MLModelStatus.jsx`** - React component showing:
   - Model training status
   - Real-time predictions
   - 24-hour forecasts
   - Detected anomalies

3. **`src/components/MLModelStatus.css`** - Styling for ML component

4. **`ML_MODELS_GUIDE.md`** - Comprehensive documentation

5. **`ML_SETUP_INSTRUCTIONS.md`** - This file

### Modified Files

1. **`package.json`** - Added `ml-random-forest` dependency

2. **`server/enhancedServer.js`** - Added:
   - ML model integration
   - New API endpoints for ML status, predictions, and anomalies
   - Automatic data collection for training

3. **`src/App.jsx`** - Added:
   - MLModelStatus component import
   - Integration in Analytics view

## New API Endpoints

### 1. Get Model Status
```
GET http://localhost:3001/api/ml/status
```

### 2. Get Predictions for Building
```
GET http://localhost:3001/api/ml/predict/:buildingId
```

### 3. Get All Anomalies
```
GET http://localhost:3001/api/ml/anomalies
```

## Features

### Isolation Forest (Anomaly Detection)
- 100 isolation trees
- Detects unusual consumption patterns
- Anomaly scores from 0-1
- Automatic severity classification (normal/warning/critical)

### Random Forest (Predictions)
- 50 decision tree estimators
- Predicts next hour consumption
- 24-hour ahead forecasts
- Confidence scores

### Automatic Training
- Collects data every 3 seconds
- Trains after 200 data points (~10 minutes)
- Retrains every 100 new points
- Continuous learning from live data

## Testing the Models

### 1. Check Model Status

Open in browser or use curl:
```bash
curl http://localhost:3001/api/ml/status
```

Expected response:
```json
{
  "trained": true,
  "dataPoints": 450,
  "isolationForest": {
    "trees": 100,
    "trained": true
  },
  "randomForest": {
    "available": true,
    "estimators": 50
  }
}
```

### 2. Get Predictions

```bash
curl http://localhost:3001/api/ml/predict/1
```

### 3. Check for Anomalies

```bash
curl http://localhost:3001/api/ml/anomalies
```

## UI Walkthrough

### Analytics Tab

1. **ML Model Status Card** (Top)
   - Shows training progress
   - Displays model status badges
   - Progress bar for data collection

2. **Power Predictions Card**
   - Building selector dropdown
   - Next hour prediction
   - 24-hour forecast mini-chart

3. **Detected Anomalies Card**
   - Lists all current anomalies
   - Shows severity badges
   - Displays deviation details
   - Indicates detection method

4. **Info Footer**
   - Explains Isolation Forest
   - Explains Random Forest

## Troubleshooting

### Models Not Training
**Symptom**: Status shows "Training..." or "Pending"
**Solution**: Wait 10 minutes for 200 data points to collect

### No Predictions
**Symptom**: Predictions show 0 or undefined
**Solution**: Ensure server is running and models are trained

### Server Won't Start
**Symptom**: Error when running `npm run server`
**Solution**: 
```bash
cd hacksavvy26
npm install
npm run server
```

### Port Already in Use
**Symptom**: "Port 3001 already in use"
**Solution**: Kill existing process or change port in `enhancedServer.js`

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start the server**: `npm run dev`
3. **Open dashboard**: Navigate to Analytics tab
4. **Wait for training**: ~10 minutes for full model training
5. **Explore features**: View predictions and anomalies

## Performance Notes

- **Initial 10 minutes**: Models use statistical fallback
- **After 200 points**: ML models fully active
- **After 1000 points**: High accuracy predictions
- **Continuous improvement**: Models retrain with new data

## Demo Tips

1. Start server 10 minutes before demo
2. Let models collect data and train
3. Show ML Model Status card first
4. Demonstrate predictions for different buildings
5. Point out any detected anomalies
6. Explain the 24-hour forecast chart

## Architecture

```
Frontend (React)
    ↓
MLModelStatus Component
    ↓
API Calls (fetch)
    ↓
Express Server (enhancedServer.js)
    ↓
ML Service (mlService.js)
    ├── Isolation Forest (Anomaly Detection)
    └── Random Forest (Predictions)
```

## Data Flow

1. **Collection**: Server collects building data every 3 seconds
2. **Storage**: Data stored in training array (last 1000 points)
3. **Training**: Models retrain every 100 new points
4. **Inference**: Real-time predictions and anomaly detection
5. **Display**: Results shown in UI via API

## Key Benefits

✅ **Automated Detection**: No manual threshold setting needed
✅ **Predictive Insights**: Plan ahead with 24-hour forecasts
✅ **Continuous Learning**: Models improve over time
✅ **Real-time Analysis**: Instant anomaly detection
✅ **Visual Feedback**: Clear UI showing model status

## Support

For detailed information, see `ML_MODELS_GUIDE.md`

For questions or issues:
1. Check server logs
2. Verify API endpoints
3. Review model status
4. Ensure sufficient training data
