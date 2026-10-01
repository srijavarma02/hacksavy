const dev = import.meta.env.DEV;
const productionApiUrl = 'https://ecopulsehacksavy-api.onrender.com';
const productionWsUrl = 'wss://ecopulsehacksavy-api.onrender.com';

export const API_URL = import.meta.env.VITE_API_URL || (dev ? 'http://localhost:3001' : productionApiUrl);
export const WS_URL = import.meta.env.VITE_WS_URL || (dev ? 'ws://localhost:3001' : productionWsUrl);
