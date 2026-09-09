import { apiRequest } from './client';

export const createOrder = (order) => apiRequest('/api/orders', { method: 'POST', body: order, auth: true });
export const getMyOrders = () => apiRequest('/api/orders/myorders', { auth: true });
export const getAllOrders = () => apiRequest('/api/orders', { auth: true });
export const markOrderDelivered = (id) => apiRequest(`/api/orders/${id}/deliver`, { method: 'PUT', auth: true });
