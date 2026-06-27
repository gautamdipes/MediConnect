import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');

  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const apiRequest = async (config: AxiosRequestConfig) => {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Clear local storage to ensure clean state
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      const msg = data?.message || error.message;
      throw new Error(`API error ${status}: ${msg}`);
    }
    throw error;
  }
};