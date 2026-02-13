/**
 * Shared TypeScript-style interfaces for Daily Evaluation Report feature
 * These are JSDoc type definitions for use in JavaScript files
 */

/**
 * @typedef {Object} ScheduleConfig
 * @property {boolean} enabled
 * @property {string} time - "HH:MM" format (e.g., "18:00")
 * @property {string[]} days - ["monday", "tuesday", ...] or ["all"]
 * @property {string} timezone - "Asia/Kolkata"
 */

/**
 * @typedef {Object} BuildingMetrics
 * @property {number} buildingId
 * @property {string} buildingName
 * @property {number} totalEnergy - kWh
 * @property {number} avgPower - kW
 * @property {number} peakPower - kW
 * @property {number} avgOccupancy - percentage
 * @property {number} avgTemperature - celsius
 * @property {number} totalWastage - kWh
 * @property {number} wastagePercent - percentage
 */

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {string} type
 * @property {string} severity
 * @property {string} message
 * @property {Date} timestamp
 * @property {number} [responseTime] - minutes
 */

/**
 * @typedef {Object} AlertSummary
 * @property {number} total
 * @property {number} critical
 * @property {number} warning
 * @property {number} info
 * @property {number} avgResponseTime - minutes
 * @property {Alert[]} topAlerts
 */

/**
 * @typedef {Object} Anomaly
 * @property {string} id
 * @property {number} buildingId
 * @property {string} type
 * @property {string} description
 * @property {string} impact
 * @property {Date} detectedAt
 */

/**
 * @typedef {Object} AnomalySummary
 * @property {number} totalDetected
 * @property {Map<number, number>} byBuilding
 * @property {Anomaly[]} criticalAnomalies
 * @property {string[]} patterns
 */

/**
 * @typedef {Object} SustainabilityData
 * @property {number} totalCO2 - kg
 * @property {number} energyIntensity - kWh/m²
 * @property {number} renewablePercent
 * @property {number} costSavings - currency
 * @property {number} netZeroProgress - percentage
 */

/**
 * @typedef {Object} CampusMetrics
 * @property {number} totalEnergy
 * @property {number} totalWastage
 * @property {number} avgEfficiency
 * @property {number} peakDemand
 * @property {Date} peakDemandTime
 */

/**
 * @typedef {Object} ReportData
 * @property {{start: Date, end: Date}} period
 * @property {BuildingMetrics[]} buildings
 * @property {AlertSummary} alerts
 * @property {AnomalySummary} anomalies
 * @property {SustainabilityData} sustainability
 * @property {CampusMetrics} campusWide
 */

/**
 * @typedef {Object} Trend
 * @property {string} metric - "energy", "wastage", "alerts", etc.
 * @property {"up"|"down"|"stable"} direction
 * @property {number} percentChange
 * @property {"high"|"medium"|"low"} significance
 */

/**
 * @typedef {Object} Comparison
 * @property {string} metric
 * @property {number} current
 * @property {number} previous
 * @property {number} change
 * @property {number} percentChange
 */

/**
 * @typedef {Object} Recommendation
 * @property {"high"|"medium"|"low"} priority
 * @property {"energy"|"alerts"|"sustainability"|"maintenance"} category
 * @property {string} title
 * @property {string} description
 * @property {string} expectedImpact
 * @property {number[]} [buildingIds]
 */

/**
 * @typedef {Object} Highlight
 * @property {"achievement"|"concern"|"info"} type
 * @property {string} icon
 * @property {string} message
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {Trend[]} trends
 * @property {{dayOverDay: Comparison, weekOverWeek: Comparison}} comparisons
 * @property {Recommendation[]} recommendations
 * @property {Highlight[]} highlights
 */

/**
 * @typedef {Object} ReportSummary
 * @property {number} totalEnergy
 * @property {number} totalWastage
 * @property {number} totalAlerts
 * @property {number} criticalIssues
 * @property {number} sustainabilityScore
 * @property {string[]} keyHighlights
 */

/**
 * @typedef {Object} BuildingReport
 * @property {number} buildingId
 * @property {string} buildingName
 * @property {BuildingMetrics} metrics
 * @property {"excellent"|"good"|"needs_attention"|"critical"} status
 * @property {string[]} issues
 * @property {string[]} achievements
 */

/**
 * @typedef {Object} ChartData
 * @property {"line"|"bar"|"pie"|"heatmap"} type
 * @property {string} title
 * @property {any} data
 * @property {any} config
 */

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {Date} generatedAt
 * @property {{start: Date, end: Date}} period
 * @property {ReportSummary} summary
 * @property {BuildingReport[]} buildingDetails
 * @property {AlertSummary} alertSummary
 * @property {AnomalySummary} anomalyInsights
 * @property {SustainabilityData} sustainability
 * @property {Trend[]} trends
 * @property {Recommendation[]} recommendations
 * @property {ChartData[]} charts
 */

/**
 * @typedef {Object} ReportFilters
 * @property {Date} [startDate]
 * @property {Date} [endDate]
 * @property {number[]} [buildingIds]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} ReportMetadata
 * @property {string} id
 * @property {Date} generatedAt
 * @property {{start: Date, end: Date}} period
 * @property {ReportSummary} summary
 */

/**
 * @typedef {Object} DistributionConfig
 * @property {boolean} emailEnabled
 * @property {boolean} smsEnabled
 * @property {string[]} emailRecipients
 * @property {string[]} smsRecipients
 * @property {boolean} includeAttachments
 * @property {boolean} summaryOnly
 */

/**
 * @typedef {Object} DistributionFailure
 * @property {string} recipient
 * @property {"email"|"sms"} channel
 * @property {string} error
 */

/**
 * @typedef {Object} DistributionResult
 * @property {number} emailsSent
 * @property {number} smsSent
 * @property {DistributionFailure[]} failures
 */

/**
 * @typedef {Object} EmailResult
 * @property {boolean} sent
 * @property {string[]} recipients
 * @property {string} [messageId]
 * @property {string} [error]
 */

/**
 * @typedef {Object} SMSResult
 * @property {boolean} sent
 * @property {string[]} recipients
 * @property {string[]} messageIds
 * @property {string[]} errors
 */

/**
 * @typedef {Object} ReportConfiguration
 * @property {ScheduleConfig} schedule
 * @property {DistributionConfig} distribution
 * @property {{keepReports: number, autoCleanup: boolean}} retention
 * @property {{includeHistoricalComparison: boolean, comparisonDays: number}} dataCollection
 */

export {};
