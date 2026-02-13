/**
 * Jest setup file for test configuration
 * Runs before each test suite
 */

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Helper to create date ranges
  createDateRange: (daysAgo = 1) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - daysAgo);
    return { start, end };
  },

  // Helper to create mock building metrics
  createMockBuildingMetrics: (buildingId = 1) => ({
    buildingId,
    buildingName: `Building ${buildingId}`,
    totalEnergy: 100 + buildingId * 10,
    avgPower: 50 + buildingId * 5,
    peakPower: 80 + buildingId * 8,
    avgOccupancy: 60 + buildingId,
    avgTemperature: 22 + buildingId * 0.5,
    totalWastage: 10 + buildingId,
    wastagePercent: 10 + buildingId * 0.5
  }),

  // Helper to create mock alert summary
  createMockAlertSummary: () => ({
    total: 10,
    critical: 2,
    warning: 5,
    info: 3,
    avgResponseTime: 15,
    topAlerts: []
  }),

  // Helper to create mock anomaly summary
  createMockAnomalySummary: () => ({
    totalDetected: 5,
    byBuilding: new Map([[1, 2], [2, 3]]),
    criticalAnomalies: [],
    patterns: ['High energy usage', 'Temperature spike']
  }),

  // Helper to create mock sustainability data
  createMockSustainabilityData: () => ({
    totalCO2: 500,
    energyIntensity: 25,
    renewablePercent: 30,
    costSavings: 1000,
    netZeroProgress: 45
  })
};
