import { request } from './client.js';

export const staffApi = {
  listManagers: () => {
    return request('/admin/managers', {
      method: 'GET',
    });
  },

  inviteManager: (name, email) => {
    return request('/admin/managers/invite', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  },

  deleteManager: (managerId) => {
    return request(`/admin/managers/${managerId}`, {
      method: 'DELETE',
    });
  },
};
