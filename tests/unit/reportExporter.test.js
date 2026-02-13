/**
 * Unit tests for Report Exporter Service
 * Tests PDF and CSV export functionality
 */

import { jest } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock dependencies
jest.unstable_mockModule('puppeteer', () => ({
  default: {
    launch: jest.fn()
  }
}));

jest.unstable_mockModule('../../server/reports/reportStorage.js', () => ({
  getReport: jest.fn()
}));

// Import after mocking
const { exportToPDF, exportToCSV, getExportPath } = await import('../../server/reports/reportExporter.js');
const { getReport } = await import('../../server/reports/reportStorage.js');
const puppeteer = (await import('puppeteer')).default;

describe('Report Exporter Service', () => {
  const mockReport = {
    id: 'test-2024-01-15',
    generatedAt: new Date('2024-01-15T18:00:00Z'),
    period: {
      start: new Date('2024-01-14T18:00:00Z'),
      end: new Date('2024-01-15T18:00:00Z')
    },
    summary: {
      totalEnergy: 1250.5,
      totalWastage: 125.3,
      totalAlerts: 15,
      criticalIssues: 2,
      sustainabilityScore: 78.5,
      keyHighlights: ['Energy consumption down 5%', 'Two critical alerts resolved']
    },
    buildingDetails: [
      {
        buildingId: 1,
        buildingName: 'Engineering Building',
        status: 'good',
        metrics: {
          totalEnergy: 450.2,
          avgPower: 18.75,
          peakPower: 35.5,
          avgOccupancy: 65.3,
          avgTemperature: 22.5,
          totalWastage: 45.1,
          wastagePercent: 10.0
        },
        issues: [],
        achievements: ['Reduced wastage by 3%']
      },
      {
        buildingId: 2,
        buildingName: 'Science Lab',
        status: 'needs_attention',
        metrics: {
          totalEnergy: 800.3,
          avgPower: 33.35,
          peakPower: 55.2,
          avgOccupancy: 72.1,
          avgTemperature: 23.1,
          totalWastage: 80.2,
          wastagePercent: 10.0
        },
        issues: ['High energy consumption'],
        achievements: []
      }
    ],
    alertSummary: {
      total: 15,
      critical: 2,
      warning: 8,
      info: 5,
      avgResponseTime: 12.5,
      topAlerts: []
    },
    anomalyInsights: {
      totalDetected: 3,
      byBuilding: new Map([[1, 1], [2, 2]]),
      criticalAnomalies: [
        {
          id: 'anom-1',
          buildingId: 2,
          type: 'power_spike',
          description: 'Unusual power spike detected',
          impact: 'High energy consumption',
          detectedAt: new Date('2024-01-15T14:30:00Z')
        }
      ],
      patterns: ['Evening power spikes']
    },
    sustainability: {
      totalCO2: 625.25,
      energyIntensity: 15.6,
      renewablePercent: 25.0,
      costSavings: 5420.0,
      netZeroProgress: 35.0
    },
    trends: [
      {
        metric: 'energy',
        direction: 'down',
        percentChange: -5.2,
        significance: 'medium'
      }
    ],
    recommendations: [
      {
        priority: 'high',
        category: 'energy',
        title: 'Investigate Science Lab power consumption',
        description: 'Science Lab showing higher than normal energy usage',
        expectedImpact: 'Potential 10% energy reduction',
        buildingIds: [2]
      }
    ],
    charts: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExportPath', () => {
    it('should generate correct PDF export path', () => {
      const path = getExportPath('test-report', 'pdf');
      expect(path).toContain('report-test-report.pdf');
      expect(path).toContain('.kiro/reports/exports');
    });

    it('should generate correct CSV export path', () => {
      const path = getExportPath('test-report', 'csv');
      expect(path).toContain('report-test-report.csv');
      expect(path).toContain('.kiro/reports/exports');
    });
  });

  describe('exportToPDF', () => {
    it('should generate PDF for valid report', async () => {
      // Mock report retrieval
      getReport.mockResolvedValue(mockReport);

      // Mock puppeteer
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content'))
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };
      puppeteer.launch.mockResolvedValue(mockBrowser);

      const pdfBuffer = await exportToPDF('test-2024-01-15');

      expect(getReport).toHaveBeenCalledWith('test-2024-01-15');
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.pdf).toHaveBeenCalledWith(expect.objectContaining({
        format: 'A4',
        printBackground: true
      }));
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });

    it('should throw error for non-existent report', async () => {
      getReport.mockResolvedValue(null);

      await expect(exportToPDF('non-existent')).rejects.toThrow('Report not found');
    });

    it('should close browser on error', async () => {
      getReport.mockResolvedValue(mockReport);

      const mockBrowser = {
        newPage: jest.fn().mockRejectedValue(new Error('Browser error')),
        close: jest.fn().mockResolvedValue(undefined)
      };
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(exportToPDF('test-2024-01-15')).rejects.toThrow('PDF generation failed');
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV for valid report', async () => {
      getReport.mockResolvedValue(mockReport);

      const csvPath = await exportToCSV('test-2024-01-15');

      expect(getReport).toHaveBeenCalledWith('test-2024-01-15');
      expect(csvPath).toContain('report-test-2024-01-15.csv');
      
      // Verify CSV file was created
      const fileExists = await fs.access(csvPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Read and verify CSV content
      const csvContent = await fs.readFile(csvPath, 'utf8');
      expect(csvContent).toContain('Building ID,Building Name');
      expect(csvContent).toContain('Engineering Building');
      expect(csvContent).toContain('Science Lab');
      expect(csvContent).toContain('450.20'); // Energy value
      expect(csvContent).toContain('800.30'); // Energy value

      // Cleanup
      await fs.unlink(csvPath).catch(() => {});
    });

    it('should throw error for non-existent report', async () => {
      getReport.mockResolvedValue(null);

      await expect(exportToCSV('non-existent')).rejects.toThrow('Report not found');
    });

    it('should format numbers with 2 decimal places', async () => {
      getReport.mockResolvedValue(mockReport);

      const csvPath = await exportToCSV('test-2024-01-15');
      const csvContent = await fs.readFile(csvPath, 'utf8');

      // Check that numbers are formatted correctly
      expect(csvContent).toMatch(/\d+\.\d{2}/); // Should have 2 decimal places

      // Cleanup
      await fs.unlink(csvPath).catch(() => {});
    });
  });

  describe('CSV Export Validity', () => {
    it('should generate valid CSV that can be parsed', async () => {
      getReport.mockResolvedValue(mockReport);

      const csvPath = await exportToCSV('test-2024-01-15');
      const csvContent = await fs.readFile(csvPath, 'utf8');

      // Split into lines
      const lines = csvContent.trim().split('\n');
      
      // Should have header + 2 data rows
      expect(lines.length).toBe(3);

      // Header should have correct columns
      const header = lines[0];
      expect(header).toContain('Building ID');
      expect(header).toContain('Building Name');
      expect(header).toContain('Total Energy');

      // Each data row should have same number of columns as header
      const headerCols = header.split(',').length;
      lines.slice(1).forEach(line => {
        const cols = line.split(',').length;
        expect(cols).toBe(headerCols);
      });

      // Cleanup
      await fs.unlink(csvPath).catch(() => {});
    });
  });
});
