/**
 * Report Analyzer Service
 * Calculates trends, comparisons, and generates recommendations for daily evaluation reports
 * 
 * Requirements: 2.4, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { getReport, listReports } from './reportStorage.js';

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
function calculatePercentChange(current, previous) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Determine trend direction based on percentage change
 * @param {number} percentChange - Percentage change value
 * @returns {"up"|"down"|"stable"} Direction
 */
function getTrendDirection(percentChange) {
  if (Math.abs(percentChange) < 2) {
    return 'stable';
  }
  return percentChange > 0 ? 'up' : 'down';
}

/**
 * Determine trend significance based on percentage change
 * @param {number} percentChange - Percentage change value
 * @returns {"high"|"medium"|"low"} Significance level
 */
function getTrendSignificance(percentChange) {
  const absChange = Math.abs(percentChange);
  if (absChange >= 10) {
    return 'high';
  } else if (absChange >= 5) {
    return 'medium';
  }
  return 'low';
}


/**
 * Compare current data with previous day's data
 * @param {import('./types.js').ReportData} current - Current report data
 * @param {import('./types.js').ReportData} previous - Previous day's report data
 * @returns {import('./types.js').Comparison[]} Day-over-day comparisons
 */
export function compareDayOverDay(current, previous) {
  const comparisons = [];
  
  // Energy comparison
  const energyChange = current.campusWide.totalEnergy - previous.campusWide.totalEnergy;
  const energyPercentChange = calculatePercentChange(
    current.campusWide.totalEnergy,
    previous.campusWide.totalEnergy
  );
  
  comparisons.push({
    metric: 'energy',
    current: current.campusWide.totalEnergy,
    previous: previous.campusWide.totalEnergy,
    change: parseFloat(energyChange.toFixed(2)),
    percentChange: parseFloat(energyPercentChange.toFixed(2))
  });
  
  // Wastage comparison
  const wastageChange = current.campusWide.totalWastage - previous.campusWide.totalWastage;
  const wastagePercentChange = calculatePercentChange(
    current.campusWide.totalWastage,
    previous.campusWide.totalWastage
  );
  
  comparisons.push({
    metric: 'wastage',
    current: current.campusWide.totalWastage,
    previous: previous.campusWide.totalWastage,
    change: parseFloat(wastageChange.toFixed(2)),
    percentChange: parseFloat(wastagePercentChange.toFixed(2))
  });
  
  // Alerts comparison
  const alertsChange = current.alerts.total - previous.alerts.total;
  const alertsPercentChange = calculatePercentChange(
    current.alerts.total,
    previous.alerts.total
  );
  
  comparisons.push({
    metric: 'alerts',
    current: current.alerts.total,
    previous: previous.alerts.total,
    change: alertsChange,
    percentChange: parseFloat(alertsPercentChange.toFixed(2))
  });
  
  // Efficiency comparison
  const efficiencyChange = current.campusWide.avgEfficiency - previous.campusWide.avgEfficiency;
  const efficiencyPercentChange = calculatePercentChange(
    current.campusWide.avgEfficiency,
    previous.campusWide.avgEfficiency
  );
  
  comparisons.push({
    metric: 'efficiency',
    current: current.campusWide.avgEfficiency,
    previous: previous.campusWide.avgEfficiency,
    change: parseFloat(efficiencyChange.toFixed(2)),
    percentChange: parseFloat(efficiencyPercentChange.toFixed(2))
  });
  
  return comparisons;
}


/**
 * Compare current data with same day last week
 * @param {import('./types.js').ReportData} current - Current report data
 * @param {import('./types.js').ReportData} previousWeek - Previous week's report data
 * @returns {import('./types.js').Comparison[]} Week-over-week comparisons
 */
