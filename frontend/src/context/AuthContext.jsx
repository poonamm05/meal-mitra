import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, demoLogin as apiDemoLogin, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mealmitra_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('mealmitra_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      saveUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await apiRegister(formData);
      saveUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (persona = 'bachelor') => {
    setLoading(true);
    try {
      const res = await apiDemoLogin(persona);
      saveUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Demo login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mealmitra_user');
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();
      const updated = { ...user, ...res.data.data };
      saveUser(updated);
    } catch (e) {
      // ignore
    }
  };

  const updateUserLocal = (updates) => {
    const updated = { ...user, ...updates };
    saveUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, refreshUser, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
