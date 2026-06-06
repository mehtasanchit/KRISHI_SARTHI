import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            try {
              const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (!cancelled) {
                setCurrentUser(res.data);
              }
            } catch {
              if (!cancelled) {
                logout();
              }
            }
          }
        } catch (e) {
          if (!cancelled) {
            logout();
          }
        }
      } else {
        setCurrentUser(null);
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.access_token);
    setCurrentUser(res.data.user);
    setToken(res.data.access_token);
  };

  const signup = async (name, email, password, role, location = "All India") => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/signup`, { name, email, password, role, location });
    localStorage.setItem('token', res.data.access_token);
    setCurrentUser(res.data.user);
    setToken(res.data.access_token);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
