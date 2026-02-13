/**
 * Report Service - Main Entry Point
 * Orchestrates all report-related operations with request queuing and cleanup
 * 
 * Features:
 * - Request queue for sequential processing
 * - Integration of all report services
 * - Automatic cleanup of old reports
 * - Unified API for Express server
 * - Comprehensive error handling
 * 
 * Requirements: 10.2
 */

import dataCollector from './dataCollector.js';
import reportAnalyzer from './reportAnalyzer.js';
import reportGenerator from './reportGenerator.js';
import { saveReport, listReports, getReport, deleteReport } from './reportStorage.js';
import { exportToPDF, exportToCSV } from './reportExporter.js';
import { distributeReport, sendEmail, sendSMS } from './reportDistributor.js';
import reportScheduler from './reportScheduler.js';
import { loadConfig, saveConfig } from './configManager.js';
import {
  logError,
  retryWithBackoff,
  ErrorSeverity,
  getErrorLog,
  getErrorStats
} from './errorHandler.js';

/**
 * Request queue for sequential processing
 */
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  /**
   * Add a request to the queue
   * @param {Function} operation - Async operation to execute
   * @returns {Promise<any>} Result of the operation
   */
  async enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the queue sequentially
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();

      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }

  /**
   * Get queue status
   * @returns {Object} Queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

/**
 * Singleton request queue
 */
const requestQueue = new RequestQueue();

/**
 * Report Service Class
 */
class ReportService {
  constructor() {
    this.initialized = false;
    this.config = null;
  }

  /**
   * Initialize the report service
   */
  async initialize() {
    try {
      console.log('Initializing report service...');

      // Load configuration
      this.config = await loadConfig();

      // Initialize scheduler
      await reportScheduler.initialize();

      // Schedule cleanup task (runs daily at midnight)
      this.scheduleCleanup();

      this.initialized = true;
      console.log('✓ Report service initialized successfully');
    } catch (error) {
      logError(
        error,
        'Failed to initialize report service',
        {},
        ErrorSeverity.CRITICAL
      );
      throw error;
    }
  }

