/**
 * Unit tests for Data Collector Service
 * Tests data aggregation and collection methods
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import dataCollector from '../../server/reports/dataCollector.js';

describe('Data Collector Service', () => {
  let startTime;
  let endTime;

  beforeEach(() => {
    // Set up 24-hour time range
    endTime = new Date();
    startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
  });

  describe('collectBuildingMetrics', () => {
    test('should return metrics for all buildings', async () => {
      const metrics = await dataCollector.collectBuildingMetrics(startTime, endTime);
      
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBe(7); // 7 buildings
      
      // Check first building has all required fields
      const firstBuilding = metrics[0];
      expect(firstBuilding).toHaveProperty('buildingId');
      expect(firstBuilding).toHaveProperty('buildingName');
      expect(firstBuilding).toHaveProperty('totalEnergy');
      expect(firstBuilding).toHaveProperty('avgPower');
      expect(firstBuilding).toHaveProperty('peakPower');
      expect(firstBuilding).toHaveProperty('avgOccupancy');
      expect(firstBuilding).toHaveProperty('avgTemperature');
      expect(firstBuilding).toHaveProperty('totalWastage');
      expect(firstBuilding).toHaveProperty('wastagePercent');
    });

    test('should have positive energy values', async () => {
      const metrics = await dataCollector.collectBuildingMetrics(startTime, endTime);
      
      metrics.forEach(building => {
        expect(building.totalEnergy).toBeGreaterThan(0);
        expect(building.avgPower).toBeGreaterThan(0);
        expect(building.peakPower).toBeGreaterThan(0);
      });
    });

    test('should have peak power greater than average power', async () => {
      const metrics = await dataCollector.collectBuildingMetrics(startTime, endTime);
      
      metrics.forEach(building => {
        expect(building.peakPower).toBeGreaterThanOrEqual(building.avgPower);
      });
    });

    test('should have valid occupancy and temperature ranges', async () => {
      const metrics = await dataCollector.collectBuildingMetrics(startTime, endTime);
      
      metrics.forEach(building => {
        expect(building.avgOccupancy).toBeGreaterThanOrEqual(0);
        expect(building.avgOccupancy).toBeLessThanOrEqual(100);
        expect(building.avgTemperature).toBeGreaterThan(15);
        expect(building.avgTemperature).toBeLessThan(30);
      });
    });
  });

  describe('collectAlerts', () => {
    test('should return alert summary structure', async () => {
      const alerts = await dataCollector.collectAlerts(startTime, endTime);
      
      expect(alerts).toBeDefined();
      expect(alerts).toHaveProperty('total');
      expect(alerts).toHaveProperty('critical');
      expect(alerts).toHaveProperty('warning');
      expect(alerts).toHaveProperty('info');
      expect(alerts).toHaveProperty('avgResponseTime');
      expect(alerts).toHaveProperty('topAlerts');
      expect(Array.isArray(alerts.topAlerts)).toBe(true);
    });

    test('should have total equal to sum of severities', async () => {
      const alerts = await dataCollector.collectAlerts(startTime, endTime);
      
      const sum = alerts.critical + alerts.warning + alerts.info;
      expect(alerts.total).toBe(sum);
    });

    test('should have non-negative counts', async () => {
      const alerts = await dataCollector.collectAlerts(startTime, endTime);
      
      expect(alerts.total).toBeGreaterThanOrEqual(0);
      expect(alerts.critical).toBeGreaterThanOrEqual(0);
      expect(alerts.warning).toBeGreaterThanOrEqual(0);
      expect(alerts.info).toBeGreaterThanOrEqual(0);
      expect(alerts.avgResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('collectAnomalies', () => {
    test('should return anomaly summary structure', async () => {
      const anomalies = await dataCollector.collectAnomalies(startTime, endTime);
      
      expect(anomalies).toBeDefined();
      expect(anomalies).toHaveProperty('totalDetected');
      expect(anomalies).toHaveProperty('byBuilding');
      expect(anomalies).toHaveProperty('criticalAnomalies');
      expect(anomalies).toHaveProperty('patterns');
      expect(Array.isArray(anomalies.criticalAnomalies)).toBe(true);
      expect(Array.isArray(anomalies.patterns)).toBe(true);
    });

    test('should have non-negative anomaly count', async () => {
      const anomalies = await dataCollector.collectAnomalies(startTime, endTime);
      
      expect(anomalies.totalDetected).toBeGreaterThanOrEqual(0);
    });

    test('critical anomalies should have required fields', async () => {
      const anomalies = await dataCollector.collectAnomalies(startTime, endTime);
      
      anomalies.criticalAnomalies.forEach(anomaly => {
        expect(anomaly).toHaveProperty('id');
        expect(anomaly).toHaveProperty('buildingId');
        expect(anomaly).toHaveProperty('type');
        expect(anomaly).toHaveProperty('description');
        expect(anomaly).toHaveProperty('impact');
        expect(anomaly).toHaveProperty('detectedAt');
      });
    });
  });

  describe('collectSustainabilityMetrics', () => {
    test('should return sustainability data structure', async () => {
      const sustainability = await dataCollector.collectSustainabilityMetrics(startTime, endTime);
      
      expect(sustainability).toBeDefined();
      expect(sustainability).toHaveProperty('totalCO2');
      expect(sustainability).toHaveProperty('energyIntensity');
      expect(sustainability).toHaveProperty('renewablePercent');
      expect(sustainability).toHaveProperty('costSavings');
      expect(sustainability).toHaveProperty('netZeroProgress');
    });

    test('should have positive values', async () => {
      const sustainability = await dataCollector.collectSustainabilityMetrics(startTime, endTime);
      
      expect(sustainability.totalCO2).toBeGreaterThan(0);
      expect(sustainability.energyIntensity).toBeGreaterThan(0);
      expect(sustainability.costSavings).toBeGreaterThanOrEqual(0);
    });

    test('should have valid percentage ranges', async () => {
      const sustainability = await dataCollector.collectSustainabilityMetrics(startTime, endTime);
      
      expect(sustainability.renewablePercent).toBeGreaterThanOrEqual(0);
      expect(sustainability.renewablePercent).toBeLessThanOrEqual(100);
      expect(sustainability.netZeroProgress).toBeGreaterThanOrEqual(0);
      expect(sustainability.netZeroProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('collectData', () => {
    test('should return complete report data structure', async () => {
      const reportData = await dataCollector.collectData(startTime, endTime);
      
      expect(reportData).toBeDefined();
      expect(reportData).toHaveProperty('period');
      expect(reportData).toHaveProperty('buildings');
      expect(reportData).toHaveProperty('alerts');
      expect(reportData).toHaveProperty('anomalies');
      expect(reportData).toHaveProperty('sustainability');
      expect(reportData).toHaveProperty('campusWide');
    });

    test('should have correct period dates', async () => {
      const reportData = await dataCollector.collectData(startTime, endTime);
      
      expect(reportData.period.start).toEqual(startTime);
      expect(reportData.period.end).toEqual(endTime);
    });

    test('should have campus-wide metrics', async () => {
      const reportData = await dataCollector.collectData(startTime, endTime);
      
      expect(reportData.campusWide).toHaveProperty('totalEnergy');
      expect(reportData.campusWide).toHaveProperty('totalWastage');
      expect(reportData.campusWide).toHaveProperty('avgEfficiency');
      expect(reportData.campusWide).toHaveProperty('peakDemand');
      expect(reportData.campusWide).toHaveProperty('peakDemandTime');
    });

    test('campus total energy should equal sum of building energies', async () => {
      const reportData = await dataCollector.collectData(startTime, endTime);
      
      const buildingSum = reportData.buildings.reduce((sum, b) => sum + b.totalEnergy, 0);
      const campusTotal = reportData.campusWide.totalEnergy;
      
      // Allow small floating point difference
      expect(Math.abs(campusTotal - buildingSum)).toBeLessThan(0.01);
    });

    test('campus total wastage should equal sum of building wastages', async () => {
      const reportData = await dataCollector.collectData(startTime, endTime);
      
      const buildingSum = reportData.buildings.reduce((sum, b) => sum + b.totalWastage, 0);
      const campusTotal = reportData.campusWide.totalWastage;
      
      // Allow small floating point difference
      expect(Math.abs(campusTotal - buildingSum)).toBeLessThan(0.01);
    });

    test('should handle errors gracefully', async () => {
      // Test with invalid date range
      const invalidStart = new Date('invalid');
      const invalidEnd = new Date();
      
      await expect(dataCollector.collectData(invalidStart, invalidEnd)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle short time ranges', async () => {
      const shortEnd = new Date();
      const shortStart = new Date(shortEnd.getTime() - 60 * 60 * 1000); // 1 hour
      
      const reportData = await dataCollector.collectData(shortStart, shortEnd);
      
      expect(reportData).toBeDefined();
      expect(reportData.buildings.length).toBe(7);
    });

    test('should handle long time ranges', async () => {
      const longEnd = new Date();
      const longStart = new Date(longEnd.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const reportData = await dataCollector.collectData(longStart, longEnd);
      
      expect(reportData).toBeDefined();
      expect(reportData.buildings.length).toBe(7);
    });
  });
});
