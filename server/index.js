import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const buildings = [
  { id: 1, name: 'Engineering', x: 100, y: 100, width: 120, height: 80 },
  { id: 2, name: 'Science Lab', x: 280, y: 120, width: 100, height: 100 },
  { id: 3, name: 'Library', x: 450, y: 80, width: 140, height: 90 },
  { id: 4, name: 'Dorm A', x: 120, y: 280, width: 90, height: 120 },
  { id: 5, name: 'Dorm B', x: 260, y: 300, width: 90, height: 120 },
  { id: 6, name: 'Sports Center', x: 420, y: 250, width: 160, height: 100 },
  { id: 7, name: 'Admin', x: 640, y: 150, width: 100, height: 80 }
];

function generateMockData() {
  const buildingsData = buildings.map(b => {
    const power = 50 + Math.random() * 150;
    const status = power > 180 ? 'critical' : power > 140 ? 'warning' : 'normal';
    
    return {
      ...b,
      power,
      peakLoad: power * 1.3,
      occupancy: Math.floor(40 + Math.random() * 60),
      status,
      zones: [
        { name: 'Floor 1', power: power * 0.4 },
        { name: 'Floor 2', power: power * 0.35 },
        { name: 'HVAC', power: power * 0.25 }
      ]
    };
  });

  const totalPower = buildingsData.reduce((sum, b) => sum + b.power, 0);
  
  const alerts = buildingsData
    .filter(b => b.status !== 'normal')
    .map(b => ({
      severity: b.status,
      title: b.status === 'critical' ? 'High Power Consumption' : 'Elevated Usage',
      location: b.name,
      time: 'Just now'
    }));

  return {
    totalPower,
    powerChange: (Math.random() - 0.5) * 10,
    energyToday: totalPower * 0.8,
    energyChange: (Math.random() - 0.5) * 8,
    waterUsage: 120 + Math.random() * 40,
    waterChange: (Math.random() - 0.5) * 15,
    gasFlow: 2.5 + Math.random() * 1.5,
    gasChange: (Math.random() - 0.5) * 12,
    buildings: buildingsData,
    alerts
  };
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  const interval = setInterval(() => {
    const data = generateMockData();
    ws.send(JSON.stringify(data));
  }, 2000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
