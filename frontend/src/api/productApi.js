import { apiRequest } from './client';

export const listProducts = ({ keyword, category, sort } = {}) => {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  const query = params.toString();
  return apiRequest(`/api/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => apiRequest(`/api/products/${id}`);
export const createProduct = (product) => apiRequest('/api/products', { method: 'POST', body: product, auth: true });
export const updateProduct = (id, product) => apiRequest(`/api/products/${id}`, { method: 'PUT', body: product, auth: true });
export const deleteProduct = (id) => apiRequest(`/api/products/${id}`, { method: 'DELETE', auth: true });
export const createReview = (id, review) => apiRequest(`/api/products/${id}/reviews`, { method: 'POST', body: review, auth: true });
