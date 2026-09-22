const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
