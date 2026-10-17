import { request } from './client.js';

export const dealersApi = {
  register: (payload) => {
    return request('/dealer/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listDealers: (status = null) => {
    let endpoint = '/admin/dealers';
    if (status && status !== 'all') {
      endpoint += `?status=${encodeURIComponent(status)}`;
    }
    return request(endpoint, { method: 'GET' });
  },

  approveDealer: (dealerId) => {
    return request(`/admin/dealers/${dealerId}/approve`, {
      method: 'POST',
    });
  },

  rejectDealer: (dealerId) => {
    return request(`/admin/dealers/${dealerId}/reject`, {
      method: 'POST',
    });
  },
};
