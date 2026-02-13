/**
 * Report Scheduler Service
 * Handles automated scheduling of daily evaluation reports using node-cron
 * Requirements: 2.1, 7.2
 */

import cron from 'node-cron';
import { loadConfig, saveConfig } from './configManager.js';
import reportGenerator from './reportGenerator.js';
import { distributeReport } from './reportDistributor.js';

class ReportScheduler {
  constructor() {
    this.scheduledTask = null;
    this.config = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the scheduler with configuration
   */
  async initialize() {
    try {
      this.config = await loadConfig();
      
      if (this.config.schedule.enabled) {
        this.setSchedule(this.config.schedule);
      }
      
      this.isInitialized = true;
      console.log('Report scheduler initialized');
    } catch (error) {
      console.error('Error initializing report scheduler:', error);
      throw error;
    }
  }

  /**
   * Set or update the report generation schedule
   * @param {Object} scheduleConfig - Schedule configuration
   * @param {boolean} scheduleConfig.enabled - Whether scheduling is enabled
   * @param {string} scheduleConfig.time - Time in HH:MM format (e.g., "18:00")
   * @param {string[]} scheduleConfig.days - Days to run (e.g., ["monday", "friday"] or ["all"])
   * @param {string} scheduleConfig.timezone - Timezone (e.g., "Asia/Kolkata")
   */
  setSchedule(scheduleConfig) {
    try {
      // Stop existing scheduled task if any
      if (this.scheduledTask) {
        this.scheduledTask.stop();
        this.scheduledTask = null;
      }

      if (!scheduleConfig.enabled) {
        console.log('Report scheduling disabled');
        return;
      }

      // Parse time (HH:MM format)
      const [hours, minutes] = scheduleConfig.time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Invalid time format: ${scheduleConfig.time}. Expected HH:MM format.`);
      }

      // Build cron expression
      const cronExpression = this._buildCronExpression(hours, minutes, scheduleConfig.days);
      
      console.log(`Setting up report schedule: ${cronExpression} (${scheduleConfig.timezone})`);

      // Create scheduled task
      this.scheduledTask = cron.schedule(
        cronExpression,
        async () => {
          console.log('Scheduled report generation triggered');
          await this._executeScheduledReport();
        },
        {
          scheduled: true,
          timezone: scheduleConfig.timezone
        }
      );

      // Update config
      this.config = this.config || {};
      this.config.schedule = scheduleConfig;

      console.log(`Report scheduled for ${scheduleConfig.time} on ${scheduleConfig.days.join(', ')}`);
    } catch (error) {
      console.error('Error setting schedule:', error);
      throw error;
    }
  }

  /**
   * Build cron expression from time and days
   * @private
   */
  _buildCronExpression(hours, minutes, days) {
    // Cron format: minute hour day-of-month month day-of-week
    // Example: "0 18 * * 1,5" = 6:00 PM on Monday and Friday
    
    let dayOfWeek = '*';
    
    if (!days.includes('all')) {
      // Map day names to cron day numbers (0 = Sunday, 1 = Monday, etc.)
      const dayMap = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
      };
      
      const dayNumbers = days.map(day => {
        const dayNum = dayMap[day.toLowerCase()];
        if (dayNum === undefined) {
          throw new Error(`Invalid day name: ${day}`);
        }
        return dayNum;
      });
      
      dayOfWeek = dayNumbers.join(',');
    }
    
    return `${minutes} ${hours} * * ${dayOfWeek}`;
  }

  /**
   * Execute scheduled report generation
   * @private
   */
  async _executeScheduledReport() {
    try {
      console.log('Generating scheduled report...');
      
      // Generate report
      const report = await reportGenerator.generateReport();
      console.log(`Report generated: ${report.id}`);
      
      // Distribute if configured
      const config = await loadConfig();
      if (config.distribution.emailEnabled || config.distribution.smsEnabled) {
        console.log('Distributing report...');
        const result = await distributeReport(report.id);
        console.log(`Report distributed: ${result.emailsSent} emails, ${result.smsSent} SMS sent`);
      }
      
      console.log('Scheduled report generation completed successfully');
    } catch (error) {
      console.error('Error in scheduled report generation:', error);
      // Log error but don't throw - scheduler should continue running
    }
  }

  /**
   * Manually trigger report generation now
   * @returns {Promise<Object>} Generated report
   */
  async triggerNow() {
    try {
      console.log('Manual report generation triggered');
      
      const report = await reportGenerator.generateReport();
      console.log(`Report generated: ${report.id}`);
      
      // Optionally distribute
      const config = await loadConfig();
      if (config.distribution.emailEnabled || config.distribution.smsEnabled) {
        console.log('Distributing report...');
        const result = await distributeReport(report.id);
        console.log(`Report distributed: ${result.emailsSent} emails, ${result.smsSent} SMS sent`);
      }
      
      return report;
    } catch (error) {
      console.error('Error in manual report generation:', error);
      throw error;
    }
  }

  /**
   * Get current schedule configuration
   * @returns {Object} Schedule configuration
   */
  getSchedule() {
    return this.config?.schedule || {
      enabled: false,
      time: '18:00',
      days: ['all'],
      timezone: 'Asia/Kolkata'
    };
  }

  /**
   * Enable or disable automatic scheduling
   * @param {boolean} enabled - Whether to enable scheduling
   */
  async setEnabled(enabled) {
    try {
      const config = await loadConfig();
      config.schedule.enabled = enabled;
      await saveConfig(config);
      
      if (enabled) {
        this.setSchedule(config.schedule);
      } else {
        if (this.scheduledTask) {
          this.scheduledTask.stop();
          this.scheduledTask = null;
        }
      }
      
      console.log(`Report scheduling ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error setting enabled state:', error);
      throw error;
    }
  }

  /**
   * Get next scheduled run time
   * @returns {Date|null} Next run time or null if not scheduled
   */
  getNextRun() {
    if (!this.scheduledTask || !this.config?.schedule.enabled) {
      return null;
    }
    
    // Calculate next run based on current schedule
    const schedule = this.config.schedule;
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, move to next valid day
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    // If specific days are configured, find next matching day
    if (!schedule.days.includes('all')) {
      const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      
      const targetDays = schedule.days.map(d => dayMap[d.toLowerCase()]);
      
      // Find next matching day (max 7 days ahead)
      for (let i = 0; i < 7; i++) {
        if (targetDays.includes(next.getDay())) {
          break;
        }
        next.setDate(next.getDate() + 1);
      }
    }
    
    return next;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Report scheduler stopped');
    }
  }
}

// Create singleton instance
const reportScheduler = new ReportScheduler();

export default reportScheduler;
