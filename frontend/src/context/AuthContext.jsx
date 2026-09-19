import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('a11y_auth_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('a11y_auth_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return res;
    }
    throw new Error(res.error || 'Login failed.');
  };

  const register = async (userDataInput) => {
    const res = await api.register(userDataInput);
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('a11y_auth_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return res;
    }
    throw new Error(res.error || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('a11y_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(user), loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
