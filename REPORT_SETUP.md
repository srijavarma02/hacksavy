# Daily Evaluation Report - Setup Guide

## Installation

The project structure and configuration files have been created. To complete the setup, you need to install the required npm packages.

### Required Packages

The following packages have been added to `package.json`:

**Dependencies:**
- `puppeteer` (^21.9.0) - For PDF generation
- `csv-writer` (^1.6.0) - For CSV export
- `nodemailer` (^6.9.8) - For email distribution
- `node-cron` (^3.0.3) - Already installed, for scheduling

**Dev Dependencies:**
- `jest` (^29.7.0) - Test runner
- `fast-check` (^3.15.0) - Property-based testing library

### Installation Command

Run the following command in the `hacksavvy26` directory:

```bash
npm install
```

This will install all the new dependencies listed in package.json.

## Project Structure

The following directories and files have been created:

```
hacksavvy26/
├── server/
│   └── reports/
│       ├── types.js              # Shared type definitions
│       └── README.md             # Services documentation
├── tests/
│   ├── setup.js                  # Jest setup and test utilities
│   ├── unit/                     # Unit tests directory
│   └── property/                 # Property-based tests directory
├── jest.config.js                # Jest configuration
└── REPORT_SETUP.md              # This file

.kiro/
├── reports/                      # Generated reports storage
│   └── .gitkeep
└── specs/
    └── daily-evaluation-report/
        └── config.json           # Default configuration
```

## Configuration

Default configuration has been created at `.kiro/specs/daily-evaluation-report/config.json`:

```json
{
  "schedule": {
    "enabled": false,
    "time": "18:00",
    "days": ["all"],
    "timezone": "Asia/Kolkata"
  },
  "distribution": {
    "emailEnabled": false,
    "smsEnabled": false,
    "emailRecipients": [],
    "smsRecipients": [],
    "includeAttachments": true,
    "summaryOnly": false
  },
  "retention": {
    "keepReports": 30,
    "autoCleanup": true
  },
  "dataCollection": {
    "includeHistoricalComparison": true,
    "comparisonDays": 7
  }
}
```

## Testing

New test scripts have been added to package.json:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only property-based tests
npm run test:property
```

## Next Steps

After running `npm install`, you can proceed with:

1. **Task 2**: Implement report storage service
2. **Task 3**: Implement data collector service
3. **Task 4**: Implement report analyzer service

## Type Definitions

All TypeScript-style interfaces have been defined as JSDoc comments in `server/reports/types.js`. These provide IntelliSense support in VS Code and other editors.

## Test Utilities

Global test utilities are available in all test files via `global.testUtils`:

- `createDateRange(daysAgo)` - Create date ranges for testing
- `createMockBuildingMetrics(buildingId)` - Generate mock building data
- `createMockAlertSummary()` - Generate mock alert data
- `createMockAnomalySummary()` - Generate mock anomaly data
- `createMockSustainabilityData()` - Generate mock sustainability data

## Notes

- Jest is configured to use Node environment for server-side testing
- Test timeout is set to 30 seconds to accommodate property-based tests
- Coverage thresholds are set to 70% for all metrics
- ES modules are supported via `--experimental-vm-modules` flag
