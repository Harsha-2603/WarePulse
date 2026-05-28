let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Ensure it ends with /api
if (!apiBaseUrl.endsWith('/api') && !apiBaseUrl.endsWith('/api/')) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, '') + '/api';
}
// Strip any trailing slash from the final BASE_URL to ensure consistency
export const BASE_URL = apiBaseUrl.replace(/\/$/, '');
