export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async (path, { method = 'GET', body, auth = false, headers = {} } = {}) => {
  const requestHeaders = { ...headers };
  if (auth) requestHeaders.Authorization = `Bearer ${localStorage.getItem('token') || ''}`;

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, { method, headers: requestHeaders, body: requestBody });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data.errors);
  return data;
};
