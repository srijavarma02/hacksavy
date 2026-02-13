import { RandomForestRegression } from 'ml-random-forest';

// Isolation Forest implementation for anomaly detection
class IsolationForest {
  constructor(numTrees = 100, sampleSize = 256) {
    this.numTrees = numTrees;
    this.sampleSize = sampleSize;
    this.trees = [];
    this.trained = false;
  }

  // Build isolation tree
  buildTree(data, currentDepth = 0, maxDepth = 10) {
    if (data.length <= 1 || currentDepth >= maxDepth) {
      return { size: data.length, isLeaf: true };
    }

    const numFeatures = data[0].length;
    const splitFeature = Math.floor(Math.random() * numFeatures);
    const featureValues = data.map(point => point[splitFeature]);
    const minVal = Math.min(...featureValues);
    const maxVal = Math.max(...featureValues);
    
    if (minVal === maxVal) {
      return { size: data.length, isLeaf: true };
    }

    const splitValue = minVal + Math.random() * (maxVal - minVal);
    
    const leftData = data.filter(point => point[splitFeature] < splitValue);
    const rightData = data.filter(point => point[splitFeature] >= splitValue);

    return {
      splitFeature,
      splitValue,
      left: this.buildTree(leftData, currentDepth + 1, maxDepth),
      right: this.buildTree(rightData, currentDepth + 1, maxDepth),
      isLeaf: false
    };
  }

  // Train the isolation forest
  train(data) {
    this.trees = [];
    const maxDepth = Math.ceil(Math.log2(this.sampleSize));

    for (let i = 0; i < this.numTrees; i++) {
      const sample = this.sampleData(data, this.sampleSize);
      const tree = this.buildTree(sample, 0, maxDepth);
      this.trees.push(tree);
    }

    this.trained = true;
  }

  // Sample data randomly
  sampleData(data, size) {
    const sampled = [];
    for (let i = 0; i < Math.min(size, data.length); i++) {
      const idx = Math.floor(Math.random() * data.length);
      sampled.push(data[idx]);
    }
    return sampled;
  }

  // Calculate path length for a point
  pathLength(point, tree, currentDepth = 0) {
    if (tree.isLeaf) {
      return currentDepth + this.c(tree.size);
    }

    if (point[tree.splitFeature] < tree.splitValue) {
      return this.pathLength(point, tree.left, currentDepth + 1);
    } else {
      return this.pathLength(point, tree.right, currentDepth + 1);
    }
  }

  // Average path length of unsuccessful search in BST
  c(n) {
    if (n <= 1) return 0;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
  }

  // Calculate anomaly score
  anomalyScore(point) {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const avgPathLength = this.trees.reduce((sum, tree) => {
      return sum + this.pathLength(point, tree);
    }, 0) / this.trees.length;

    const score = Math.pow(2, -avgPathLength / this.c(this.sampleSize));
    return score;
  }

  // Predict if point is anomaly
  predict(point, threshold = 0.6) {
    const score = this.anomalyScore(point);
    return {
      isAnomaly: score > threshold,
      score: score,
      severity: score > 0.7 ? 'critical' : score > 0.6 ? 'warning' : 'normal'
    };
  }
}

// Enhanced ML Service with both models
class EnhancedMLService {
  constructor() {
    this.isolationForest = new IsolationForest(100, 256);
    this.randomForest = null;
    this.historicalData = [];
    this.trainingData = [];
    this.modelsTrained = false;
  }

  // Prepare features from building data
  extractFeatures(data) {
    return [
      data.power || 0,
      data.energy || 0,
      data.water || 0,
      data.gas || 0,
      data.occupancy || 0,
      data.temperature || 20,
      new Date().getHours(), // Hour of day
      new Date().getDay()    // Day of week
    ];
  }

  // Add data point to training set
  addTrainingData(buildingData) {
    const features = this.extractFeatures(buildingData);
    this.trainingData.push({
      features,
      target: buildingData.power || 0,
      timestamp: Date.now()
    });

    // Keep only last 1000 data points
    if (this.trainingData.length > 1000) {
      this.trainingData.shift();
    }

    // Retrain models every 100 data points
    if (this.trainingData.length % 100 === 0 && this.trainingData.length >= 200) {
      this.trainModels();
    }
  }

  // Train both models
  trainModels() {
    console.log('Training ML models...');
    
    try {
      // Train Isolation Forest for anomaly detection
      const features = this.trainingData.map(d => d.features);
      this.isolationForest.train(features);

      // Train Random Forest for prediction
      const X = this.trainingData.map(d => d.features.slice(0, -1)); // Exclude target
      const y = this.trainingData.map(d => d.target);

      this.randomForest = new RandomForestRegression({
        nEstimators: 50,
        maxFeatures: 0.8,
        replacement: true,
        seed: 42
      });

      this.randomForest.train(X, y);
      this.modelsTrained = true;
      
      console.log('ML models trained successfully');
    } catch (error) {
      console.error('Error training models:', error);
    }
  }