export function compareWeekOverWeek(current, previousWeek) {
  const comparisons = [];
  
  // Energy comparison
  const energyChange = current.campusWide.totalEnergy - previousWeek.campusWide.totalEnergy;
  const energyPercentChange = calculatePercentChange(
    current.campusWide.totalEnergy,
    previousWeek.campusWide.totalEnergy
  );
  
  comparisons.push({
    metric: 'energy',
    current: current.campusWide.totalEnergy,
    previous: previousWeek.campusWide.totalEnergy,
    change: parseFloat(energyChange.toFixed(2)),
    percentChange: parseFloat(energyPercentChange.toFixed(2))
  });
  
  // Wastage comparison
  const wastageChange = current.campusWide.totalWastage - previousWeek.campusWide.totalWastage;
  const wastagePercentChange = calculatePercentChange(
    current.campusWide.totalWastage,
    previousWeek.campusWide.totalWastage
  );
  
  comparisons.push({
    metric: 'wastage',
    current: current.campusWide.totalWastage,
    previous: previousWeek.campusWide.totalWastage,
    change: parseFloat(wastageChange.toFixed(2)),
    percentChange: parseFloat(wastagePercentChange.toFixed(2))
  });
  
  // Alerts comparison
  const alertsChange = current.alerts.total - previousWeek.alerts.total;
  const alertsPercentChange = calculatePercentChange(
    current.alerts.total,
    previousWeek.alerts.total
  );
  
  comparisons.push({
    metric: 'alerts',
    current: current.alerts.total,
    previous: previousWeek.alerts.total,
    change: alertsChange,
    percentChange: parseFloat(alertsPercentChange.toFixed(2))
  });
  
  // Efficiency comparison
  const efficiencyChange = current.campusWide.avgEfficiency - previousWeek.campusWide.avgEfficiency;
  const efficiencyPercentChange = calculatePercentChange(
    current.campusWide.avgEfficiency,
    previousWeek.campusWide.avgEfficiency
  );
  
  comparisons.push({
    metric: 'efficiency',
    current: current.campusWide.avgEfficiency,
    previous: previousWeek.campusWide.avgEfficiency,
    change: parseFloat(efficiencyChange.toFixed(2)),
    percentChange: parseFloat(efficiencyPercentChange.toFixed(2))
  });
  
  return comparisons;
}


/**
 * Generate recommendations based on data analysis and thresholds
 * @param {import('./types.js').ReportData} data - Current report data
 * @param {import('./types.js').Trend[]} trends - Calculated trends
 * @param {import('./types.js').Comparison[]} dayOverDay - Day-over-day comparisons
 * @param {import('./types.js').Comparison[]} weekOverWeek - Week-over-week comparisons
 * @returns {import('./types.js').Recommendation[]} Array of recommendations
 */
