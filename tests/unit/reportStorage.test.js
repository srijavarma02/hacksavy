/**
 * Unit tests for reportStorage service
 * Tests storage, retrieval, listing, and deletion of reports
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  saveReport,
  getReport,
  listReports,
  deleteReport,
  cleanupOldReports
} from '../../server/reports/reportStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_REPORTS_DIR = path.join(__dirname, '../../.kiro/reports');

// Helper function to create a mock report
function createMockReport(id, generatedAt = new Date()) {
  return {
    id,
    generatedAt,
    period: {
      start: new Date(generatedAt.getTime() - 24 * 60 * 60 * 1000),
      end: generatedAt
    },
    summary: {
      totalEnergy: 1000,
      totalWastage: 50,
      totalAlerts: 10,
      criticalIssues: 2,
      sustainabilityScore: 85,
      keyHighlights: ['Test highlight']
    },
    buildingDetails: [
      {
        buildingId: 1,
        buildingName: 'Engineering Building',
        metrics: {
          buildingId: 1,
          buildingName: 'Engineering Building',
          totalEnergy: 500,
          avgPower: 20,
          peakPower: 40,
          avgOccupancy: 75,
          avgTemperature: 22,
          totalWastage: 25,
          wastagePercent: 5
        },
        status: 'good',
        issues: [],
        achievements: ['Reduced energy consumption']
      }
    ],
    alertSummary: {
      total: 10,
      critical: 2,
      warning: 5,
      info: 3,
      avgResponseTime: 15,
      topAlerts: []
    },
    anomalyInsights: {
      totalDetected: 3,
      byBuilding: new Map([[1, 3]]),
      criticalAnomalies: [],
      patterns: ['High energy usage at night']
    },
    sustainability: {
      totalCO2: 500,
      energyIntensity: 10,
      renewablePercent: 30,
      costSavings: 1000,
      netZeroProgress: 40
    },
    trends: [],
    recommendations: [],
    charts: []
  };
}

describe('reportStorage', () => {
  // Clean up test reports after each test
  afterEach(async () => {
    try {
      const files = await fs.readdir(TEST_REPORTS_DIR);
      for (const file of files) {
        if (file.startsWith('report-test-')) {
          await fs.unlink(path.join(TEST_REPORTS_DIR, file));
        }
      }
    } catch (error) {
      // Ignore errors if directory doesn't exist
    }
  });

  describe('saveReport', () => {
    test('should save a report to file storage', async () => {
      const report = createMockReport('test-save-1');
      
      await saveReport(report);
      
      // Verify file exists
      const filePath = path.join(TEST_REPORTS_DIR, 'report-test-save-1.json');
      const fileContent = await fs.readFile(filePath, 'utf8');
      const savedReport = JSON.parse(fileContent);
      
      expect(savedReport.id).toBe('test-save-1');
      expect(savedReport.summary.totalEnergy).toBe(1000);
    });

    test('should create reports directory if it does not exist', async () => {
      // This test verifies the directory is created automatically
      const report = createMockReport('test-save-2');
      
      await saveReport(report);
      
      // Verify directory exists
      const stats = await fs.stat(TEST_REPORTS_DIR);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('getReport', () => {
    test('should retrieve a report by ID', async () => {
      const originalReport = createMockReport('test-get-1');
      await saveReport(originalReport);
      
      const retrievedReport = await getReport('test-get-1');
      
      expect(retrievedReport).not.toBeNull();
      expect(retrievedReport.id).toBe('test-get-1');
      expect(retrievedReport.summary.totalEnergy).toBe(1000);
      expect(retrievedReport.generatedAt).toBeInstanceOf(Date);
      expect(retrievedReport.period.start).toBeInstanceOf(Date);
      expect(retrievedReport.period.end).toBeInstanceOf(Date);
    });

    test('should return null for non-existent report', async () => {
      const report = await getReport('non-existent-id');
      
      expect(report).toBeNull();
    });

    test('should handle invalid JSON gracefully', async () => {
      // Create a file with invalid JSON
      const filePath = path.join(TEST_REPORTS_DIR, 'report-test-invalid.json');
      await fs.mkdir(TEST_REPORTS_DIR, { recursive: true });
      await fs.writeFile(filePath, 'invalid json content', 'utf8');
      
      await expect(getReport('test-invalid')).rejects.toThrow();
    });
  });

  describe('listReports', () => {
    test('should list all reports sorted by date descending', async () => {
      const now = new Date();
      const report1 = createMockReport('test-list-1', new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
      const report2 = createMockReport('test-list-2', new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
      const report3 = createMockReport('test-list-3', now);
      
      await saveReport(report1);
      await saveReport(report2);
      await saveReport(report3);
      
      const reports = await listReports();
      
      expect(reports.length).toBeGreaterThanOrEqual(3);
      // Most recent should be first
      const testReports = reports.filter(r => r.id.startsWith('test-list-'));
      expect(testReports[0].id).toBe('test-list-3');
      expect(testReports[1].id).toBe('test-list-2');
      expect(testReports[2].id).toBe('test-list-1');
    });

    test('should filter reports by date range', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const midDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      
      const report1 = createMockReport('test-filter-1', oldDate);
      const report2 = createMockReport('test-filter-2', midDate);
      const report3 = createMockReport('test-filter-3', now);
      
      await saveReport(report1);
      await saveReport(report2);
      await saveReport(report3);
      
      const filterDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const reports = await listReports({ startDate: filterDate });
      
      const testReports = reports.filter(r => r.id.startsWith('test-filter-'));
      expect(testReports.length).toBe(2);
      expect(testReports.some(r => r.id === 'test-filter-2')).toBe(true);
      expect(testReports.some(r => r.id === 'test-filter-3')).toBe(true);
    });

    test('should filter reports by building IDs', async () => {
      const report1 = createMockReport('test-building-1');
      report1.buildingDetails[0].buildingId = 1;
      
      const report2 = createMockReport('test-building-2');
      report2.buildingDetails[0].buildingId = 2;
      
      await saveReport(report1);
      await saveReport(report2);
      
      const reports = await listReports({ buildingIds: [1] });
      
      const testReports = reports.filter(r => r.id.startsWith('test-building-'));
      expect(testReports.length).toBe(1);
      expect(testReports[0].id).toBe('test-building-1');
    });

    test('should apply limit to results', async () => {
      const report1 = createMockReport('test-limit-1');
      const report2 = createMockReport('test-limit-2');
      const report3 = createMockReport('test-limit-3');
      
      await saveReport(report1);
      await saveReport(report2);
      await saveReport(report3);
      
      const reports = await listReports({ limit: 2 });
      
      expect(reports.length).toBeLessThanOrEqual(2);
    });

    test('should return empty array when no reports exist', async () => {
      // Clean up all test reports first
      try {
        const files = await fs.readdir(TEST_REPORTS_DIR);
        for (const file of files) {
          await fs.unlink(path.join(TEST_REPORTS_DIR, file));
        }
      } catch (error) {
        // Ignore if directory doesn't exist
      }
      
      const reports = await listReports();
      
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBe(0);
    });
  });

  describe('deleteReport', () => {
    test('should delete a report by ID', async () => {
      const report = createMockReport('test-delete-1');
      await saveReport(report);
      
      const deleted = await deleteReport('test-delete-1');
      
      expect(deleted).toBe(true);
      
      // Verify file no longer exists
      const retrievedReport = await getReport('test-delete-1');
      expect(retrievedReport).toBeNull();
    });

    test('should return false for non-existent report', async () => {
      const deleted = await deleteReport('non-existent-id');
      
      expect(deleted).toBe(false);
    });
  });

  describe('cleanupOldReports', () => {
    test('should delete reports older than specified date', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      const oldReport = createMockReport('test-cleanup-old', oldDate);
      const recentReport = createMockReport('test-cleanup-recent', recentDate);
      
      await saveReport(oldReport);
      await saveReport(recentReport);
      
      const threshold = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const deletedCount = await cleanupOldReports(threshold);
      
      expect(deletedCount).toBeGreaterThanOrEqual(1);
      
      // Verify old report is deleted
      const oldRetrieved = await getReport('test-cleanup-old');
      expect(oldRetrieved).toBeNull();
      
      // Verify recent report still exists
      const recentRetrieved = await getReport('test-cleanup-recent');
      expect(recentRetrieved).not.toBeNull();
    });

    test('should return 0 when no old reports exist', async () => {
      const now = new Date();
      const recentReport = createMockReport('test-cleanup-none', now);
      await saveReport(recentReport);
      
      const threshold = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const deletedCount = await cleanupOldReports(threshold);
      
      expect(deletedCount).toBe(0);
    });
  });
});
