import { apiRequest } from './client';

export const applyCoupon = (code) => apiRequest('/api/coupons/apply', { method: 'POST', body: { code } });
