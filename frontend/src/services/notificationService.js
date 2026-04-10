import apiClient from './apiClient';

const notificationService = {
  /**
   * Get all notifications for the current user
   * @param {{ page, limit, isRead }} params
   * @returns {{ notifications, total, unreadCount }}
   */
  getAll: async (params = {}) => {
    const { data } = await apiClient.get('/notifications', { params });
    return data.notifications;
  },

  /**
   * Get a single notification
   */
  getById: async (id) => {
    const { data } = await apiClient.get(`/notifications/${id}`);
    return data.notification;
  },

  /**
   * Get the count of unread notifications
   */
  getUnreadCount: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data.count;
  },

  /**
   * Mark a single notification as read
   */
  markRead: async (id) => {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data.notification;
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async () => {
    const { data } = await apiClient.patch('/notifications/mark-all-read');
    return data;
  },

  /**
   * Delete a notification
   */
  delete: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async () => {
    await apiClient.delete('/notifications/read');
  },

  /**
   * Admin: Send a notification to a user or all users
   */
  send: async ({ userId, type, title, message, appointmentId }) => {
    const { data } = await apiClient.post('/notifications/send', {
      userId, type, title, message, appointmentId,
    });
    return data.notification;
  },

  /**
   * Admin: Send reminder notifications for upcoming appointments
   * (typically called by cron or manually)
   */
  sendReminders: async (hoursBeforeAppointment = 48) => {
    const { data } = await apiClient.post('/notifications/send-reminders', {
      hoursBeforeAppointment,
    });
    return data;
  },

  /**
   * Get notification preferences for the current user
   */
  getPreferences: async () => {
    const { data } = await apiClient.get('/notifications/preferences');
    return data.preferences;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences) => {
    const { data } = await apiClient.put('/notifications/preferences', preferences);
    return data.preferences;
  },
};

export default notificationService;
