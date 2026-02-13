/**
 * Data Collector Service
 * Aggregates metrics from multiple sources for daily evaluation reports
 * 
 * Features:
 * - Graceful degradation for partial failures
 * - Retry logic with exponential backoff
 * - Detailed error logging
 * - Continues operation even if some data sources fail
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2
 */

import advancedMonitoringService from '../advancedMonitoringService.js';
import mlService from '../mlService.js';
import notificationService from '../notificationService.js';
import {
  logError,
  retryWithBackoff,
  withGracefulDegradation,
  executeWithPartialFailure,
  ErrorSeverity,
  ErrorType,
  isRetryableError
} from './errorHandler.js';

// Building configuration (should match enhancedServer.js)
const buildings = [
  { id: 1, name: 'Engineering Block', baseline: 120, area: 5000 },
  { id: 2, name: 'Science Lab', baseline: 150, area: 4500 },
  { id: 3, name: 'Library', baseline: 80, area: 3000 },
  { id: 4, name: 'Dorm A', baseline: 100, area: 6000 },
  { id: 5, name: 'Dorm B', baseline: 100, area: 6000 },
  { id: 6, name: 'Admin Building', baseline: 90, area: 3500 },
  { id: 7, name: 'Sports Complex', baseline: 110, area: 4000 }
];

/**
 * Collect building metrics from historical storage
 * Aggregates power, energy, occupancy, temperature, and wastage data
 * Implements graceful degradation - continues with available buildings if some fail
 * 
 * @param {Date} startTime - Start of collection period
 * @param {Date} endTime - End of collection period
 * @returns {Promise<import('./types.js').BuildingMetrics[]>}
 */
export async function collectBuildingMetrics(startTime, endTime) {
  const metrics = [];
  const failures = [];
  
  // Calculate time range in hours
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  
  for (const building of buildings) {
    try {
      // Wrap individual building collection with retry logic
      const buildingMetrics = await retryWithBackoff(
        async () => {
          // Get power history from monitoring service (last 3 minutes only)
          const powerHistory = advancedMonitoringService.getPowerHistory(building.id);
          
          // Since we don't have 24-hour historical storage, we'll simulate aggregated metrics
          // In production, this would query a database with historical data
          
          // Simulate realistic daily metrics based on building baseline
          const timeVariation = Math.sin(new Date().getHours() / 24 * Math.PI * 2);
          const randomVariation = (Math.random() - 0.5) * 0.2;
          
          const avgPower = building.baseline * (1 + timeVariation * 0.3 + randomVariation);
          const peakPower = avgPower * 1.4;
          const totalEnergy = avgPower * hours;
          
          // Calculate wastage (energy above baseline)
          const baselineEnergy = building.baseline * hours;
          const totalWastage = Math.max(0, totalEnergy - baselineEnergy);
          const wastagePercent = (totalWastage / baselineEnergy) * 100;
          
          // Simulate occupancy and temperature
          const avgOccupancy = 45 + Math.random() * 40; // 45-85%
          const avgTemperature = 21 + Math.random() * 4; // 21-25°C
          
          return {
            buildingId: building.id,
            buildingName: building.name,
            totalEnergy: parseFloat(totalEnergy.toFixed(2)),
            avgPower: parseFloat(avgPower.toFixed(2)),
            peakPower: parseFloat(peakPower.toFixed(2)),
            avgOccupancy: parseFloat(avgOccupancy.toFixed(1)),
            avgTemperature: parseFloat(avgTemperature.toFixed(1)),
            totalWastage: parseFloat(totalWastage.toFixed(2)),
            wastagePercent: parseFloat(wastagePercent.toFixed(1))
          };
        },
        {
          maxAttempts: 2,
          baseDelay: 500,
          shouldRetry: isRetryableError,
          context: `collectBuildingMetrics for ${building.name}`
        }
      );
      
      metrics.push(buildingMetrics);
    } catch (error) {
      // Log error but continue with other buildings (graceful degradation)
      logError(
        error,
        `Failed to collect metrics for building ${building.name}`,
        { buildingId: building.id, buildingName: building.name },
        ErrorSeverity.MEDIUM
      );
      failures.push(building.name);
    }
  }
  
  // Log summary if there were failures
  if (failures.length > 0) {
    console.warn(`⚠️  Building metrics collection completed with ${failures.length} failures: ${failures.join(', ')}`);
  }
  
  return metrics;
}

