import apiClient from './apiClient';

const authService = {
  /**
   * Login with email + password
   * @returns {{ user, token, refreshToken }}
   */
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Register a new account
   * @returns {{ user, token, refreshToken }}
   */
  register: async ({ firstName, lastName, email, password, phone }) => {
    const { data } = await apiClient.post('/auth/register', {
      firstName, lastName, email, password, phone,
    });
    return data;
  },

  /**
   * Get the currently authenticated user
   * @returns {User}
   */
  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data.user;
  },

  /**
   * Logout — invalidates the server-side refresh token
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('rdvpro_refresh_token');
    await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * Send forgot-password email
   */
  forgotPassword: async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Reset password with the token from the email link
   */
  resetPassword: async (token, password) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },

  /**
   * Change password (authenticated user)
   */
  changePassword: async (currentPassword, newPassword) => {
    const { data } = await apiClient.put('/auth/change-password', {
      currentPassword, newPassword,
    });
    return data;
  },

  /**
   * Verify email address with the token from the verification email
   */
  verifyEmail: async (token) => {
    const { data } = await apiClient.post('/auth/verify-email', { token });
    return data;
  },

  /**
   * Resend email verification
   */
  resendVerification: async () => {
    const { data } = await apiClient.post('/auth/resend-verification');
    return data;
  },

  /**
   * Refresh the access token
   */
  refresh: async (refreshToken) => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },

  /**
   * Update profile info (name, phone, avatar, etc.)
   */
  updateProfile: async (updates) => {
    const { data } = await apiClient.put('/auth/profile', updates);
    return data.user;
  },
};

export default authService;
