import axios from 'axios';

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function transformKeys(obj, transformFn) {
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, transformFn));
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [transformFn(k), transformKeys(v, transformFn)])
    );
  }
  return obj;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('askuni_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Transform request body keys to snake_case
  if (config.data && typeof config.data === 'object') {
    config.data = transformKeys(config.data, camelToSnake);
  }
  return config;
});

// Transform response keys to camelCase + handle 401
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = transformKeys(response.data, snakeToCamel);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('askuni_access_token');
      localStorage.removeItem('askuni_refresh_token');
      localStorage.removeItem('askuni_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