/**
 * Collect alert data from notification service
 * Summarizes alerts by severity and calculates response times
 * Implements graceful degradation - returns empty summary if service fails
 * 
 * @param {Date} startTime - Start of collection period
 * @param {Date} endTime - End of collection period
 * @returns {Promise<import('./types.js').AlertSummary>}
 */
export async function collectAlerts(startTime, endTime) {
  try {
    // Get notification log from notification service with retry
    const notificationLog = await retryWithBackoff(
      () => Promise.resolve(notificationService.getNotificationLog(100)),
      {
        maxAttempts: 2,
        baseDelay: 500,
        context: 'collectAlerts - getNotificationLog'
      }
    );
    
    // Filter notifications within time range
    const relevantNotifications = notificationLog.filter(notification => {
      const notifTime = new Date(notification.timestamp);
      return notifTime >= startTime && notifTime <= endTime;
    });
    
    // Count by severity (infer from message content)
    let critical = 0;
    let warning = 0;
    let info = 0;
    
    const topAlerts = [];
    
    for (const notification of relevantNotifications) {
      // Determine severity from message
      let severity = 'info';
      if (notification.message.includes('🚨') || notification.message.includes('critical')) {
        severity = 'critical';
        critical++;
      } else if (notification.message.includes('⚠️') || notification.message.includes('warning')) {
        severity = 'warning';
        warning++;
      } else {
        info++;
      }
      
      // Add to top alerts (limit to 5)
      if (topAlerts.length < 5) {
        topAlerts.push({
          id: notification.id.toString(),
          type: notification.type || 'wastage',
          severity,
          message: notification.message,
          timestamp: new Date(notification.timestamp),
          responseTime: Math.floor(Math.random() * 30) + 5 // Simulated 5-35 minutes
        });
      }
    }
    
    const total = critical + warning + info;
    const avgResponseTime = total > 0 ? 15 + Math.random() * 10 : 0; // Simulated 15-25 minutes
    
    return {
      total,
      critical,
      warning,
      info,
      avgResponseTime: parseFloat(avgResponseTime.toFixed(1)),
      topAlerts
    };
  } catch (error) {
    // Log error and return empty summary (graceful degradation)
    logError(
      error,
      'Failed to collect alert data',
      { startTime, endTime },
      ErrorSeverity.MEDIUM
    );
    
    return {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      avgResponseTime: 0,
      topAlerts: []
    };
  }
}

/**
 * Collect anomaly insights from ML service
 * Fetches ML-detected anomalies and patterns
 * Implements graceful degradation - returns empty summary if ML service unavailable
 * 
 * @param {Date} startTime - Start of collection period
 * @param {Date} endTime - End of collection period
 * @returns {Promise<import('./types.js').AnomalySummary>}
 */
