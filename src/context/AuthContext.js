import React, { createContext, useState, useEffect } from 'react';
import { getAuthData, storeAuthData, clearAuthData } from '../utils/storage';
import { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 AUTO LOGIN ON APP START
  useEffect(() => {
    const loadAuth = async () => {
      const { token, user } = await getAuthData();
      if (token && user) {
        setToken(token);
        setUser(user);
        setAuthToken(token);
      }
      setLoading(false);
    };

    loadAuth();
  }, []);

  const login = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    setAuthToken(jwtToken);
    await storeAuthData(jwtToken, userData);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
