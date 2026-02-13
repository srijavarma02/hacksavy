/**
 * Jest configuration for Daily Evaluation Report feature
 * Supports both unit tests and property-based tests with fast-check
 */

export default {
  // Use Node environment for server-side testing
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/property/**/*.property.test.js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'server/reports/**/*.js',
    '!server/reports/types.js',
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Transform ES modules
  transform: {},
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Verbose output
  verbose: true,

  // Test timeout (increased for property-based tests)
  testTimeout: 30000,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
