# Machine Learning Models Guide

## Overview

The Smart Campus Energy Dashboard now includes two powerful ML models:

1. **Isolation Forest** - For anomaly detection
2. **Random Forest** - For power consumption prediction

## Models Description

### Isolation Forest (Anomaly Detection)

The Isolation Forest algorithm detects anomalies by isolating outliers in the data. It works by:
- Building multiple isolation trees with random splits
- Calculating path lengths for each data point
- Points with shorter paths are more likely to be anomalies
- Returns an anomaly score (0-1) where higher scores indicate anomalies

**Features used:**
- Power consumption
- Energy usage
- Water usage
- Gas flow
- Occupancy level
- Temperature
- Hour of day
- Day of week

**Thresholds:**
- Score > 0.7: Critical anomaly
- Score > 0.6: Warning
- Score ≤ 0.6: Normal

### Random Forest (Prediction)

The Random Forest regressor predicts future power consumption based on historical patterns:
- Ensemble of 50 decision trees
- Uses 80% of features for each tree
- Trained on historical consumption data
- Provides predictions for next hour and 24-hour forecast

**Features used:**
- Current power, energy, water, gas
- Occupancy and temperature
- Time features (hour, day of week)

## Installation

1. Install the required ML library:
```bash
cd hacksavvy26
npm install
```

The `ml-random-forest` package is already added to package.json.

## How It Works

### Training Process

1. **Data Collection**: The system collects data every 3 seconds from all buildings
2. **Feature Extraction**: Extracts 8 features from each data point
3. **Automatic Training**: Models retrain every 100 data points (minimum 200 points needed)
4. **Continuous Learning**: Models improve as more data is collected

### Training Timeline

- **0-200 data points**: Using statistical fallback methods
- **200+ data points**: ML models fully trained and active
- **Every 100 points**: Models retrain with latest data

At 3-second intervals:
- 200 points = ~10 minutes of data
- 1000 points = ~50 minutes of data

## API Endpoints

### Get Model Status
```
GET http://localhost:3001/api/ml/status
```

Response:
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

### Get Predictions
```
GET http://localhost:3001/api/ml/predict/:buildingId
```

Response:
```json
{
  "buildingId": 1,
  "buildingName": "Engineering",
  "nextHour": 125.5,
  "predictions24h": [
    { "hour": 14, "predicted": 125.5, "confidence": 0.85 },
    { "hour": 15, "predicted": 130.2, "confidence": 0.85 }
  ],
  "modelStatus": { ... }
}
```

### Get Anomalies
```
GET http://localhost:3001/api/ml/anomalies
```

Response:
```json
{
  "anomalies": [
    {
      "buildingId": 2,
      "buildingName": "Science Lab",
      "current": 180.5,
      "predicted": 110.2,
      "deviation": 70.3,
      "isAnomaly": true,
      "score": 0.75,
      "severity": "critical",
      "method": "isolation_forest"
    }
  ],
  "all": [ ... ],
  "modelStatus": { ... }
}
```

## UI Components

### ML Model Status Component

Located in the Analytics view, displays:
- Model training status
- Number of data points collected
- Real-time predictions for selected building
- 24-hour forecast visualization
- Detected anomalies with details

**Access**: Dashboard → Analytics Tab → ML Models section (top)

## Features

### Anomaly Detection
- Detects unusual power consumption patterns
- Identifies HVAC faults and malfunctions
- Alerts for high wastage scenarios
- Real-time anomaly scoring

### Predictions
- Next hour power consumption forecast
- 24-hour ahead predictions
- Confidence scores for each prediction
- Building-specific forecasts

### Insights Generation
- Automatic insight generation based on patterns
- Recommendations for energy optimization
- Trend analysis and alerts

## Model Performance

### Isolation Forest
- **Trees**: 100 isolation trees
- **Sample Size**: 256 points per tree
- **Detection Rate**: High sensitivity to outliers
- **False Positive Rate**: Low (threshold tuned to 0.6)

### Random Forest
- **Estimators**: 50 decision trees
- **Feature Usage**: 80% per tree
- **Prediction Accuracy**: Improves with more data
- **Confidence**: 85% with 200+ training points

## Fallback Mechanisms

If models are not yet trained (< 200 data points):
- **Anomaly Detection**: Uses Z-score statistical method
- **Predictions**: Uses moving average of recent values
- **Confidence**: Lower (60%) until models are trained

## Monitoring

### Check Model Status
1. Open dashboard
2. Go to Analytics tab
3. View ML Model Status card at top
4. Check training progress bar

### View Predictions
1. Select a building from dropdown
2. View next hour prediction
3. See 24-hour forecast chart

### Review Anomalies
1. Scroll to Detected Anomalies section
2. View all current anomalies
3. Check severity and deviation details

## Troubleshooting

### Models Not Training
- **Issue**: Models show "Pending" status
- **Solution**: Wait for 200+ data points (~10 minutes)
- **Check**: Verify server is running and collecting data

### No Predictions Available
- **Issue**: Predictions show as 0 or undefined
- **Solution**: Ensure models are trained (200+ points)
- **Check**: API endpoint `/api/ml/status` for training status

### High False Positives
- **Issue**: Too many anomalies detected
- **Solution**: Threshold can be adjusted in `mlService.js`
- **Default**: 0.6 (increase to 0.7 for fewer alerts)

## Advanced Configuration

### Adjust Anomaly Threshold

Edit `hacksavvy26/server/mlService.js`:

```javascript
// In IsolationForest class, predict method
predict(point, threshold = 0.6) {  // Change 0.6 to 0.7 for stricter detection
  const score = this.anomalyScore(point);
  return {
    isAnomaly: score > threshold,
    // ...
  };
}
```

### Adjust Training Frequency

Edit `hacksavvy26/server/mlService.js`:

```javascript
// In addTrainingData method
if (this.trainingData.length % 100 === 0) {  // Change 100 to desired frequency
  this.trainModels();
}
```

### Adjust Model Parameters

```javascript
// Isolation Forest
this.isolationForest = new IsolationForest(100, 256);  // (numTrees, sampleSize)

// Random Forest
this.randomForest = new RandomForestRegression({
  nEstimators: 50,      // Number of trees
  maxFeatures: 0.8,     // Feature sampling ratio
  replacement: true,
  seed: 42
});
```

## Best Practices

1. **Let Models Train**: Wait at least 10 minutes for initial training
2. **Monitor Progress**: Check training progress in ML Status card
3. **Review Anomalies**: Investigate detected anomalies promptly
4. **Use Predictions**: Plan energy usage based on forecasts
5. **Continuous Operation**: Keep server running for continuous learning

## Performance Tips

- Models improve accuracy over time with more data
- First 200 points use fallback methods (less accurate)
- After 1000 points, models are highly accurate
- Retraining every 100 points keeps models current
- Historical patterns improve prediction quality

## Integration with Alerts

ML models integrate with the alert system:
- Anomalies trigger automatic alerts
- Critical anomalies send SMS notifications
- HVAC faults detected by ML generate maintenance alerts
- Predictions used for proactive energy management

## Future Enhancements

Potential improvements:
- LSTM networks for time-series prediction
- Gradient boosting for better accuracy
- Feature importance analysis
- Model explainability (SHAP values)
- Automated hyperparameter tuning
- Multi-building correlation analysis

## Support

For issues or questions:
1. Check model status via API
2. Review server logs for errors
3. Verify data collection is active
4. Ensure sufficient training data (200+ points)
