import apiClient from './apiClient';

const userService = {
  // Admin
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.user;
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/users', payload);
    return data.user;
  },
  update: async (id, payload) => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data.user;
  },
  delete: async (id) => {
    await apiClient.delete(`/users/${id}`);
  },
  toggleActive: async (id) => {
    const { data } = await apiClient.patch(`/users/${id}/toggle-active`);
    return data.user;
  },
  // Profile (current user)
  updateProfile: async (payload) => {
    const { data } = await apiClient.put('/users/profile', payload);
    return data.user;
  },
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await apiClient.post('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.avatarUrl;
  },
};

export default userService;
