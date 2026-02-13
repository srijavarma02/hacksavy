# Daily Evaluation Report - Testing Guide

## What's Been Built (50% Complete)

We've implemented the core backend services for the Daily Evaluation Report feature:

### ✅ Completed Components

1. **Report Storage** - Save/retrieve/list/delete reports as JSON files
2. **Data Collector** - Aggregate metrics from buildings, alerts, ML service
3. **Report Analyzer** - Calculate trends, comparisons, recommendations
4. **Report Generator** - Create complete structured reports
5. **Report Exporter** - Export to PDF and CSV formats
6. **Configuration Manager** - Load/save/validate settings

### 📦 Installation Required

First, install the new dependencies:

```bash
cd hacksavvy26
npm install
```

This will install:
- `puppeteer` - For PDF generation
- `csv-writer` - For CSV export
- `nodemailer` - For email (not yet used)
- `jest` - For testing
- `fast-check` - For property-based testing

## Testing the Implementation

### Option 1: Quick Test Script (Recommended)

Run the provided test script to generate a sample report:

```bash
node test-report-generation.js
```

This will:
1. Generate a daily evaluation report
2. Display the report summary in console
3. Export to PDF and CSV
4. Show file locations

### Option 2: Manual Testing via Node REPL

```bash
node
```

Then run:

```javascript
// Import the report generator
import('./server/reports/reportGenerator.js').then(async ({ default: generator }) => {
  // Generate a report for the last 24 hours
  const report = await generator.generateReport();
  
  console.log('Report ID:', report.id);
  console.log('Total Energy:', report.summary.totalEnergy, 'kWh');
  console.log('Total Wastage:', report.summary.totalWastage, 'kWh');
  console.log('Total Alerts:', report.summary.totalAlerts);
  console.log('Sustainability Score:', report.summary.sustainabilityScore);
  console.log('Buildings:', report.buildingDetails.length);
  console.log('Recommendations:', report.recommendations.length);
  
  // Export to PDF
  const { exportToPDF, exportToCSV } = await import('./server/reports/reportExporter.js');
  
  await exportToPDF(report.id);
  console.log('PDF exported to: .kiro/reports/exports/report-' + report.id + '.pdf');
  
  await exportToCSV(report.id);
  console.log('CSV exported to: .kiro/reports/exports/report-' + report.id + '.csv');
});
```

### Option 3: Run Unit Tests

Test individual components:

```bash
# Test report storage
npm run test:unit -- reportStorage.test.js

# Test data collector
npm run test:unit -- dataCollector.test.js

# Test configuration manager
npm run test:unit -- configManager.test.js

# Run all tests
npm test
```

## What You Can Test

### 1. Report Generation

Generate a complete daily evaluation report:

```javascript
import reportGenerator from './server/reports/reportGenerator.js';

const report = await reportGenerator.generateReport();
```

**Expected Output:**
- Report ID (timestamp-based)
- Summary with key metrics
- 7 building details with status classifications
- Alert summary
- Anomaly insights from ML models
- Trends and comparisons (if historical data exists)
- Prioritized recommendations
- 5 chart configurations
- Sustainability metrics

### 2. Report Storage

Save and retrieve reports:

```javascript
import { saveReport, getReport, listReports } from './server/reports/reportStorage.js';

// Save a report
await saveReport(report);

// Retrieve by ID
const retrieved = await getReport(report.id);

// List all reports
const allReports = await listReports();

// List with filters
const filtered = await listReports({
  startDate: new Date('2024-02-01'),
  limit: 10
});
```

**Check Files:**
- Reports stored in: `.kiro/reports/report-{id}.json`

### 3. PDF Export

Generate a professional PDF report:

```javascript
import { exportToPDF } from './server/reports/reportExporter.js';

const pdfBuffer = await exportToPDF(report.id);
// PDF saved to: .kiro/reports/exports/report-{id}.pdf
```

