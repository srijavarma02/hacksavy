import { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsGrid from './components/MetricsGrid';
import CampusMap from './components/CampusMap';
import BuildingDetails from './components/BuildingDetails';
import SmartAlerts from './components/SmartAlerts';
import HistoricalAnalytics from './components/HistoricalAnalytics';
import SustainabilityMetrics from './components/SustainabilityMetrics';
import ThresholdControls from './components/ThresholdControls';
import ErrorBoundary from './components/ErrorBoundary';
import ReportViewer from './components/Reports/ReportViewer';
import './App.css';

function App() {
  const [energyData, setEnergyData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [viewMode, setViewMode] = useState('overview');

  // Use HTTP polling instead of WebSocket (more reliable)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/current-data');
        if (response.ok) {
          const data = await response.json();
          setEnergyData(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch immediately
    fetchData();
    
    // Then fetch every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

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
            <ReportViewer />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
