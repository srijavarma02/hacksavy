// Advanced Monitoring Service with 1-minute intervals and surge detection
class AdvancedMonitoringService {
  constructor() {
    // Power history for surge detection (stores last 3 minutes of data)
    this.powerHistory = new Map(); // buildingId -> array of {timestamp, power, threshold}
    
    // Threshold configuration
    this.thresholds = {
      morning: {
        warning: 150,  // kW
        critical: 200  // kW
      },
      night: {
        warning: 100,  // kW
        critical: 150  // kW
      }
    };
    
    // Adaptive threshold settings
    this.adaptiveMode = false;
    this.adaptiveMultiplier = 1.5;
    
    // Historical data for adaptive thresholds
    this.historicalStats = {
      morning: { average: 0, max: 0, samples: [] },
      night: { average: 0, max: 0, samples: [] }
    };
    
    // Active surge tracking
    this.activeSurges = new Map(); // buildingId -> {startTime, duration, peakPower}
    
    // 1-minute aggregated data
    this.minuteData = new Map(); // buildingId -> {power, timestamp, samples}
  }
  
  // Determine if current time is morning (6AM-6PM) or night (6PM-6AM)
  getCurrentPeriod() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'morning' : 'night';
  }
  
  // Get current thresholds based on time of day
  getCurrentThresholds() {
    const period = this.getCurrentPeriod();
    
    if (this.adaptiveMode && this.historicalStats[period].average > 0) {
      // Calculate adaptive thresholds based on historical data
      const avg = this.historicalStats[period].average;
      const max = this.historicalStats[period].max;
      
      return {
        warning: avg * this.adaptiveMultiplier,
        critical: Math.min(max * this.adaptiveMultiplier, avg * this.adaptiveMultiplier * 1.5),
        period,
        adaptive: true
      };
    }
    
    return {
      ...this.thresholds[period],
      period,
      adaptive: false
    };
  }
  
  // Update thresholds manually
  updateThresholds(period, warning, critical) {
    if (this.thresholds[period]) {
      this.thresholds[period].warning = warning;
      this.thresholds[period].critical = critical;
    }
  }
  
  // Enable/disable adaptive mode
  setAdaptiveMode(enabled, multiplier = 1.5) {
    this.adaptiveMode = enabled;
    this.adaptiveMultiplier = Math.max(1.0, Math.min(2.0, multiplier));
  }
  
  // Record power reading (called every 3 seconds)
  recordPowerReading(buildingId, power) {
    const now = Date.now();
    
    // Initialize history if needed
    if (!this.powerHistory.has(buildingId)) {
      this.powerHistory.set(buildingId, []);
    }
    
    const history = this.powerHistory.get(buildingId);
    const thresholds = this.getCurrentThresholds();
    
    // Add new reading
    history.push({
      timestamp: now,
      power,
      warning: thresholds.warning,
      critical: thresholds.critical
    });
    
    // Keep only last 3 minutes of data (60 readings at 3-second intervals)
    const cutoff = now - 180000;
    this.powerHistory.set(
      buildingId,
      history.filter(r => r.timestamp > cutoff)
    );
    
    // Update 1-minute aggregated data
    this.updateMinuteData(buildingId, power, now);
    
    // Update historical stats for adaptive thresholds
    this.updateHistoricalStats(power);
    
    // Check for sustained surge
    return this.checkSurge(buildingId, power, thresholds);
  }
  
  // Update 1-minute aggregated data
  updateMinuteData(buildingId, power, timestamp) {
    if (!this.minuteData.has(buildingId)) {
      this.minuteData.set(buildingId, {
        power: 0,
        timestamp: timestamp,
        samples: []
      });
    }
    
    const data = this.minuteData.get(buildingId);
    data.samples.push(power);
    
    // If 1 minute has passed, calculate average and reset
    if (timestamp - data.timestamp >= 60000) {
      const avgPower = data.samples.reduce((sum, p) => sum + p, 0) / data.samples.length;
      data.power = avgPower;
      data.timestamp = timestamp;
      data.samples = [];
    }
  }
  
  // Get 1-minute aggregated power for a building
  getMinutePower(buildingId) {
    const data = this.minuteData.get(buildingId);
    return data ? data.power : 0;
  }
  
  // Update historical statistics for adaptive thresholds
  updateHistoricalStats(power) {
    const period = this.getCurrentPeriod();
    const stats = this.historicalStats[period];
    
    // Add sample
    stats.samples.push(power);
    
    // Keep last 100 samples per period
    if (stats.samples.length > 100) {
      stats.samples.shift();
    }
    
    // Recalculate average and max
    if (stats.samples.length > 0) {
      stats.average = stats.samples.reduce((sum, p) => sum + p, 0) / stats.samples.length;
      stats.max = Math.max(...stats.samples);
    }
  }
  
  // Check if power surge has been sustained for > 3 minutes
  checkSurge(buildingId, currentPower, thresholds) {
    const history = this.powerHistory.get(buildingId) || [];
    const now = Date.now();
    
    // Need at least 3 minutes of data (60 readings at 3-second intervals)
    if (history.length < 60) {
      return { surge: false, duration: 0 };
    }
    
    // Check if ALL readings in last 3 minutes (180 seconds) exceed warning threshold
    const threeMinutesAgo = now - 180000;
    const recentReadings = history.filter(r => r.timestamp >= threeMinutesAgo);
    
    if (recentReadings.length === 0) {
      return { surge: false, duration: 0 };
    }
    
    const allAboveWarning = recentReadings.every(r => r.power > thresholds.warning);
    const allAboveCritical = recentReadings.every(r => r.power > thresholds.critical);
    
    // Determine severity
    let severity = null;
    if (allAboveCritical) {
      severity = 'critical';
    } else if (allAboveWarning) {
      severity = 'warning';
    }
    
    if (severity) {
      // Track active surge
      if (!this.activeSurges.has(buildingId)) {
        this.activeSurges.set(buildingId, {
          startTime: recentReadings[0].timestamp,
          peakPower: currentPower,
          severity
        });
      } else {
        const surge = this.activeSurges.get(buildingId);
        surge.peakPower = Math.max(surge.peakPower, currentPower);
        surge.severity = severity;
      }
      
      const surge = this.activeSurges.get(buildingId);
      const duration = now - surge.startTime;
      
      return {
        surge: true,
        severity,
        duration,
        peakPower: surge.peakPower,
        threshold: severity === 'critical' ? thresholds.critical : thresholds.warning,
        shouldAlert: duration >= 180000 // Alert only after 3 minutes
      };
    } else {
      // Clear surge if power drops below threshold
      this.activeSurges.delete(buildingId);
      return { surge: false, duration: 0 };
    }
  }
  
  // Get current configuration
  getConfiguration() {
    const currentThresholds = this.getCurrentThresholds();
    
    return {
      thresholds: this.thresholds,
      adaptiveMode: this.adaptiveMode,
      adaptiveMultiplier: this.adaptiveMultiplier,
      currentPeriod: this.getCurrentPeriod(),
      currentThresholds: {
        warning: currentThresholds.warning || 0,
        critical: currentThresholds.critical || 0,
        period: currentThresholds.period,
        adaptive: currentThresholds.adaptive || false
      },
      historicalStats: {
        morning: {
          average: (this.historicalStats.morning.average || 0).toFixed(2),
          max: (this.historicalStats.morning.max || 0).toFixed(2)
        },
        night: {
          average: (this.historicalStats.night.average || 0).toFixed(2),
          max: (this.historicalStats.night.max || 0).toFixed(2)
        }
      }
    };
  }
  
  // Get power history for a building (for charting)
  getPowerHistory(buildingId) {
    return this.powerHistory.get(buildingId) || [];
  }
}

export default new AdvancedMonitoringService();
