import { request } from './client.js';

export const categoriesApi = {
  list: () => {
    return request('/categories', { method: 'GET' });
  },

  create: (name) => {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};