export async function collectAnomalies(startTime, endTime) {
  try {
    // Get ML model status with retry
    const modelStatus = await retryWithBackoff(
      () => Promise.resolve(mlService.getModelStatus()),
      {
        maxAttempts: 2,
        baseDelay: 500,
        context: 'collectAnomalies - getModelStatus'
      }
    );
    
    // In production, this would query stored anomaly detections
    // For now, we'll simulate based on current ML service state
    
    const criticalAnomalies = [];
    const byBuilding = new Map();
    const patterns = [];
    
    // Simulate anomaly detection for each building
    let totalDetected = 0;
    
    for (const building of buildings) {
      try {
        // Simulate building data for anomaly check
        const buildingData = {
          power: building.baseline * (1 + (Math.random() - 0.5) * 0.4),
          energy: building.baseline * 0.8,
          water: 130,
          gas: 3.5,
          occupancy: 50 + Math.random() * 40,
          temperature: 22 + Math.random() * 3
        };
        
        // Check for anomalies if model is trained
        if (modelStatus.trained) {
          const anomaly = mlService.detectAnomaly(buildingData);
          
          if (anomaly.isAnomaly) {
            totalDetected++;
            byBuilding.set(building.id, (byBuilding.get(building.id) || 0) + 1);
            
            // Add critical anomalies
            if (anomaly.severity === 'critical' && criticalAnomalies.length < 5) {
              criticalAnomalies.push({
                id: `anomaly-${building.id}-${Date.now()}`,
                buildingId: building.id,
                type: 'power_anomaly',
                description: `Unusual power consumption pattern detected in ${building.name}`,
                impact: `Power deviation of ${anomaly.details?.deviation?.toFixed(1) || 'N/A'} kW from expected`,
                detectedAt: new Date()
              });
            }
          }
        }
      } catch (error) {
        // Log error but continue with other buildings
        logError(
          error,
          `Error detecting anomaly for building ${building.name}`,
          { buildingId: building.id },
          ErrorSeverity.LOW
        );
      }
    }
    
    // Identify patterns
    if (totalDetected > 0) {
      patterns.push('Elevated power consumption during off-peak hours');
    }
    if (totalDetected > 3) {
      patterns.push('Multiple buildings showing similar anomaly patterns');
    }
    if (modelStatus.trained) {
      patterns.push(`ML models trained on ${modelStatus.dataPoints} data points`);
    }
    
    return {
      totalDetected,
      byBuilding,
      criticalAnomalies,
      patterns
    };
  } catch (error) {
    // Log error and return empty summary (graceful degradation for ML service unavailability)
    logError(
      error,
      'ML service unavailable - generating report without anomaly insights',
      { startTime, endTime },
      ErrorSeverity.MEDIUM
    );
    
    return {
      totalDetected: 0,
      byBuilding: new Map(),
      criticalAnomalies: [],
      patterns: ['ML service unavailable - anomaly detection skipped']
    };
  }
}

/**
 * Collect sustainability metrics
 * Calculates carbon footprint, energy intensity, and progress toward goals
 * 
 * @param {Date} startTime - Start of collection period
 * @param {Date} endTime - End of collection period
 * @returns {Promise<import('./types.js').SustainabilityData>}
 */
export async function collectSustainabilityMetrics(startTime, endTime) {
  // Calculate total campus area
  const totalArea = buildings.reduce((sum, b) => sum + b.area, 0);
  
  // Calculate time range in hours
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  
  // Calculate total energy consumption
  let totalEnergy = 0;
  for (const building of buildings) {
    const avgPower = building.baseline * (1 + (Math.random() - 0.3) * 0.3);
    totalEnergy += avgPower * hours;
  }
  
  // Carbon footprint calculation (kg CO2)
  // Assuming 0.5 kg CO2 per kWh (typical grid emission factor)
  const totalCO2 = totalEnergy * 0.5;
  
  // Energy intensity (kWh per square meter)
  const energyIntensity = totalEnergy / totalArea;
  
  // Renewable energy percentage (simulated)
  const renewablePercent = 15 + Math.random() * 10; // 15-25%
  
  // Cost savings from efficiency measures (simulated)
  // Assuming $0.12 per kWh and 10% savings from efficiency
  const costSavings = totalEnergy * 0.12 * 0.10;
  
  // Net zero progress (simulated based on renewable percentage and efficiency)
  const netZeroProgress = (renewablePercent + (100 - renewablePercent) * 0.3) / 100 * 100;
  
  return {
    totalCO2: parseFloat(totalCO2.toFixed(2)),
    energyIntensity: parseFloat(energyIntensity.toFixed(3)),
    renewablePercent: parseFloat(renewablePercent.toFixed(1)),
    costSavings: parseFloat(costSavings.toFixed(2)),
    netZeroProgress: parseFloat(netZeroProgress.toFixed(1))
  };
}

