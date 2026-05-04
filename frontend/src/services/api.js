import { BASE_URL } from '../utils/config';
/**
 * Reusable fetch helper for API requests
 * Provides SAAS-compliant headers for IMS-SAAS-2026
 */
const apiRequest = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  
  // Extract info from localStorage (using placeholders until Auth module is fully integrated)
const userId = localStorage.getItem('userId');
const shopId = localStorage.getItem('shopId');
const userRole = localStorage.getItem('userRole') || 'admin';

if (!userId || !shopId) {
  throw new Error("Missing auth context: userId or shopId not set");
}

  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-shop-id': shopId,
    'x-user-role': userRole,
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

export default api;