export function generateRecommendations(data, trends, dayOverDay, weekOverWeek) {
  const recommendations = [];
  
  // Check for high energy consumption (>10% increase)
  const energyTrend = trends.find(t => t.metric === 'energy');
  if (energyTrend && energyTrend.percentChange > 10) {
    recommendations.push({
      priority: 'high',
      category: 'energy',
      title: 'High Energy Consumption Detected',
      description: `Campus energy consumption has increased by ${energyTrend.percentChange.toFixed(1)}% compared to the previous period. Review building operations and identify potential causes.`,
      expectedImpact: 'Reducing consumption by 5% could save approximately $500-1000 per month'
    });
  }
  
  // Check for individual buildings with high wastage
  const highWastageBuildings = data.buildings.filter(b => b.wastagePercent > 15);
  if (highWastageBuildings.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'energy',
      title: 'Buildings with High Energy Wastage',
      description: `${highWastageBuildings.length} building(s) showing wastage above 15%: ${highWastageBuildings.map(b => b.buildingName).join(', ')}. Consider scheduling energy audits.`,
      expectedImpact: 'Energy audits typically identify 10-20% savings opportunities',
      buildingIds: highWastageBuildings.map(b => b.buildingId)
    });
  }
  
  // Check for high alert response times
  if (data.alerts.avgResponseTime > 20) {
    recommendations.push({
      priority: 'medium',
      category: 'alerts',
      title: 'Slow Alert Response Times',
      description: `Average alert response time is ${data.alerts.avgResponseTime.toFixed(1)} minutes, exceeding the 20-minute target. Review notification workflows and staffing.`,
      expectedImpact: 'Faster response times can prevent minor issues from escalating'
    });
  }
  
  // Check for critical alerts
  if (data.alerts.critical > 5) {
    recommendations.push({
      priority: 'high',
      category: 'alerts',
      title: 'High Number of Critical Alerts',
      description: `${data.alerts.critical} critical alerts were triggered today. Investigate root causes to prevent recurring issues.`,
      expectedImpact: 'Addressing root causes can reduce alert frequency by 30-50%'
    });
  }
  
  // Check for anomalies
  if (data.anomalies.totalDetected > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'maintenance',
      title: 'Anomalies Detected by ML Models',
      description: `${data.anomalies.totalDetected} anomalies detected across campus. Review anomaly details and investigate unusual patterns.`,
      expectedImpact: 'Early detection of anomalies can prevent equipment failures and reduce maintenance costs'
    });
  }
  
  // Check sustainability progress
  if (data.sustainability.netZeroProgress < 40) {
    recommendations.push({
      priority: 'medium',
      category: 'sustainability',
      title: 'Net Zero Progress Below Target',
      description: `Current net zero progress is ${data.sustainability.netZeroProgress.toFixed(1)}%, below the 40% milestone. Consider increasing renewable energy adoption.`,
      expectedImpact: 'Increasing renewable energy by 10% could improve progress by 5-7%'
    });
  }
  
  // Check for positive trends to acknowledge
  const wastageTrend = trends.find(t => t.metric === 'wastage');
  if (wastageTrend && wastageTrend.percentChange < -5) {
    recommendations.push({
      priority: 'low',
      category: 'energy',
      title: 'Energy Wastage Reduction Success',
      description: `Energy wastage has decreased by ${Math.abs(wastageTrend.percentChange).toFixed(1)}%. Continue current efficiency initiatives.`,
      expectedImpact: 'Maintaining this trend could save $10,000+ annually'
    });
  }
  
  // Check efficiency trends
  const efficiencyTrend = trends.find(t => t.metric === 'efficiency');
  if (efficiencyTrend && efficiencyTrend.percentChange < -3) {
    recommendations.push({
      priority: 'medium',
      category: 'energy',
      title: 'Declining Energy Efficiency',
      description: `Campus energy efficiency has declined by ${Math.abs(efficiencyTrend.percentChange).toFixed(1)}%. Review HVAC settings and building automation systems.`,
      expectedImpact: 'Optimizing HVAC schedules can improve efficiency by 5-10%'
    });
  }
  
  // Sort recommendations by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations;
}


/**
 * Calculate trends from comparisons
 * @param {import('./types.js').Comparison[]} dayOverDay - Day-over-day comparisons
 * @param {import('./types.js').Comparison[]} weekOverWeek - Week-over-week comparisons
 * @returns {import('./types.js').Trend[]} Array of trends
 */
function calculateTrends(dayOverDay, weekOverWeek) {
  const trends = [];
  
  // Use day-over-day for short-term trends
  for (const comparison of dayOverDay) {
    trends.push({
      metric: comparison.metric,
      direction: getTrendDirection(comparison.percentChange),
      percentChange: comparison.percentChange,
      significance: getTrendSignificance(comparison.percentChange)
    });
  }
  
  return trends;
}

/**
 * Generate highlights from data and trends
 * @param {import('./types.js').ReportData} data - Current report data
 * @param {import('./types.js').Trend[]} trends - Calculated trends
 * @param {import('./types.js').Comparison[]} dayOverDay - Day-over-day comparisons
 * @returns {import('./types.js').Highlight[]} Array of highlights
 */
