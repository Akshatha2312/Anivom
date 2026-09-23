const rawBase = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
  ? import.meta.env.VITE_API_URL.trim()
  : 'http://localhost:5000';

let cleaned = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
if (cleaned.endsWith('/api/v1')) {
  cleaned = cleaned.slice(0, -7);
}

export const API_BASE_URL = cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;

