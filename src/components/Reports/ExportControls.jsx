import { useState } from 'react';
import './ExportControls.css';

function ExportControls({ reportId }) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [error, setError] = useState(null);

  const handleExportPDF = async () => {
    if (!reportId) {
      setError('No report selected');
      return;
    }

    try {
      setExportingPDF(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/reports/${reportId}/export/pdf`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
      setError(err.message);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportId) {
      setError('No report selected');
      return;
    }

    try {
      setExportingCSV(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/reports/${reportId}/export/csv`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the CSV text from response
      const csvText = await response.text();
      
      // Create download link
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export error:', err);
      setError(err.message);
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="export-controls">
      <h3>📥 Export Report</h3>
      
      <div className="export-buttons">
        <button 
          className="export-btn pdf-btn"
          onClick={handleExportPDF}
          disabled={exportingPDF || !reportId}
        >
          {exportingPDF ? (
            <>
              <span className="spinner"></span>
              Exporting PDF...
            </>
          ) : (
            <>
              <span className="icon">📄</span>
              Export as PDF
            </>
          )}
        </button>

        <button 
          className="export-btn csv-btn"
          onClick={handleExportCSV}
          disabled={exportingCSV || !reportId}
        >
          {exportingCSV ? (
            <>
              <span className="spinner"></span>
              Exporting CSV...
            </>
          ) : (
            <>
              <span className="icon">📊</span>
              Export as CSV
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="export-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!reportId && (
        <div className="export-info">
          <span className="info-icon">ℹ️</span>
          <span>Select a report to enable export</span>
        </div>
      )}
    </div>
  );
}

export default ExportControls;
