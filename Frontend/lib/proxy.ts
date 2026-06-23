import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Create a pre‑configured Axios instance that points to the Next.js proxy.
 * All frontend API calls should use this instance so they are routed through
 * the `/api/*` rewrite defined in `next.config.js`.
 */
export const api: AxiosInstance = axios.create({
  baseURL: '/api', // Proxy target defined in next.config.js
  timeout: 10000,
});

// Attach Authorization header from localStorage to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Set the Authorization header for the shared `api` instance.
 * Call this once after you obtain the JWT token (e.g. after login or from
 * `AuthContext`). Subsequent requests will automatically include the bearer
 * token.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Convenience wrapper that merges a custom config with the default `api`
 * instance. It makes it easy to call `apiRequest({ method: 'put', url: '/v1/auth/password', data })`.
 */
export const apiRequest = async (config: AxiosRequestConfig) => {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error: any) {
    // Re‑throw with a more useful message for UI components
    if (error.response) {
      const { status, data } = error.response;
      const msg = data?.message || error.message;
      throw new Error(`API error ${status}: ${msg}`);
    }
    throw error;
  }
};
