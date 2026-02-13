import React from 'react';
import './CampusMap.css';

function CampusMap({ data, selectedBuilding, setSelectedBuilding }) {
  if (!data) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#00ff88';
      case 'warning': return '#ffd700';
      case 'critical': return '#ff6b6b';
      default: return '#8892b0';
    }
  };

  return (
    <div className="campus-map-container">
      <h2 className="section-title">Campus Overview</h2>
      
      <div className="campus-map">
        <svg viewBox="0 0 800 600" className="map-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {data.buildings.map((building, index) => (
            <g
              key={building.id}
              className={`building ${selectedBuilding?.id === building.id ? 'selected' : ''}`}
              onClick={() => setSelectedBuilding(building)}
            >
              <rect
                x={building.x}
                y={building.y}
                width={building.width}
                height={building.height}
                fill="rgba(26, 31, 58, 0.8)"
                stroke={getStatusColor(building.status)}
                strokeWidth="2"
                rx="4"
              />
              <circle
                cx={building.x + building.width / 2}
                cy={building.y + building.height / 2}
                r="8"
                fill={getStatusColor(building.status)}
                filter="url(#glow)"
                className="status-indicator"
              />
              <text
                x={building.x + building.width / 2}
                y={building.y - 10}
                textAnchor="middle"
                fill="#e0e6ed"
                fontSize="14"
                fontWeight="600"
              >
                {building.name}
              </text>
              <text
                x={building.x + building.width / 2}
                y={building.y + building.height + 20}
                textAnchor="middle"
                fill="#8892b0"
                fontSize="12"
              >
                {building.power.toFixed(1)} kW
              </text>
            </g>
          ))}
          
          <g className="grid-lines" opacity="0.1">
            {[...Array(20)].map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 30}
                x2="800"
                y2={i * 30}
                stroke="#00d4ff"
                strokeWidth="1"
              />
            ))}
            {[...Array(27)].map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 30}
                y1="0"
                x2={i * 30}
                y2="600"
                stroke="#00d4ff"
                strokeWidth="1"
              />
            ))}
          </g>
        </svg>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#00ff88' }}></span>
          <span>Normal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ffd700' }}></span>
          <span>Warning</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ff6b6b' }}></span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
