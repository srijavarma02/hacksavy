import React, { useState, useEffect } from 'react';
import ReportSummary from './ReportSummary';
import BuildingSection from './BuildingSection';
import AlertSection from './AlertSection';
import TrendCharts from './TrendCharts';
import RecommendationList from './RecommendationList';
import ExportControls from './ExportControls';
import './ReportDetail.css';

function ReportDetail({ reportId, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3001/api/reports/${reportId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        console.error('Failed to fetch report:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="report-detail">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-detail">
        <div className="error-message">
          <h3>⚠️ Error Loading Report</h3>
          <p>{error}</p>
          <button onClick={onBack}>← Back to Reports</button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-detail">
        <div className="error-message">
          <h3>⚠️ Report Not Found</h3>
          <button onClick={onBack}>← Back to Reports</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-detail">
      <div className="report-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Reports
        </button>
        <div className="report-title-section">
          <h1>Daily Evaluation Report</h1>
          <p className="report-meta">
            Generated: {formatDate(report.generatedAt)}
          </p>
          {report.period && (
            <p className="report-period">
              Period: {formatDate(report.period.start)} - {formatDate(report.period.end)}
            </p>
          )}
        </div>
        <ExportControls reportId={reportId} />
      </div>

      <div className="report-content">
        {report.summary && <ReportSummary summary={report.summary} />}
        
        {report.charts && report.charts.length > 0 && (
          <TrendCharts charts={report.charts} />
        )}

        {report.buildingDetails && report.buildingDetails.length > 0 && (
          <BuildingSection buildings={report.buildingDetails} />
        )}

        {report.alertSummary && (
          <AlertSection alertSummary={report.alertSummary} />
        )}

        {report.recommendations && report.recommendations.length > 0 && (
          <RecommendationList recommendations={report.recommendations} />
        )}
      </div>
    </div>
  );
}

export default ReportDetail;
