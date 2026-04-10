/**
 * RDVPro — Shared Constants
 * Used as reference for both frontend (JS) and backend (Python) implementations.
 */

// Roles
export const ROLES = {
  ADMIN:  'admin',
  CLIENT: 'client',
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'no_show',
};

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_REMINDER:  'appointment_reminder',
  APPOINTMENT_UPDATED:   'appointment_updated',
  NEW_APPOINTMENT:       'new_appointment',
  WELCOME:               'welcome',
  SYSTEM:                'system',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:               '/api/auth/login',
    REGISTER:            '/api/auth/register',
    LOGOUT:              '/api/auth/logout',
    REFRESH:             '/api/auth/refresh',
    ME:                  '/api/auth/me',
    PROFILE:             '/api/auth/profile',
    CHANGE_PASSWORD:     '/api/auth/change-password',
    FORGOT_PASSWORD:     '/api/auth/forgot-password',
    RESET_PASSWORD:      '/api/auth/reset-password',
    VERIFY_EMAIL:        '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
  },
  APPOINTMENTS: {
    BASE:            '/api/appointments',
    MINE:            '/api/appointments/mine',
    AVAILABLE_SLOTS: '/api/appointments/available-slots',
    CONFIRM:         (id) => `/api/appointments/${id}/confirm`,
    CANCEL:          (id) => `/api/appointments/${id}/cancel`,
  },
  NOTIFICATIONS: {
    BASE:             '/api/notifications',
    UNREAD_COUNT:     '/api/notifications/unread-count',
    MARK_READ:        (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ:    '/api/notifications/mark-all-read',
    SEND:             '/api/notifications/send',
    SEND_REMINDERS:   '/api/notifications/send-reminders',
    PREFERENCES:      '/api/notifications/preferences',
  },
  USERS: {
    BASE:          '/api/users',
    TOGGLE_ACTIVE: (id) => `/api/users/${id}/toggle-active`,
    AVATAR:        '/api/users/avatar',
  },
  SLOTS: {
    BASE: '/api/slots',
  },
};
