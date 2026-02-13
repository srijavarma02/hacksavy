# Daily Evaluation Reports - User Guide

## Overview

The Daily Evaluation Reports feature provides comprehensive end-of-day summaries of your campus building monitoring system. Reports include energy consumption data, alert summaries, trends, and actionable recommendations.

## How to Use

### 1. Generate a Report

Click the **"📄 Generate Report"** button in the header (top right of the dashboard).

- The system will collect data from the past 24 hours
- A success message will appear with download links
- The report is automatically saved and can be viewed later

### 2. View Reports

Click the **"📄 Reports"** tab in the header navigation to access the Reports section.

You'll see:
- A list of all generated reports sorted by date (most recent first)
- Report cards showing key metrics:
  - Total Energy consumption
  - Total Alerts count
  - Critical Issues count
- Generation date and time for each report

### 3. View Report Details

Click on any report card to view the full report, which includes:

**Executive Summary**
- Total Energy, Wastage, Alerts, Critical Issues
- Sustainability Score
- Key Highlights

**Trends & Comparisons**
- Day-over-day and week-over-week comparisons
- Percentage changes for key metrics
- Trend significance indicators

**Building Performance Details**
- Per-building metrics and status
- Energy consumption and wastage
- Issues and achievements for each building

**Recommendations**
- Prioritized action items (High, Medium, Low)
- Expected impact of each recommendation
- Affected buildings

### 4. Export Reports

From the report detail view, use the export buttons:

- **📄 Export PDF** - Download a formatted PDF document
- **📊 Export CSV** - Download metric data in CSV format

Files are saved to your browser's Downloads folder as:
- `report-[reportId].pdf`
- `report-[reportId].csv`

### 5. Delete Reports

Click the 🗑️ icon on any report card to delete it (confirmation required).

## Report Storage

- Reports are stored in `.kiro/reports/` as JSON files
- Each report has a unique ID based on generation timestamp
- Reports can be accessed via the dashboard or API endpoints

## API Endpoints

If you need programmatic access:

```
GET    /api/reports                    # List all reports
GET    /api/reports/:id                # Get specific report
POST   /api/reports/generate           # Generate new report
DELETE /api/reports/:id                # Delete report
GET    /api/reports/:id/export/pdf     # Export to PDF
GET    /api/reports/:id/export/csv     # Export to CSV
```

## Tips

- Generate reports at the end of each day for consistent tracking
- Review trends to identify patterns in energy consumption
- Act on high-priority recommendations first
- Export reports for sharing with stakeholders
- Keep historical reports for long-term analysis

## Troubleshooting

**"No reports available yet"**
- Click "Generate Report" in the header to create your first report

**"Error Loading Reports"**
- Ensure the server is running on port 3001
- Check browser console for error details
- Click "Retry" to attempt loading again

**Export not downloading**
- Check browser's download settings
- Ensure pop-ups are not blocked
- Try the other export format (PDF or CSV)

## What's Next

Future enhancements planned:
- Automated scheduled report generation
- Email/SMS distribution to stakeholders
- Custom date range selection
- Report comparison tools
- Advanced filtering and search