  /**
   * Generate a new report (queued for sequential processing)
   * @param {Object} options - Generation options
   * @param {Date} options.startTime - Start time (default: 24 hours ago)
   * @param {Date} options.endTime - End time (default: now)
   * @param {boolean} options.distribute - Whether to distribute after generation
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(options = {}) {
    return requestQueue.enqueue(async () => {
      try {
        console.log('Generating report...');

        // Use provided times or default to last 24 hours
        const endTime = options.endTime || new Date();
        const startTime = options.startTime || new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

        // Generate report using reportGenerator
        const report = await reportGenerator.generateReport(startTime, endTime);

        console.log(`✓ Report generated: ${report.id}`);

        // Distribute if requested
        if (options.distribute) {
          try {
            const result = await distributeReport(report.id);
            console.log(`✓ Report distributed: ${result.emailsSent} emails, ${result.smsSent} SMS`);
          } catch (error) {
            logError(
              error,
              'Failed to distribute report after generation',
              { reportId: report.id },
              ErrorSeverity.MEDIUM
            );
            // Don't fail the generation if distribution fails
          }
        }

        return report;
      } catch (error) {
        logError(
          error,
          'Failed to generate report',
          options,
          ErrorSeverity.HIGH
        );
        throw error;
      }
    });
  }

  /**
   * Get a specific report by ID
   * @param {string} reportId - Report ID
   * @returns {Promise<Object|null>} Report or null if not found
   */
  async getReport(reportId) {
    try {
      return await getReport(reportId);
    } catch (error) {
      logError(
        error,
        'Failed to get report',
        { reportId },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * List all reports with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of report metadata
   */
  async listReports(filters = {}) {
    try {
      return await listReports(filters);
    } catch (error) {
      logError(
        error,
        'Failed to list reports',
        { filters },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Delete a report
   * @param {string} reportId - Report ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteReport(reportId) {
    try {
      return await deleteReport(reportId);
    } catch (error) {
      logError(
        error,
        'Failed to delete report',
        { reportId },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Export report to PDF
   * @param {string} reportId - Report ID
   * @returns {Promise<Buffer>} PDF buffer
   */
  async exportToPDF(reportId) {
    try {
      return await exportToPDF(reportId);
    } catch (error) {
      logError(
        error,
        'Failed to export report to PDF',
        { reportId },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Export report to CSV
   * @param {string} reportId - Report ID
   * @returns {Promise<string>} CSV file path
   */
  async exportToCSV(reportId) {
    try {
      return await exportToCSV(reportId);
    } catch (error) {
      logError(
        error,
        'Failed to export report to CSV',
        { reportId },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Distribute a report via email and SMS
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Distribution result
   */
  async distributeReport(reportId) {
    try {
      return await distributeReport(reportId);
    } catch (error) {
      logError(
        error,
        'Failed to distribute report',
        { reportId },
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Get configuration
   * @returns {Promise<Object>} Configuration
   */
  async getConfig() {
    try {
      return await loadConfig();
    } catch (error) {
      logError(
        error,
        'Failed to get configuration',
        {},
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Update configuration
   * @param {Object} config - New configuration
   * @returns {Promise<Object>} Updated configuration
   */
  async updateConfig(config) {
    try {
      await saveConfig(config);

      // Update scheduler if schedule changed
      if (config.schedule) {
        reportScheduler.setSchedule(config.schedule);
      }

      this.config = config;
      console.log('✓ Configuration updated');

      return config;
    } catch (error) {
      logError(
        error,
        'Failed to update configuration',
        { config },
        ErrorSeverity.HIGH
      );
      throw error;
    }
  }

  /**
   * Get next scheduled report run time
   * @returns {Date|null} Next run time or null
   */
  getNextScheduledRun() {
    return reportScheduler.getNextRun();
  }

  /**
   * Manually trigger scheduled report generation
   * @returns {Promise<Object>} Generated report
   */
  async triggerScheduledReport() {
    try {
      return await reportScheduler.triggerNow();
    } catch (error) {
      logError(
        error,
        'Failed to trigger scheduled report',
        {},
        ErrorSeverity.HIGH
      );
      throw error;
    }
  }

  /**
   * Clean up old reports based on retention policy
   * @returns {Promise<number>} Number of reports deleted
   */
  async cleanupOldReports() {
    try {
      const config = await loadConfig();
      const retentionDays = config.retention?.keepReports || 30;

      console.log(`Cleaning up reports older than ${retentionDays} days...`);

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Get all reports
      const allReports = await listReports();

      // Filter reports older than cutoff
      const reportsToDelete = allReports.filter(report => {
        const reportDate = new Date(report.generatedAt);
        return reportDate < cutoffDate;
      });

      // Delete old reports
      let deletedCount = 0;
      for (const report of reportsToDelete) {
        try {
          await deleteReport(report.id);
          deletedCount++;
        } catch (error) {
          logError(
            error,
            'Failed to delete old report during cleanup',
            { reportId: report.id },
            ErrorSeverity.LOW
          );
        }
      }

      console.log(`✓ Cleanup completed: ${deletedCount} reports deleted`);
      return deletedCount;
    } catch (error) {
      logError(
        error,
        'Failed to cleanup old reports',
        {},
        ErrorSeverity.MEDIUM
      );
      throw error;
    }
  }

  /**
   * Schedule automatic cleanup task
   * Runs daily at midnight
   */
  scheduleCleanup() {
    const config = this.config;

    if (!config?.retention?.autoCleanup) {
      console.log('Automatic cleanup disabled');
      return;
    }

    // Run cleanup daily at midnight
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        try {
          await this.cleanupOldReports();
        } catch (error) {
          console.error('Error in scheduled cleanup:', error);
        }
      }
    }, 60 * 1000); // Check every minute

    console.log('✓ Automatic cleanup scheduled');
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      queue: requestQueue.getStatus(),
      nextScheduledRun: this.getNextScheduledRun(),
      config: this.config
    };
  }

  /**
   * Get error log
   * @param {number} limit - Maximum entries to return
   * @returns {Array} Error log entries
   */
  getErrorLog(limit = 100) {
    return getErrorLog(limit);
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    return getErrorStats();
  }
}

// Create singleton instance
const reportService = new ReportService();

// Export singleton instance and class
export default reportService;
export { ReportService };
