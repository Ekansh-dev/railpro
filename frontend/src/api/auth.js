import { request } from './client.js';

export const authApi = {
  login: (email, password, role) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  getProfile: () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};
