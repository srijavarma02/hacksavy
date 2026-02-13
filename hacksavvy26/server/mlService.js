// Simple ML-based anomaly detection using statistical methods
class MLAnomalyDetector {
  constructor() {
    this.historicalData = [];
    this.baselineThresholds = {
      power: { mean: 100, stdDev: 20 },
      energy: { mean: 80, stdDev: 15 },
      water: { mean: 130, stdDev: 25 },
      gas: { mean: 3.5, stdDev: 0.8 }
    };
  }

  // Z-score based anomaly detection
  detectAnomaly(value, metric) {
    const baseline = this.baselineThresholds[metric];
    if (!baseline) return { isAnomaly: false, score: 0 };

    const zScore = Math.abs((value - baseline.mean) / baseline.stdDev);
    const isAnomaly = zScore > 2.5; // 2.5 standard deviations
    
    return {
      isAnomaly,
      score: zScore,
      severity: zScore > 3 ? 'critical' : zScore > 2.5 ? 'warning' : 'normal',
      expectedRange: {
        min: baseline.mean - 2 * baseline.stdDev,
        max: baseline.mean + 2 * baseline.stdDev
      }
    };
  }

  // Pattern-based detection for HVAC faults
  detectHVACFault(buildingData) {
    const { power, occupancy, temperature } = buildingData;
    
    // High power with low occupancy
    if (power > 150 && occupancy < 30) {
      return {
        detected: true,
        type: 'hvac_overcooling',
        message: 'HVAC running at high capacity with low occupancy',
        recommendation: 'Adjust HVAC schedule or check thermostat settings',
        severity: 'warning'
      };
    }

    // Unusual power spike
    if (power > 200) {
      return {
        detected: true,
        type: 'hvac_malfunction',
        message: 'Abnormal HVAC power consumption detected',
        recommendation: 'Immediate inspection required - possible equipment fault',
        severity: 'critical'
      };
    }

    return { detected: false };
  }

  // Calculate wastage percentage
  calculateWastage(actual, baseline) {
    if (baseline === 0) return 0;
    const wastage = ((actual - baseline) / baseline) * 100;
    return Math.max(0, wastage);
  }

  // Predict next hour consumption using simple moving average
  predictNextHour(historicalValues) {
    if (historicalValues.length < 3) return historicalValues[0] || 100;
    
    const recent = historicalValues.slice(-5);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const trend = (recent[recent.length - 1] - recent[0]) / recent.length;
    
    return avg + trend;
  }

  // Generate insights based on patterns
  generateInsights(data) {
    const insights = [];

    // Check for wastage patterns
    if (data.wastagePercent > 20) {
      insights.push({
        type: 'critical',
        icon: '🚨',
        message: `High wastage detected: ${data.wastagePercent.toFixed(1)}% over baseline. Immediate action required.`
      });
    }

    // Check for efficiency improvements
    if (data.powerChange < -5) {
      insights.push({
        type: 'success',
        icon: '✅',
        message: `Power consumption decreased by ${Math.abs(data.powerChange).toFixed(1)}%. Great progress!`
      });
    }

    // Check for peak load issues
    if (data.peakLoad > data.baseline * 1.5) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        message: 'Peak load exceeds optimal range. Consider load balancing strategies.'
      });
    }

    // Renewable energy insights
    if (data.renewablePercent < 30) {
      insights.push({
        type: 'info',
        icon: 'ℹ️',
        message: 'Renewable energy usage below target. Explore solar/wind options.'
      });
    }

    return insights;
  }
}

export default new MLAnomalyDetector();