function generateHighlights(data, trends, dayOverDay) {
  const highlights = [];
  
  // Highlight significant changes (>10%)
  for (const trend of trends) {
    if (Math.abs(trend.percentChange) > 10) {
      const comparison = dayOverDay.find(c => c.metric === trend.metric);
      if (comparison) {
        const type = trend.direction === 'down' && 
                     (trend.metric === 'wastage' || trend.metric === 'alerts') 
                     ? 'achievement' 
                     : trend.direction === 'up' && 
                       (trend.metric === 'energy' || trend.metric === 'wastage' || trend.metric === 'alerts')
                     ? 'concern'
                     : 'info';
        
        const icon = type === 'achievement' ? '✅' : type === 'concern' ? '⚠️' : 'ℹ️';
        
        highlights.push({
          type,
          icon,
          message: `${trend.metric.charAt(0).toUpperCase() + trend.metric.slice(1)} ${trend.direction === 'up' ? 'increased' : 'decreased'} by ${Math.abs(trend.percentChange).toFixed(1)}%`
        });
      }
    }
  }
  
  // Highlight critical alerts
  if (data.alerts.critical > 0) {
    highlights.push({
      type: 'concern',
      icon: '🚨',
      message: `${data.alerts.critical} critical alert${data.alerts.critical > 1 ? 's' : ''} triggered today`
    });
  }
  
  // Highlight anomalies
  if (data.anomalies.totalDetected > 0) {
    highlights.push({
      type: 'info',
      icon: '🔍',
      message: `${data.anomalies.totalDetected} anomal${data.anomalies.totalDetected > 1 ? 'ies' : 'y'} detected by ML models`
    });
  }
  
  // Highlight sustainability achievements
  if (data.sustainability.netZeroProgress > 50) {
    highlights.push({
      type: 'achievement',
      icon: '🌱',
      message: `Net zero progress at ${data.sustainability.netZeroProgress.toFixed(1)}%`
    });
  }
  
  return highlights;
}


/**
 * Orchestrate complete analysis of report data
 * Fetches historical data, calculates comparisons, trends, and generates recommendations
 * 
 * @param {import('./types.js').ReportData} currentData - Current report data
 * @param {import('./types.js').ReportData[]} historicalData - Array of historical report data
 * @returns {Promise<import('./types.js').AnalysisResult>} Complete analysis result
 */
export async function analyze(currentData, historicalData) {
  try {
    // Check if we have sufficient historical data
    const hasHistoricalData = historicalData && historicalData.length > 0;
    
    let dayOverDay = [];
    let weekOverWeek = [];
    let trends = [];
    let recommendations = [];
    let highlights = [];
    
    if (hasHistoricalData) {
      // Get previous day's data (most recent)
      const previousDay = historicalData[0];
      
      // Calculate day-over-day comparisons
      dayOverDay = compareDayOverDay(currentData, previousDay);
      
      // Calculate week-over-week if we have data from 7 days ago
      if (historicalData.length >= 7) {
        const previousWeek = historicalData[6];
        weekOverWeek = compareWeekOverWeek(currentData, previousWeek);
      }
      
      // Calculate trends from comparisons
      trends = calculateTrends(dayOverDay, weekOverWeek);
      
      // Generate recommendations based on data and trends
      recommendations = generateRecommendations(currentData, trends, dayOverDay, weekOverWeek);
      
      // Generate highlights
      highlights = generateHighlights(currentData, trends, dayOverDay);
    } else {
      // No historical data - generate basic recommendations without comparisons
      recommendations = generateRecommendations(currentData, [], [], []);
      
      // Generate basic highlights
      highlights = generateHighlights(currentData, [], []);
      
      // Add note about limited data
      highlights.unshift({
        type: 'info',
        icon: 'ℹ️',
        message: 'Limited historical data available for trend analysis'
      });
    }
    
    return {
      trends,
      comparisons: {
        dayOverDay,
        weekOverWeek
      },
      recommendations,
      highlights
    };
  } catch (error) {
    console.error('Error analyzing report data:', error);
    throw error;
  }
}

// Export default object with all methods
export default {
  compareDayOverDay,
  compareWeekOverWeek,
  generateRecommendations,
  analyze
};
