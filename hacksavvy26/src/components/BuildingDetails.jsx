import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import './BuildingDetails.css';

function BuildingDetails({ building, data, timeFilter }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!building || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = Array.from({ length: 20 }, (_, i) => `${i}m`);
    const powerData = Array.from({ length: 20 }, () => 
      building.power + (Math.random() - 0.5) * 20
    );

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Power (kW)',
          data: powerData,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(136, 146, 176, 0.1)' },
            ticks: { color: '#8892b0' }
          },
          x: {
            grid: { color: 'rgba(136, 146, 176, 0.1)' },
            ticks: { color: '#8892b0' }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [building]);

  if (!building) {
    return (
      <div className="building-details">
        <div className="no-selection">
          <p>Select a building on the map to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="building-details">
      <h2 className="section-title">{building.name}</h2>
      
      <div className="detail-stats">
        <div className="stat-item">
          <span className="stat-label">Current Power</span>
          <span className="stat-value">{building.power.toFixed(1)} kW</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Peak Load</span>
          <span className="stat-value">{building.peakLoad.toFixed(1)} kW</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Occupancy</span>
          <span className="stat-value">{building.occupancy}%</span>
        </div>
      </div>
      
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
      
      <div className="zones-list">
        <h3>Zones</h3>
        {building.zones.map((zone, index) => (
          <div key={index} className="zone-item">
            <span className="zone-name">{zone.name}</span>
            <span className="zone-power">{zone.power.toFixed(1)} kW</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuildingDetails;
