import apiClient from './apiClient';

const appointmentService = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/appointments', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/appointments/${id}`);
    return data.appointment;
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/appointments', payload);
    return data.appointment;
  },
  update: async (id, payload) => {
    const { data } = await apiClient.put(`/appointments/${id}`, payload);
    return data.appointment;
  },
  cancel: async (id, reason) => {
    const { data } = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
    return data.appointment;
  },
  confirm: async (id) => {
    const { data } = await apiClient.patch(`/appointments/${id}/confirm`);
    return data.appointment;
  },
  getMyAppointments: async (params = {}) => {
    const { data } = await apiClient.get('/appointments/mine', { params });
    return data;
  },
  getAvailableSlots: async (serviceId, date) => {
    const { data } = await apiClient.get('/appointments/available-slots', {
      params: { serviceId, date },
    });
    return data.slots;
  },
};

export default appointmentService;
