import { apiRequest } from './client';

export const login = (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: credentials });
export const register = (details) => apiRequest('/api/auth/register', { method: 'POST', body: details });
export const googleLogin = (accessToken) => apiRequest('/api/auth/google', { method: 'POST', body: { accessToken } });
