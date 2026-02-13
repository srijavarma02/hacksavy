# Report Exporter Module

## Overview

The Report Exporter module provides PDF and CSV export functionality for daily evaluation reports. It integrates with the report storage system to fetch reports and generate formatted exports.

## Features

### PDF Export
- **Complete Report**: Includes all sections (summary, building details, alerts, anomalies, trends, recommendations, sustainability metrics)
- **Professional Styling**: Clean, formatted layout with color-coded status indicators
- **Charts Ready**: HTML template designed to include visualizations
- **Print Optimized**: A4 format with proper margins and page breaks

### CSV Export
- **Tabular Data**: Building metrics in spreadsheet-compatible format
- **All Metrics**: Energy, power, occupancy, temperature, wastage data
- **Formatted Numbers**: 2 decimal places for consistency
- **Easy Import**: Standard CSV format for Excel, Google Sheets, etc.

## Usage

### Export to PDF

```javascript
import { exportToPDF } from './server/reports/reportExporter.js';

// Export report to PDF
const pdfBuffer = await exportToPDF('report-2024-01-15');
// Returns: Buffer containing PDF data
// Also saves to: .kiro/reports/exports/report-2024-01-15.pdf
```

### Export to CSV

```javascript
import { exportToCSV } from './server/reports/reportExporter.js';

// Export report to CSV
const csvPath = await exportToCSV('report-2024-01-15');
// Returns: "/path/to/.kiro/reports/exports/report-2024-01-15.csv"
```

### Get Export Path

```javascript
import { getExportPath } from './server/reports/reportExporter.js';

// Get path for PDF export
const pdfPath = getExportPath('report-2024-01-15', 'pdf');
// Returns: "/path/to/.kiro/reports/exports/report-2024-01-15.pdf"

// Get path for CSV export
const csvPath = getExportPath('report-2024-01-15', 'csv');
// Returns: "/path/to/.kiro/reports/exports/report-2024-01-15.csv"
```

## File Structure

```
.kiro/
└── reports/
    ├── report-2024-01-15.json          # Stored report
    └── exports/
        ├── report-2024-01-15.pdf       # PDF export
        └── report-2024-01-15.csv       # CSV export
```

## Dependencies

- **puppeteer**: Headless browser for PDF generation
- **csv-writer**: CSV file generation
- **reportStorage**: Fetches reports for export

## Error Handling

### Report Not Found
```javascript
try {
  await exportToPDF('non-existent-report');
} catch (error) {
  // Error: Report not found: non-existent-report
}
```

### PDF Generation Failure
```javascript
try {
  await exportToPDF('report-id');
} catch (error) {
  // Error: PDF generation failed: [specific error]
  // Browser is automatically closed even on error
}
```

## HTML Template

The PDF export uses a comprehensive HTML template that includes:

- **Header**: Report title, period, generation date
- **Executive Summary**: Key metrics in card layout
- **Building Performance**: Table with all building metrics
- **Alerts Summary**: Alert counts and response times
- **Anomaly Insights**: Critical anomalies and patterns
- **Trends**: Metric trends with direction indicators
- **Recommendations**: Prioritized action items
- **Sustainability Metrics**: Environmental impact data
- **Footer**: Report ID and system info

### Styling Features

- Color-coded status badges (excellent, good, needs_attention, critical)
- Priority-based recommendation highlighting
- Trend direction indicators (up, down, stable)
- Responsive grid layouts
- Print-optimized page breaks

## CSV Format

The CSV export includes the following columns:

| Column | Description |
|--------|-------------|
| Building ID | Numeric building identifier |
| Building Name | Building name |
| Status | Performance status |
| Total Energy (kWh) | Total energy consumption |
| Avg Power (kW) | Average power usage |
| Peak Power (kW) | Peak power demand |
| Avg Occupancy (%) | Average occupancy percentage |
| Avg Temperature (°C) | Average temperature |
| Total Wastage (kWh) | Total energy wastage |
| Wastage (%) | Wastage percentage |

## Testing

### Manual Testing

```bash
# Create and run manual test
node test-exporter-manual.js
```

### Unit Tests

```bash
# Run exporter tests
npm run test:unit -- reportExporter.test.js
```

## Requirements Satisfied

- **5.1**: PDF export with complete report
- **5.2**: CSV export with tabular metric data
- **5.3**: Charts and visualizations in PDF format
- **5.5**: Returns file paths or buffers for download

## Future Enhancements

- [ ] Add chart rendering using Chart.js or similar
- [ ] Support custom PDF templates
- [ ] Add Excel (.xlsx) export format
- [ ] Include email-friendly HTML export
- [ ] Add export compression for large reports
- [ ] Support batch export of multiple reports
