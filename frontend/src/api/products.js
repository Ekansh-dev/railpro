import { request } from './client.js';

export const productsApi = {
  upload: (formData) => {
    return request('/products', {
      method: 'POST',
      body: formData,
    });
  },

  getMyProducts: () => {
    return request('/products/mine', { method: 'GET' });
  },

  deleteMyProduct: (productId) => {
    return request(`/products/${productId}`, { method: 'DELETE' });
  },

  getPendingQueue: () => {
    return request('/manager/products/pending', { method: 'GET' });
  },

  reviewProduct: (productId, action, rejectionReason = null) => {
    return request(`/manager/products/${productId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        rejection_reason: rejectionReason,
      }),
    });
  },

  searchContractorCatalog: (search = '', category = '') => {
    let endpoint = `/admin/products?search=${encodeURIComponent(search)}`;
    if (category) {
      endpoint += `&category=${encodeURIComponent(category)}`;
    }
    return request(endpoint, { method: 'GET' });
  },

  adminDeleteProduct: (productId) => {
    return request(`/admin/products/${productId}`, { method: 'DELETE' });
  },
};
