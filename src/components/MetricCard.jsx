import React, { useEffect, useRef } from 'react';
import './MetricCard.css';

function MetricCard({ title, value, unit, change, icon, color }) {
  const sparklineRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current.push(parseFloat(value));
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }

    const canvas = sparklineRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const data = historyRef.current;
    if (data.length < 2) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }, [value, color]);

  const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';

  return (
    <div className="metric-card" style={{ borderColor: color + '40' }}>
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      
      <div className="metric-value">
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      
      <div className="metric-change">
        <span className={`change ${changeClass}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      
      <canvas ref={sparklineRef} className="sparkline" width="200" height="40"></canvas>
    </div>
  );
}

export default MetricCard;
