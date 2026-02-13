/**
 * Unit tests for Configuration Manager
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadConfig,
  saveConfig,
  validateConfig,
  isValidEmail,
  isValidTime,
  isValidPhone,
  DEFAULT_CONFIG
} from '../../server/reports/configManager.jss/configManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_CONFIG_PATH = path.join(__dirname, '../../../.kiro/specs/daily-evaluation-report/config.json');

describe('Configuration Manager', () => {
  describe('Validation Functions', () => {
    describe('isValidEmail', () => {
      test('should validate correct email formats', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('admin@campus.edu')).toBe(true);
        expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      });

      test('should reject invalid email formats', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@domain')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });

    describe('isValidTime', () => {
      test('should validate correct time formats', () => {
        expect(isValidTime('00:00')).toBe(true);
        expect(isValidTime('12:30')).toBe(true);
        expect(isValidTime('18:00')).toBe(true);
        expect(isValidTime('23:59')).toBe(true);
      });

      test('should reject invalid time formats', () => {
        expect(isValidTime('24:00')).toBe(false);
        expect(isValidTime('12:60')).toBe(false);
        expect(isValidTime('1:30')).toBe(false);
        expect(isValidTime('12:5')).toBe(false);
        expect(isValidTime('invalid')).toBe(false);
        expect(isValidTime('')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      test('should validate correct phone formats (E.164)', () => {
        expect(isValidPhone('+918008584156')).toBe(true);
        expect(isValidPhone('+12025551234')).toBe(true);
        expect(isValidPhone('+447911123456')).toBe(true);
      });

      test('should reject invalid phone formats', () => {
        expect(isValidPhone('8008584156')).toBe(false); // Missing +
        expect(isValidPhone('+0123456789')).toBe(false); // Starts with 0
        expect(isValidPhone('+1')).toBe(false); // Too short
        expect(isValidPhone('invalid')).toBe(false);
        expect(isValidPhone('')).toBe(false);
      });
    });
  });

  describe('validateConfig', () => {
    test('should validate correct configuration', () => {
      const result = validateConfig(DEFAULT_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid time format', () => {
      const config = {
        ...DEFAULT_CONFIG,
        schedule: { ...DEFAULT_CONFIG.schedule, time: '25:00' }
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('schedule.time must be in HH:MM format (e.g., "18:00")');
    });

    test('should reject invalid email addresses', () => {
      const config = {
        ...DEFAULT_CONFIG,
        distribution: {
          ...DEFAULT_CONFIG.distribution,
          emailRecipients: ['valid@email.com', 'invalid-email']
        }
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not a valid email'))).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      const config = {
        ...DEFAULT_CONFIG,
        distribution: {
          ...DEFAULT_CONFIG.distribution,
          smsRecipients: ['+918008584156', '1234567890']
        }
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not a valid phone number'))).toBe(true);
    });

    test('should reject negative keepReports value', () => {
      const config = {
        ...DEFAULT_CONFIG,
        retention: { ...DEFAULT_CONFIG.retention, keepReports: -5 }
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('retention.keepReports must be a positive number');
    });

    test('should reject missing required sections', () => {
      const config = { schedule: DEFAULT_CONFIG.schedule };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('distribution configuration is required');
      expect(result.errors).toContain('retention configuration is required');
      expect(result.errors).toContain('dataCollection configuration is required');
    });
  });

  describe('loadConfig', () => {
    test('should load existing configuration', async () => {
      const config = await loadConfig();
      expect(config).toBeDefined();
      expect(config.schedule).toBeDefined();
      expect(config.distribution).toBeDefined();
      expect(config.retention).toBeDefined();
      expect(config.dataCollection).toBeDefined();
    });

    test('should merge with defaults for missing fields', async () => {
      const config = await loadConfig();
      // Should have all default fields even if some are missing from file
      expect(config.schedule.timezone).toBeDefined();
      expect(config.distribution.includeAttachments).toBeDefined();
      expect(config.retention.autoCleanup).toBeDefined();
    });
  });

  describe('saveConfig', () => {
    test('should save valid configuration', async () => {
      const testConfig = {
        ...DEFAULT_CONFIG,
        schedule: { ...DEFAULT_CONFIG.schedule, enabled: true, time: '20:00' }
      };
      
      await expect(saveConfig(testConfig)).resolves.not.toThrow();
      
      // Verify it was saved
      const loaded = await loadConfig();
      expect(loaded.schedule.enabled).toBe(true);
      expect(loaded.schedule.time).toBe('20:00');
    });

    test('should reject invalid configuration', async () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        schedule: { ...DEFAULT_CONFIG.schedule, time: 'invalid' }
      };
      
      await expect(saveConfig(invalidConfig)).rejects.toThrow('Invalid configuration');
    });
  });

  describe('Configuration Round-Trip', () => {
    test('should preserve configuration through save and load', async () => {
      const testConfig = {
        schedule: {
          enabled: true,
          time: "20:30",
          days: ["monday", "wednesday", "friday"],
          timezone: "America/New_York"
        },
        distribution: {
          emailEnabled: true,
          smsEnabled: true,
          emailRecipients: ["admin@test.com", "user@test.com"],
          smsRecipients: ["+12025551234"],
          includeAttachments: false,
          summaryOnly: true
        },
        retention: {
          keepReports: 60,
          autoCleanup: false
        },
        dataCollection: {
          includeHistoricalComparison: false,
          comparisonDays: 14
        }
      };
      
      await saveConfig(testConfig);
      const loaded = await loadConfig();
      
      expect(loaded.schedule.enabled).toBe(testConfig.schedule.enabled);
      expect(loaded.schedule.time).toBe(testConfig.schedule.time);
      expect(loaded.schedule.days).toEqual(testConfig.schedule.days);
      expect(loaded.distribution.emailRecipients).toEqual(testConfig.distribution.emailRecipients);
      expect(loaded.retention.keepReports).toBe(testConfig.retention.keepReports);
      expect(loaded.dataCollection.comparisonDays).toBe(testConfig.dataCollection.comparisonDays);
    });
  });
});
