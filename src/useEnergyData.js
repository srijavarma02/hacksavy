import { useEffect, useState } from 'react';
import { API_URL, WS_URL } from './config';

export function useEnergyData() {
  const [energyData, setEnergyData] = useState(null);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let disposed = false;

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/current-data`);
        if (response.ok) {
          const data = await response.json();
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            setEnergyData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const connect = () => {
      if (disposed) return;

      try {
        const currentSocket = new WebSocket(WS_URL);
        socket = currentSocket;

        currentSocket.onmessage = (event) => {
          if (currentSocket !== socket) return;
          try {
            setEnergyData(JSON.parse(event.data));
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        currentSocket.onerror = () => {
          console.error('WebSocket connection error');
          currentSocket.close();
        };

        currentSocket.onclose = () => {
          if (!disposed && currentSocket === socket) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    const fallbackInterval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        fetchData();
      }
    }, 5000);

    if (WS_URL) {
      connect();
    } else {
      fetchData();
    }

    return () => {
      disposed = true;
      clearInterval(fallbackInterval);
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return energyData;
}
