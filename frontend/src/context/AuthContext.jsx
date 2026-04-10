import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Bootstrap — verify existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rdvpro_token');
      if (!token) { setLoading(false); return; }
      try {
        const currentUser = await authService.me();
        setUser(currentUser);
      } catch {
        localStorage.removeItem('rdvpro_token');
        localStorage.removeItem('rdvpro_refresh_token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user: u, token, refreshToken } = await authService.login(email, password);
      localStorage.setItem('rdvpro_token', token);
      localStorage.setItem('rdvpro_refresh_token', refreshToken);
      setUser(u);
      return u;
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants incorrects';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const { user: u, token, refreshToken } = await authService.register(formData);
      localStorage.setItem('rdvpro_token', token);
      localStorage.setItem('rdvpro_refresh_token', refreshToken);
      setUser(u);
      return u;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Silent — clear locally anyway
    } finally {
      localStorage.removeItem('rdvpro_token');
      localStorage.removeItem('rdvpro_refresh_token');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