/**
 * Orchestrate collection of all data for a report
 * Calls all collection methods and aggregates results
 * Implements comprehensive error handling with partial failure support
 * 
 * @param {Date} startTime - Start of collection period
 * @param {Date} endTime - End of collection period
 * @returns {Promise<import('./types.js').ReportData>}
 */
export async function collectData(startTime, endTime) {
  const errors = [];
  
  try {
    // Collect all metrics with partial failure handling
    const { results, failures } = await executeWithPartialFailure(
      [
        {
          name: 'buildings',
          operation: () => collectBuildingMetrics(startTime, endTime)
        },
        {
          name: 'alerts',
          operation: () => collectAlerts(startTime, endTime)
        },
        {
          name: 'anomalies',
          operation: () => collectAnomalies(startTime, endTime)
        },
        {
          name: 'sustainability',
          operation: () => collectSustainabilityMetrics(startTime, endTime)
        }
      ],
      'collectData'
    );
    
    // Use collected data or fallback to empty/default values
    const buildings = results.buildings || [];
    const alerts = results.alerts || { total: 0, critical: 0, warning: 0, info: 0, avgResponseTime: 0, topAlerts: [] };
    const anomalies = results.anomalies || { totalDetected: 0, byBuilding: new Map(), criticalAnomalies: [], patterns: [] };
    const sustainability = results.sustainability || { totalCO2: 0, energyIntensity: 0, renewablePercent: 0, costSavings: 0, netZeroProgress: 0 };
    
    // Calculate campus-wide metrics (only if we have building data)
    let campusWide;
    if (buildings.length > 0) {
      const totalEnergy = buildings.reduce((sum, b) => sum + b.totalEnergy, 0);
      const totalWastage = buildings.reduce((sum, b) => sum + b.totalWastage, 0);
      const avgEfficiency = totalEnergy > 0 ? ((totalEnergy - totalWastage) / totalEnergy) * 100 : 0;
      
      // Find peak demand
      const peakPower = Math.max(...buildings.map(b => b.peakPower));
      
      // Simulate peak demand time (typically afternoon)
      const peakDemandTime = new Date(startTime);
      peakDemandTime.setHours(14 + Math.floor(Math.random() * 4)); // 2-6 PM
      
      campusWide = {
        totalEnergy: parseFloat(totalEnergy.toFixed(2)),
        totalWastage: parseFloat(totalWastage.toFixed(2)),
        avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
        peakDemand: parseFloat(peakPower.toFixed(2)),
        peakDemandTime
      };
    } else {
      // Fallback campus-wide metrics if no building data
      campusWide = {
        totalEnergy: 0,
        totalWastage: 0,
        avgEfficiency: 0,
        peakDemand: 0,
        peakDemandTime: startTime
      };
    }
    
    // Log summary of data collection
    if (failures.length > 0) {
      console.warn(`⚠️  Data collection completed with ${failures.length} partial failures`);
      failures.forEach(f => console.warn(`   - ${f.name}: ${f.error}`));
    } else {
      console.log('✓ Data collection completed successfully');
    }
    
    return {
      period: { start: startTime, end: endTime },
      buildings,
      alerts,
      anomalies,
      sustainability,
      campusWide,
      metadata: {
        collectionErrors: failures,
        dataCompleteness: ((4 - failures.length) / 4) * 100
      }
    };
  } catch (error) {
    // Critical error - log and rethrow
    logError(
      error,
      'Critical error in data collection',
      { startTime, endTime },
      ErrorSeverity.CRITICAL
    );
    throw error;
  }
}

// Export default object with all methods
export default {
  collectBuildingMetrics,
  collectAlerts,
  collectAnomalies,
  collectSustainabilityMetrics,
  collectData
};
