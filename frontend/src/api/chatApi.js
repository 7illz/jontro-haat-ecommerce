import { io } from 'socket.io-client';
import { API_URL, apiRequest } from './client';

export const getChatSessions = () => apiRequest('/api/chat/sessions', { auth: true });
export const createAuthenticatedSocket = () => io(API_URL, {
  auth: { token: localStorage.getItem('token') },
});
