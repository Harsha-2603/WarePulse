import { supabase } from '../lib/supabase';
import { BASE_URL } from '../utils/config';

/**
 * Reusable fetch helper for API requests
 * Provides SAAS-compliant headers with active JWT Bearer authentication
 */
const apiRequest = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const apiUrl = url;
  console.log("API URL:", apiUrl);
  
  const token = localStorage.getItem("accessToken");
  const shopId = localStorage.getItem('shopId');

  if (!token) {
    throw new Error("Authentication required. Please sign in again.");
  }

  if (!shopId) {
    throw new Error("Missing shop context. Please sign in again.");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-shop-id': shopId, // Kept for operational compatibility, verified server-side
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    const errorContent = await response.json().catch(() => ({}));
    const message = errorContent.error || errorContent.message || errorContent.details || errorContent.success === false && errorContent.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

// Reusable API object maintaining compatibility with existing axios-like usage
const api = {
  get: async (path, options = {}) => {
    const data = await apiRequest(path, { ...options, method: 'GET' });
    return { data };
  },
  post: async (path, body, options = {}) => {
    const data = await apiRequest(path, { ...options, method: 'POST', body });
    return { data };
  },
  put: async (path, body, options = {}) => {
    const data = await apiRequest(path, { ...options, method: 'PUT', body });
    return { data };
  },
  patch: async (path, body, options = {}) => {
    const data = await apiRequest(path, { ...options, method: 'PATCH', body });
    return { data };
  },
  delete: async (path, options = {}) => {
    const data = await apiRequest(path, { ...options, method: 'DELETE' });
    return { data };
  }
};

export { BASE_URL };
export default api;

