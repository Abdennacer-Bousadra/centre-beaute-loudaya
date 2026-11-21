import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.verify();
      setIsAdminLoggedIn(true);
    } catch (err) {
      setIsAdminLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (password) => {
    try {
      setError(null);
      setLoading(true);
      const email = 'admin@loudaya.ma';
      await adminApi.login(email, password);
      setIsAdminLoggedIn(true);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      // Ignore logout errors
    }
    setIsAdminLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAdminLoggedIn, loading, error, login, logout, verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);