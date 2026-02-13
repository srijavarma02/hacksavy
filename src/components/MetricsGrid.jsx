import React from 'react';
import MetricCard from './MetricCard';
import './MetricsGrid.css';

function MetricsGrid({ data }) {
  if (!data) return null;

  const metrics = [
    {
      title: 'Total Power',
      value: data.totalPower.toFixed(1),
      unit: 'kW',
      change: data.powerChange,
      icon: '⚡',
      color: '#00d4ff'
    },
    {
      title: 'Energy Today',
      value: data.energyToday.toFixed(1),
      unit: 'kWh',
      change: data.energyChange,
      icon: '📊',
      color: '#00ff88'
    }
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

export default MetricsGrid;
