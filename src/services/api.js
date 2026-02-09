import axios from 'axios';

// Replace these with your machine IP when testing on a device/emulator.
// `10.0.2.2` is Android emulator localhost. Use host LAN IP for physical devices.
const BASE_URL = 'http://192.168.1.8:5000/api';
const ML_BASE_URL = 'http://192.168.1.8:8000'; // ML server (use LAN IP for device testing)

const DEFAULT_TIMEOUT = 30000; // 30s

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

const mlApi = axios.create({
  baseURL: ML_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

export const setAuthToken = token => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

export { api, mlApi };
export default api;
