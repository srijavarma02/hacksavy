# ExportControls Component

## Overview
The ExportControls component provides export functionality for daily evaluation reports, allowing users to download reports in PDF or CSV format.

## Features
- ✅ PDF export with download
- ✅ CSV export with download  
- ✅ Export progress indicators (loading states)
- ✅ Error handling with user-friendly messages
- ✅ Disabled state when no report is selected
- ✅ Responsive design

## Usage

```jsx
import ExportControls from './components/Reports/ExportControls';

function ReportViewer() {
  const [selectedReportId, setSelectedReportId] = useState('report-2024-01-15');
  
  return (
    <div>
      <ExportControls reportId={selectedReportId} />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| reportId | string | No | The ID of the report to export. If not provided, export buttons will be disabled. |

## API Endpoints

The component calls the following API endpoints:

- `GET /api/reports/:id/export/pdf` - Returns PDF file as blob
- `GET /api/reports/:id/export/csv` - Returns CSV file as text

## Styling

The component uses `ExportControls.css` which follows the project's design system:
- Dark theme with glassmorphism effects
- Color-coded buttons (red for PDF, green for CSV)
- Smooth transitions and hover effects
- Responsive layout for mobile devices

## States

### Loading State
When an export is in progress, the button shows a spinner and "Exporting..." text.

### Error State
If an export fails, an error message is displayed below the buttons with the error details.

### Disabled State
When no reportId is provided, buttons are disabled and an info message is shown.

## Error Handling

The component handles the following error scenarios:
- No report selected
- Network failures
- Server errors (4xx, 5xx)
- Invalid responses

All errors are displayed to the user with clear, actionable messages.

## Requirements Validation

This component satisfies the following requirements from the spec:

- **Requirement 5.1**: PDF export functionality
- **Requirement 5.2**: CSV export functionality  
- **Requirement 5.5**: Download link/file provided after export

## Testing

Unit tests are available in `tests/unit/ExportControls.test.js` covering:
- Rendering with and without reportId
- Successful PDF export
- Successful CSV export
- Error handling
- Loading states
- Button disabled states

## Example Integration

```jsx
import { useState } from 'react';
import ReportList from './ReportList';
import ReportDetail from './ReportDetail';
import ExportControls from './ExportControls';

function ReportViewer() {
  const [selectedReport, setSelectedReport] = useState(null);
  
  return (
    <div className="report-viewer">
      <ReportList onSelectReport={setSelectedReport} />
      
      {selectedReport && (
        <>
          <ExportControls reportId={selectedReport.id} />
          <ReportDetail report={selectedReport} />
        </>
      )}
    </div>
  );
}
```
