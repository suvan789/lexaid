import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://lexaid-api.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000, // Fast 3s timeout to prevent UI hanging when backend is sleeping
});

// Background Keep-Alive Ping to prevent Render backend from sleeping
if (typeof window !== 'undefined') {
  const pingBackend = () => {
    fetch('https://lexaid-api.onrender.com/health', { mode: 'no-cors' }).catch(() => {});
  };
  pingBackend();
  setInterval(pingBackend, 120000); // Keep-alive ping every 2 minutes
}

// Request interceptor: attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexaid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lexaid_token');
      localStorage.removeItem('lexaid_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
