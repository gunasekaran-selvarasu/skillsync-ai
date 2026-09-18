import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('skillsync_access_token');
      const savedUser = localStorage.getItem('skillsync_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('skillsync_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/signin', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('skillsync_access_token', access_token);
    localStorage.setItem('skillsync_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('skillsync_access_token');
    localStorage.removeItem('skillsync_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
