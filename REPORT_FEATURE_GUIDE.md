# Daily Evaluation Report Feature - Quick Guide

## What's Implemented

The Daily Evaluation Report feature allows you to generate comprehensive daily reports of your campus energy monitoring system with a single click.

## Features

### 1. Report Generation
- Collects data from all buildings, alerts, anomalies, and sustainability metrics
- Analyzes trends and generates recommendations
- Creates structured report with charts and visualizations
- Stores reports in `.kiro/reports/` directory

### 2. Export Options
- **PDF Export**: Professional formatted report with charts and tables
- **CSV Export**: Tabular data for spreadsheet analysis

### 3. Dashboard Integration
- Simple "Generate Report" button in the header
- Real-time generation status
- Success/error notifications

## How to Use

### From the Dashboard

1. Start the server: `npm start` (in hacksavvy26 directory)
2. Open the dashboard in your browser
3. Click the **"📄 Generate Report"** button in the header
4. Wait for the report to generate (takes a few seconds)
5. Download the PDF or CSV when ready

### Using the API

#### Generate a Report
```bash
curl -X POST http://localhost:3001/api/reports/generate
```

#### List All Reports
```bash
curl http://localhost:3001/api/reports
```

#### Get Specific Report
```bash
curl http://localhost:3001/api/reports/{reportId}
```

#### Download PDF
```bash
curl http://localhost:3001/api/reports/{reportId}/export/pdf -o report.pdf
```

#### Download CSV
```bash
curl http://localhost:3001/api/reports/{reportId}/export/csv -o report.csv
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate a new report |
| GET | `/api/reports` | List all reports |
| GET | `/api/reports/:id` | Get specific report |
| DELETE | `/api/reports/:id` | Delete a report |
| GET | `/api/reports/:id/export/pdf` | Download PDF |
| GET | `/api/reports/:id/export/csv` | Download CSV |

## Report Contents

Each report includes:

### Executive Summary
- Total energy consumption
- Total wastage
- Alert counts
- Critical issues
- Sustainability score
- Key highlights

### Building Performance
- Individual building metrics
- Status classification (excellent/good/needs attention/critical)
- Energy consumption and wastage
- Temperature and occupancy data

### Alerts Summary
- Total alerts by severity
- Average response time
- Alert distribution

### Anomaly Insights
- ML-detected anomalies
- Critical anomalies with details
- Impact assessment

### Trends
- Day-over-day comparisons
- Week-over-week comparisons
- Significant changes

### Recommendations
- Prioritized action items
- Expected impact
- Category grouping

### Sustainability Metrics
- CO₂ emissions
- Energy intensity
- Renewable percentage
- Cost savings
- Net zero progress

### Visualizations
- Energy consumption by building (bar chart)
- Wastage percentage by building (bar chart)
- Alert distribution (pie chart)
- Trends comparison (line chart)
- Sustainability metrics (bar chart)

## File Locations

- **Reports**: `.kiro/reports/report-{id}.json`
- **PDF Exports**: `.kiro/reports/exports/report-{id}.pdf`
- **CSV Exports**: `.kiro/reports/exports/report-{id}.csv`

## Testing

Run the test script to verify the API:

```bash
node test-report-api.js
```

This will:
1. Generate a new report
2. List all reports
3. Fetch the specific report
4. Verify export endpoints

## Next Steps

The basic report generation is working! Future enhancements could include:

1. **Scheduling**: Automatic daily report generation at configured time
2. **Distribution**: Email/SMS delivery of reports
3. **UI Components**: React components to view reports in the dashboard
4. **Configuration**: Settings panel for report preferences
5. **Historical Comparison**: More detailed trend analysis

## Troubleshooting

### Report generation fails
- Check that the server is running on port 3001
- Verify that building data is being collected
- Check server logs for errors

### PDF export fails
- Ensure Puppeteer is installed: `npm install puppeteer`
- Check that Chromium downloaded successfully
- Verify sufficient disk space

### CSV export fails
- Ensure csv-writer is installed: `npm install csv-writer`
- Check write permissions for `.kiro/reports/exports/`

## Technical Details

### Backend Services
- `reportGenerator.js`: Orchestrates report creation
- `dataCollector.js`: Aggregates metrics from all sources
- `reportAnalyzer.js`: Performs trend analysis and generates recommendations
- `reportStorage.js`: File-based JSON storage
- `reportExporter.js`: PDF and CSV export using Puppeteer and csv-writer

### Frontend
- `Header.jsx`: Contains the "Generate Report" button
- API calls to backend for report generation
- Real-time status updates and notifications