  // Detect anomalies using Isolation Forest
  detectAnomaly(buildingData) {
    if (!this.modelsTrained) {
      return this.fallbackAnomalyDetection(buildingData);
    }

    try {
      const features = this.extractFeatures(buildingData);
      const result = this.isolationForest.predict(features);

      return {
        isAnomaly: result.isAnomaly,
        score: result.score,
        severity: result.severity,
        method: 'isolation_forest',
        details: {
          power: buildingData.power,
          expected: this.predictPowerConsumption(buildingData),
          deviation: Math.abs(buildingData.power - this.predictPowerConsumption(buildingData))
        }
      };
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return this.fallbackAnomalyDetection(buildingData);
    }
  }

  // Predict power consumption using Random Forest
  predictPowerConsumption(buildingData) {
    if (!this.modelsTrained || !this.randomForest) {
      return this.fallbackPrediction(buildingData);
    }

    try {
      const features = this.extractFeatures(buildingData).slice(0, -1);
      const prediction = this.randomForest.predict([features])[0];
      return Math.max(0, prediction);
    } catch (error) {
      console.error('Prediction error:', error);
      return this.fallbackPrediction(buildingData);
    }
  }

  // Predict next hour consumption
  predictNextHour(buildingData) {
    const currentPrediction = this.predictPowerConsumption(buildingData);
    
    // Adjust for next hour
    const nextHour = (new Date().getHours() + 1) % 24;
    const nextHourData = {
      ...buildingData,
      hour: nextHour
    };

    return this.predictPowerConsumption(nextHourData);
  }

  // Predict consumption for next 24 hours
  predict24Hours(buildingData) {
    const predictions = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const hourData = {
        ...buildingData,
        hour: hour
      };
      
      predictions.push({
        hour: hour,
        predicted: this.predictPowerConsumption(hourData),
        confidence: this.modelsTrained ? 0.85 : 0.6
      });
    }

    return predictions;
  }

  // Fallback anomaly detection (statistical)
  fallbackAnomalyDetection(buildingData) {
    const baseline = {
      power: { mean: 100, stdDev: 20 },
      energy: { mean: 80, stdDev: 15 }
    };

    const zScore = Math.abs((buildingData.power - baseline.power.mean) / baseline.power.stdDev);
    const isAnomaly = zScore > 2.5;

    return {
      isAnomaly,
      score: zScore / 5, // Normalize to 0-1
      severity: zScore > 3 ? 'critical' : zScore > 2.5 ? 'warning' : 'normal',
      method: 'statistical'
    };
  }

  // Fallback prediction (moving average)
  fallbackPrediction(buildingData) {
    if (this.trainingData.length < 5) {
      return buildingData.power || 100;
    }

    const recent = this.trainingData.slice(-10).map(d => d.target);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length;
  }

  // Detect HVAC faults
  detectHVACFault(buildingData) {
    const anomaly = this.detectAnomaly(buildingData);
    const predicted = this.predictPowerConsumption(buildingData);
    const deviation = Math.abs(buildingData.power - predicted);

    if (anomaly.isAnomaly && deviation > 50) {
      return {
        detected: true,
        type: 'hvac_anomaly',
        message: `Unusual HVAC pattern detected. Power: ${buildingData.power.toFixed(1)}kW, Expected: ${predicted.toFixed(1)}kW`,
        recommendation: 'Check HVAC system for malfunctions or scheduling issues',
        severity: anomaly.severity,
        confidence: this.modelsTrained ? 0.9 : 0.7
      };
    }

    // High power with low occupancy
    if (buildingData.power > 150 && buildingData.occupancy < 30) {
      return {
        detected: true,
        type: 'hvac_overcooling',
        message: 'HVAC running at high capacity with low occupancy',
        recommendation: 'Adjust HVAC schedule or check thermostat settings',
        severity: 'warning',
        confidence: 0.85
      };
    }

    return { detected: false };
  }

  // Generate insights
  generateInsights(buildingData) {
    const insights = [];
    const anomaly = this.detectAnomaly(buildingData);
    const predicted = this.predictPowerConsumption(buildingData);
    const nextHour = this.predictNextHour(buildingData);

    if (anomaly.isAnomaly) {
      insights.push({
        type: anomaly.severity === 'critical' ? 'critical' : 'warning',
        icon: anomaly.severity === 'critical' ? '🚨' : '⚠️',
        message: `Anomaly detected! Current: ${buildingData.power.toFixed(1)}kW, Expected: ${predicted.toFixed(1)}kW`,
        model: 'Isolation Forest'
      });
    }

    if (nextHour > buildingData.power * 1.2) {
      insights.push({
        type: 'info',
        icon: '📈',
        message: `Power consumption expected to increase by ${((nextHour - buildingData.power) / buildingData.power * 100).toFixed(1)}% next hour`,
        model: 'Random Forest'
      });
    }

    if (this.modelsTrained) {
      insights.push({
        type: 'success',
        icon: '🤖',
        message: `ML models active: ${this.trainingData.length} data points trained`,
        model: 'System Status'
      });
    }

    return insights;
  }

  // Get model status
  getModelStatus() {
    return {
      trained: this.modelsTrained,
      dataPoints: this.trainingData.length,
      isolationForest: {
        trees: this.isolationForest.numTrees,
        trained: this.isolationForest.trained
      },
      randomForest: {
        available: this.randomForest !== null,
        estimators: this.randomForest ? 50 : 0
      }
    };
  }
}

export default new EnhancedMLService();
