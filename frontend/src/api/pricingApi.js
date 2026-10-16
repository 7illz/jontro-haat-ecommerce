import { apiRequest } from './client';

export const getPricingConfig = () => apiRequest('/api/config/pricing');
