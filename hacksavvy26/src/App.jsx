import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsGrid from './components/MetricsGrid';
import CampusMap from './components/CampusMap';
import BuildingDetails from './components/BuildingDetails';
import AlertsPanel from './components/AlertsPanel';
import SmartAlerts from './components/SmartAlerts';
import HistoricalAnalytics from './components/HistoricalAnalytics';
import SustainabilityMetrics from './components/SustainabilityMetrics';
import ThresholdControls from './components/ThresholdControls';
import ErrorBoundary from './components/ErrorBoundary';
import AIChat from './components/AIChat';
import ReportGenerator from './components/ReportGenerator';
import './App.css';

function App() {
  const [energyData, setEnergyData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [viewMode, setViewMode] = useState('overview'); // overview, analytics, sustainability
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    
    websocket.onopen = () => {
      console.log('Connected to energy monitoring system');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEnergyData(data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Current viewMode:', viewMode);
  }, [viewMode]);

  return (
    <div className="app">
      <Header 
        timeFilter={timeFilter} 
        setTimeFilter={setTimeFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <div className="main-content">
        {viewMode === 'overview' && (
          <>
            <div className="left-panel">
              <MetricsGrid data={energyData} />
              <CampusMap 
                data={energyData} 
                selectedBuilding={selectedBuilding}
                setSelectedBuilding={setSelectedBuilding}
              />
            </div>
            
            <div className="right-panel">
              <BuildingDetails 
                building={selectedBuilding} 
                data={energyData}
                timeFilter={timeFilter}
              />
            </div>
          </>
        )}

        {viewMode === 'analytics' && (
          <div className="full-width-panel">
            <ErrorBoundary componentName="AIChat">
              <AIChat />
            </ErrorBoundary>
            <ErrorBoundary componentName="ThresholdControls">
              <ThresholdControls />
            </ErrorBoundary>
            <ErrorBoundary componentName="HistoricalAnalytics">
              <HistoricalAnalytics 
                building={selectedBuilding}
                timeRange={timeFilter}
              />
            </ErrorBoundary>
            <ErrorBoundary componentName="SmartAlerts">
              <SmartAlerts />
            </ErrorBoundary>
          </div>
        )}

        {viewMode === 'sustainability' && (
          <div className="full-width-panel">
            <SustainabilityMetrics />
            <HistoricalAnalytics 
              building={selectedBuilding}
              timeRange={timeFilter}
            />
          </div>
        )}

        {viewMode === 'reports' && (
          <div className="full-width-panel">
            <ErrorBoundary componentName="ReportGenerator">
              <ReportGenerator />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
