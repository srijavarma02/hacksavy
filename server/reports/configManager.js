/**
 * Configuration Manager for Daily Evaluation Report
 * Handles loading, saving, and validating report configuration
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {import('./types.js').ReportConfiguration} ReportConfiguration
 * @typedef {import('./types.js').ScheduleConfig} ScheduleConfig
 * @typedef {import('./types.js').DistributionConfig} DistributionConfig
 */

const CONFIG_PATH = path.join(__dirname, '../../.kiro/specs/daily-evaluation-report/config.json');

/**
 * Default configuration structure
 * @type {ReportConfiguration}
 */
const DEFAULT_CONFIG = {
  schedule: {
    enabled: false,
    time: "18:00",
    days: ["all"],
    timezone: "Asia/Kolkata"
  },
  distribution: {
    emailEnabled: false,
    smsEnabled: false,
    emailRecipients: [],
    smsRecipients: [],
    includeAttachments: true,
    summaryOnly: false
  },
  retention: {
    keepReports: 30,
    autoCleanup: true
  },
  dataCollection: {
    includeHistoricalComparison: true,
    comparisonDays: 7
  }
};

/**
 * Load configuration from JSON file
 * @returns {Promise<ReportConfiguration>} The loaded configuration
 */
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(data);
    
    // Merge with defaults to ensure all fields exist
    return {
      schedule: { ...DEFAULT_CONFIG.schedule, ...config.schedule },
      distribution: { ...DEFAULT_CONFIG.distribution, ...config.distribution },
      retention: { ...DEFAULT_CONFIG.retention, ...config.retention },
      dataCollection: { ...DEFAULT_CONFIG.dataCollection, ...config.dataCollection }
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default configuration
      console.log('Configuration file not found, using defaults');
      return { ...DEFAULT_CONFIG };
    }
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Save configuration to JSON file
 * @param {ReportConfiguration} config - The configuration to save
 * @returns {Promise<void>}
 */
async function saveConfig(config) {
  try {
    // Validate before saving
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
    // Ensure directory exists
    const dir = path.dirname(CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    // Write configuration
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error.message}`);
  }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 */
function isValidTime(time) {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Validate phone number format (E.164 format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  // E.164 format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate configuration
 * @param {ReportConfiguration} config - Configuration to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validateConfig(config) {
  const errors = [];
  
  // Validate schedule
  if (config.schedule) {
    if (typeof config.schedule.enabled !== 'boolean') {
      errors.push('schedule.enabled must be a boolean');
    }
    
    if (!isValidTime(config.schedule.time)) {
      errors.push('schedule.time must be in HH:MM format (e.g., "18:00")');
    }
    
    if (!Array.isArray(config.schedule.days) || config.schedule.days.length === 0) {
      errors.push('schedule.days must be a non-empty array');
    }
    
    if (typeof config.schedule.timezone !== 'string' || config.schedule.timezone.length === 0) {
      errors.push('schedule.timezone must be a non-empty string');
    }
  } else {
    errors.push('schedule configuration is required');
  }
  
  // Validate distribution
  if (config.distribution) {
    if (typeof config.distribution.emailEnabled !== 'boolean') {
      errors.push('distribution.emailEnabled must be a boolean');
    }
    
    if (typeof config.distribution.smsEnabled !== 'boolean') {
      errors.push('distribution.smsEnabled must be a boolean');
    }
    
    // Validate email recipients
    if (!Array.isArray(config.distribution.emailRecipients)) {
      errors.push('distribution.emailRecipients must be an array');
    } else {
      config.distribution.emailRecipients.forEach((email, index) => {
        if (!isValidEmail(email)) {
          errors.push(`distribution.emailRecipients[${index}] is not a valid email: ${email}`);
        }
      });
    }
    
    // Validate SMS recipients
    if (!Array.isArray(config.distribution.smsRecipients)) {
      errors.push('distribution.smsRecipients must be an array');
    } else {
      config.distribution.smsRecipients.forEach((phone, index) => {
        if (!isValidPhone(phone)) {
          errors.push(`distribution.smsRecipients[${index}] is not a valid phone number (E.164 format): ${phone}`);
        }
      });
    }
    
    if (typeof config.distribution.includeAttachments !== 'boolean') {
      errors.push('distribution.includeAttachments must be a boolean');
    }
    
    if (typeof config.distribution.summaryOnly !== 'boolean') {
      errors.push('distribution.summaryOnly must be a boolean');
    }
  } else {
    errors.push('distribution configuration is required');
  }
  
  // Validate retention
  if (config.retention) {
    if (typeof config.retention.keepReports !== 'number' || config.retention.keepReports < 1) {
      errors.push('retention.keepReports must be a positive number');
    }
    
    if (typeof config.retention.autoCleanup !== 'boolean') {
      errors.push('retention.autoCleanup must be a boolean');
    }
  } else {
    errors.push('retention configuration is required');
  }
  
  // Validate dataCollection
  if (config.dataCollection) {
    if (typeof config.dataCollection.includeHistoricalComparison !== 'boolean') {
      errors.push('dataCollection.includeHistoricalComparison must be a boolean');
    }
    
    if (typeof config.dataCollection.comparisonDays !== 'number' || config.dataCollection.comparisonDays < 1) {
      errors.push('dataCollection.comparisonDays must be a positive number');
    }
  } else {
    errors.push('dataCollection configuration is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export {
  loadConfig,
  saveConfig,
  validateConfig,
  isValidEmail,
  isValidTime,
  isValidPhone,
  DEFAULT_CONFIG
};