**Open the PDF to see:**
- Executive summary with key metrics
- Building performance table
- Alerts summary
- Anomaly insights
- Trends with direction indicators
- Prioritized recommendations
- Sustainability metrics
- Professional styling with color-coded status badges

### 4. CSV Export

Export building metrics to CSV:

```javascript
import { exportToCSV } from './server/reports/reportExporter.js';

const csvPath = await exportToCSV(report.id);
// CSV saved to: .kiro/reports/exports/report-{id}.csv
```

**Open in Excel/Sheets to see:**
- Building ID, Name, Status
- Energy, Power, Occupancy, Temperature
- Wastage metrics

### 5. Configuration Management

Load and modify settings:

```javascript
import { loadConfig, saveConfig } from './server/reports/configManager.js';

// Load current config
const config = await loadConfig();

// Modify settings
config.schedule.enabled = true;
config.schedule.time = "18:00";
config.distribution.emailRecipients = ["admin@example.com"];

// Save (with validation)
await saveConfig(config);
```

**Configuration File:**
- Location: `.kiro/specs/daily-evaluation-report/config.json`

## Expected Results

### Report Summary Example

```
Report ID: 2024-02-13-180000
Period: 2024-02-12 18:00 - 2024-02-13 18:00

Summary:
- Total Energy: 15,234.56 kWh
- Total Wastage: 1,523.45 kWh
- Total Alerts: 12
- Critical Issues: 3
- Sustainability Score: 78.5/100

Buildings: 7
- Engineering Block: good
- Science Lab: needs_attention
- Library: excellent
- Dorm A: good
- Dorm B: good
- Admin Building: excellent
- Sports Complex: good

Recommendations: 5
- [HIGH] High Energy Consumption Detected
- [HIGH] Buildings with High Energy Wastage
- [MEDIUM] Anomalies Detected by ML Models
- [MEDIUM] Net Zero Progress Below Target
- [LOW] Energy Wastage Reduction Success
```

### File Locations

After testing, check these directories:

```
.kiro/
├── reports/
│   ├── report-2024-02-13-180000.json    # Generated report
│   └── exports/
│       ├── report-2024-02-13-180000.pdf  # PDF export
│       └── report-2024-02-13-180000.csv  # CSV export
└── specs/
    └── daily-evaluation-report/
        └── config.json                    # Configuration
```

## Troubleshooting

### Issue: "Cannot find module"

**Solution:** Make sure you've run `npm install` in the hacksavvy26 directory.

### Issue: "Puppeteer failed to launch"

**Solution:** Puppeteer downloads Chromium automatically. If it fails:
```bash
# Windows
set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
npm install puppeteer

# Or use system Chrome
# Edit reportExporter.js and add: executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
```

### Issue: "Report not found"

**Solution:** Generate a report first before trying to export it:
```javascript
const report = await reportGenerator.generateReport();
await exportToPDF(report.id);  // Use the generated report ID
```

### Issue: "ML service unavailable"

**Solution:** This is expected if ML models aren't trained yet. The report will still generate without anomaly insights.

## What's NOT Yet Implemented

The following features are planned but not yet built:

- ❌ Report Distributor (email/SMS sending)
- ❌ Report Scheduler (automated daily generation)
- ❌ REST API endpoints
- ❌ React UI components
- ❌ Dashboard integration

These will be implemented in the remaining 50% of the project.

## Next Steps

After testing, you can:

1. **Continue Implementation** - Build the remaining features (scheduler, API, UI)
2. **Customize** - Modify report templates, add more metrics, adjust thresholds
3. **Integrate** - Connect to your existing monitoring system
4. **Deploy** - Set up automated daily report generation

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed (`npm install`)
3. Ensure the server is running (`npm run server`)
4. Check file permissions for `.kiro/` directory
5. Review the implementation notes in `server/reports/IMPLEMENTATION_NOTES.md`

Happy testing! 🎉
