const dev = import.meta.env.DEV;

export const API_URL = import.meta.env.VITE_API_URL || (dev ? 'http://localhost:3001' : '');
export const WS_URL = import.meta.env.VITE_WS_URL || (dev ? 'ws://localhost:3001' : '');
