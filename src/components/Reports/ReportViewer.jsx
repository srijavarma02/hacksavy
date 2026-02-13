import React, { useState } from 'react';
import ReportList from './ReportList';
import ReportDetail from './ReportDetail';
import './ReportViewer.css';

function ReportViewer() {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
  };

  const handleBackToList = () => {
    setSelectedReportId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setGenerationError(null);
      
      const response = await fetch('http://localhost:3001/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh the report list
      setRefreshTrigger(prev => prev + 1);
      
      // Navigate to the newly generated report
      if (data.report && data.report.id) {
        setSelectedReportId(data.report.id);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setGenerationError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="report-viewer">
      <div className="report-viewer-header">
        <div className="header-content">
          <h1 className="viewer-title">📊 Daily Evaluation Reports</h1>
          <p className="viewer-subtitle">
            Comprehensive daily summaries of building performance and energy metrics
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '✨ Generate Report'}
          </button>
        </div>
      </div>

      {generationError && (
        <div className="generation-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{generationError}</span>
          <button 
            className="dismiss-error-btn"
            onClick={() => setGenerationError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="report-viewer-content">
        {!selectedReportId ? (
          <ReportList 
            onSelectReport={handleSelectReport}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <ReportDetail 
            reportId={selectedReportId}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}

export default ReportViewer;
