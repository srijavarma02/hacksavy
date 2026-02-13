/**
 * Report Generator Service
 * Creates structured daily evaluation reports from collected data and analysis
 * 
 * Requirements: 2.2, 2.3, 3.1, 3.3, 3.5
 */

import dataCollector from './dataCollector.js';
import reportAnalyzer from './reportAnalyzer.js';
import { saveReport, listReports, getReport } from './reportStorage.js';

/**
 * Generate a unique report ID based on timestamp
 * Format: YYYY-MM-DD-HHMMSS
 * @param {Date} date - Date for the report
 * @returns {string} Report ID
 */
function generateReportId(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Classify building status based on metrics
 * @param {import('./types.js').BuildingMetrics} metrics - Building metrics
 * @returns {"excellent"|"good"|"needs_attention"|"critical"} Status classification
 */
function classifyBuildingStatus(metrics) {
  // Calculate score based on multiple factors
  let score = 100;
  
  // Penalize high wastage
  if (metrics.wastagePercent > 20) {
    score -= 30;
  } else if (metrics.wastagePercent > 15) {
    score -= 20;
  } else if (metrics.wastagePercent > 10) {
    score -= 10;
  }
  
  // Penalize extreme temperatures (outside 20-24°C comfort range)
  if (metrics.avgTemperature < 18 || metrics.avgTemperature > 26) {
    score -= 15;
  } else if (metrics.avgTemperature < 20 || metrics.avgTemperature > 24) {
    score -= 5;
  }
  
  // Penalize very low or very high occupancy
  if (metrics.avgOccupancy < 20 || metrics.avgOccupancy > 90) {
    score -= 10;
  }
  
  // Classify based on final score
  if (score >= 85) {
    return 'excellent';
  } else if (score >= 70) {
    return 'good';
  } else if (score >= 50) {
    return 'needs_attention';
  } else {
    return 'critical';
  }
}

/**
 * Identify issues for a building based on metrics
 * @param {import('./types.js').BuildingMetrics} metrics - Building metrics
 * @returns {string[]} Array of issue descriptions
 */
function identifyBuildingIssues(metrics) {
  const issues = [];
  
  if (metrics.wastagePercent > 15) {
    issues.push(`High energy wastage: ${metrics.wastagePercent.toFixed(1)}%`);
  }
  
  if (metrics.avgTemperature < 20) {
    issues.push(`Temperature below comfort range: ${metrics.avgTemperature.toFixed(1)}°C`);
  } else if (metrics.avgTemperature > 24) {
    issues.push(`Temperature above comfort range: ${metrics.avgTemperature.toFixed(1)}°C`);
  }
  
  if (metrics.avgOccupancy < 30) {
    issues.push(`Low occupancy: ${metrics.avgOccupancy.toFixed(1)}%`);
  } else if (metrics.avgOccupancy > 85) {
    issues.push(`High occupancy: ${metrics.avgOccupancy.toFixed(1)}%`);
  }
  
  if (metrics.peakPower > metrics.avgPower * 1.5) {
    issues.push(`High peak demand: ${metrics.peakPower.toFixed(1)} kW`);
  }
  
  return issues;
}

/**
 * Identify achievements for a building based on metrics
 * @param {import('./types.js').BuildingMetrics} metrics - Building metrics
 * @returns {string[]} Array of achievement descriptions
 */
function identifyBuildingAchievements(metrics) {
  const achievements = [];
  
  if (metrics.wastagePercent < 5) {
    achievements.push(`Excellent energy efficiency: ${metrics.wastagePercent.toFixed(1)}% wastage`);
  } else if (metrics.wastagePercent < 10) {
    achievements.push(`Good energy efficiency: ${metrics.wastagePercent.toFixed(1)}% wastage`);
  }
  
  if (metrics.avgTemperature >= 21 && metrics.avgTemperature <= 23) {
    achievements.push(`Optimal temperature maintained: ${metrics.avgTemperature.toFixed(1)}°C`);
  }
  
  if (metrics.avgOccupancy >= 50 && metrics.avgOccupancy <= 75) {
    achievements.push(`Healthy occupancy levels: ${metrics.avgOccupancy.toFixed(1)}%`);
  }
  
  return achievements;
}

/**
 * Prepare chart data for visualizations
 * @param {import('./types.js').ReportData} data - Report data
 * @param {import('./types.js').AnalysisResult} analysis - Analysis result
 * @returns {import('./types.js').ChartData[]} Array of chart configurations
 */
function prepareChartData(data, analysis) {
  const charts = [];
  
  // Chart 1: Energy consumption by building (bar chart)
  charts.push({
    type: 'bar',
    title: 'Energy Consumption by Building',
    data: {
      labels: data.buildings.map(b => b.buildingName),
      datasets: [{
        label: 'Total Energy (kWh)',
        data: data.buildings.map(b => b.totalEnergy),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    config: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        }
      }
    }
  });
  
  // Chart 2: Wastage percentage by building (bar chart)
  charts.push({
    type: 'bar',
    title: 'Energy Wastage by Building',
    data: {
      labels: data.buildings.map(b => b.buildingName),
      datasets: [{
        label: 'Wastage (%)',
        data: data.buildings.map(b => b.wastagePercent),
        backgroundColor: data.buildings.map(b => 
          b.wastagePercent > 15 ? 'rgba(255, 99, 132, 0.6)' : 
          b.wastagePercent > 10 ? 'rgba(255, 206, 86, 0.6)' : 
          'rgba(75, 192, 192, 0.6)'
        ),
        borderColor: data.buildings.map(b => 
          b.wastagePercent > 15 ? 'rgba(255, 99, 132, 1)' : 
          b.wastagePercent > 10 ? 'rgba(255, 206, 86, 1)' : 
          'rgba(75, 192, 192, 1)'
        ),
        borderWidth: 1
      }]
    },
    config: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Wastage (%)'
          }
        }
      }
    }
  });
  
  // Chart 3: Alert distribution (pie chart)
  charts.push({
    type: 'pie',
    title: 'Alert Distribution by Severity',
    data: {
      labels: ['Critical', 'Warning', 'Info'],
      datasets: [{
        data: [data.alerts.critical, data.alerts.warning, data.alerts.info],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    },
    config: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Chart 4: Trends comparison (line chart) - only if we have comparison data
  if (analysis.comparisons.dayOverDay.length > 0) {
    const energyComparison = analysis.comparisons.dayOverDay.find(c => c.metric === 'energy');
    const wastageComparison = analysis.comparisons.dayOverDay.find(c => c.metric === 'wastage');
    
    if (energyComparison && wastageComparison) {
      charts.push({
        type: 'line',
        title: 'Energy and Wastage Trends',
        data: {
          labels: ['Previous Day', 'Today'],
          datasets: [
            {
              label: 'Total Energy (kWh)',
              data: [energyComparison.previous, energyComparison.current],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.1
            },
            {
              label: 'Total Wastage (kWh)',
              data: [wastageComparison.previous, wastageComparison.current],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1
            }
          ]
        },
        config: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Energy (kWh)'
              }
            }
          }
        }
      });
    }
  }
  
  // Chart 5: Sustainability metrics (bar chart)
  charts.push({
    type: 'bar',
    title: 'Sustainability Metrics',
    data: {
      labels: ['Renewable %', 'Net Zero Progress %', 'Energy Intensity (kWh/m²)'],
      datasets: [{
        label: 'Value',
        data: [
          data.sustainability.renewablePercent,
          data.sustainability.netZeroProgress,
          data.sustainability.energyIntensity * 10 // Scale for visibility
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    config: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });
  
  return charts;
}

/**
 * Create report summary from data and analysis
 * @param {import('./types.js').ReportData} data - Report data
 * @param {import('./types.js').AnalysisResult} analysis - Analysis result
 * @returns {import('./types.js').ReportSummary} Report summary
 */
function createReportSummary(data, analysis) {
  // Calculate sustainability score (0-100)
  const sustainabilityScore = Math.round(
    (data.sustainability.renewablePercent * 0.3) +
    (data.sustainability.netZeroProgress * 0.4) +
    (data.campusWide.avgEfficiency * 0.3)
  );
  
  // Count critical issues
  const criticalIssues = 
    data.alerts.critical +
    data.anomalies.criticalAnomalies.length +
    data.buildings.filter(b => classifyBuildingStatus(b) === 'critical').length;
  
  // Extract key highlights from analysis
  const keyHighlights = analysis.highlights
    .slice(0, 5)
    .map(h => h.message);
  
  return {
    totalEnergy: data.campusWide.totalEnergy,
    totalWastage: data.campusWide.totalWastage,
    totalAlerts: data.alerts.total,
    criticalIssues,
    sustainabilityScore,
    keyHighlights
  };
}

/**
 * Create building reports with status and issues
 * @param {import('./types.js').BuildingMetrics[]} buildings - Building metrics
 * @returns {import('./types.js').BuildingReport[]} Array of building reports
 */
function createBuildingReports(buildings) {
  return buildings.map(metrics => ({
    buildingId: metrics.buildingId,
    buildingName: metrics.buildingName,
    metrics,
    status: classifyBuildingStatus(metrics),
    issues: identifyBuildingIssues(metrics),
    achievements: identifyBuildingAchievements(metrics)
  }));
}

/**
 * Fetch historical data for analysis
 * @param {Date} currentDate - Current report date
 * @param {number} daysBack - Number of days of history to fetch
 * @returns {Promise<import('./types.js').ReportData[]>} Array of historical report data
 */
async function fetchHistoricalData(currentDate, daysBack = 7) {
  const historicalData = [];
  
  try {
    // Get list of all reports
    const allReports = await listReports();
    
    // Filter reports from the past N days (excluding today)
    for (let i = 1; i <= daysBack; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setDate(targetDate.getDate() - i);
      
      // Find report for this date (match by date, not exact time)
      const report = allReports.find(r => {
        const reportDate = new Date(r.generatedAt);
        return reportDate.getFullYear() === targetDate.getFullYear() &&
               reportDate.getMonth() === targetDate.getMonth() &&
               reportDate.getDate() === targetDate.getDate();
      });
      
      if (report) {
        // Fetch full report data
        const fullReport = await getReport(report.id);
        if (fullReport) {
          // Extract ReportData from the full report
          historicalData.push({
            period: fullReport.period,
            buildings: fullReport.buildingDetails.map(b => b.metrics),
            alerts: fullReport.alertSummary,
            anomalies: fullReport.anomalyInsights,
            sustainability: fullReport.sustainability,
            campusWide: {
              totalEnergy: fullReport.summary.totalEnergy,
              totalWastage: fullReport.summary.totalWastage,
              avgEfficiency: fullReport.buildingDetails.reduce((sum, b) => 
                sum + ((b.metrics.totalEnergy - b.metrics.totalWastage) / b.metrics.totalEnergy * 100), 0
              ) / fullReport.buildingDetails.length,
              peakDemand: Math.max(...fullReport.buildingDetails.map(b => b.metrics.peakPower)),
              peakDemandTime: fullReport.period.end
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return empty array if we can't fetch historical data
  }
  
  return historicalData;
}

/**
 * Generate a complete daily evaluation report
 * Orchestrates data collection, analysis, and report creation
 * 
 * @param {Date} [startTime] - Start of reporting period (defaults to 24 hours ago)
 * @param {Date} [endTime] - End of reporting period (defaults to now)
 * @returns {Promise<import('./types.js').Report>} Complete report
 */
export async function generateReport(startTime, endTime) {
  // Default to last 24 hours if not specified
  if (!endTime) {
    endTime = new Date();
  }
  if (!startTime) {
    startTime = new Date(endTime);
    startTime.setHours(startTime.getHours() - 24);
  }
  
  try {
    console.log(`Generating report for period: ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    // Step 1: Collect data
    console.log('Collecting data...');
    const data = await dataCollector.collectData(startTime, endTime);
    
    // Step 2: Fetch historical data for comparison
    console.log('Fetching historical data...');
    const historicalData = await fetchHistoricalData(endTime, 7);
    
    // Step 3: Analyze data
    console.log('Analyzing data...');
    const analysis = await reportAnalyzer.analyze(data, historicalData);
    
    // Step 4: Generate report ID
    const reportId = generateReportId(endTime);
    
    // Step 5: Create report summary
    const summary = createReportSummary(data, analysis);
    
    // Step 6: Create building reports
    const buildingDetails = createBuildingReports(data.buildings);
    
    // Step 7: Prepare chart data
    const charts = prepareChartData(data, analysis);
    
    // Step 8: Assemble complete report
    const report = {
      id: reportId,
      generatedAt: endTime,
      period: {
        start: startTime,
        end: endTime
      },
      summary,
      buildingDetails,
      alertSummary: data.alerts,
      anomalyInsights: data.anomalies,
      sustainability: data.sustainability,
      trends: analysis.trends,
      recommendations: analysis.recommendations,
      charts
    };
    
    // Step 9: Save report
    console.log(`Saving report with ID: ${reportId}`);
    await saveReport(report);
    
    console.log('Report generation complete');
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// Export default object with all methods
export default {
  generateReport,
  generateReportId,
  classifyBuildingStatus,
  prepareChartData
};
