import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('lexaid_token');
    const savedUser = localStorage.getItem('lexaid_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        
        // Background sync: verify backend user if online, but NEVER force logout on network delay/offline/mock tokens
        API.get('/api/auth/me', { timeout: 3000 })
          .then((res) => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('lexaid_user', JSON.stringify(res.data));
            }
          })
          .catch((err) => {
            console.log("Mobile Session Manager: Retaining offline/persistent logged-in session.");
          })
          .finally(() => setLoading(false));
      } catch (err) {
        console.error("Invalid saved session format:", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('lexaid_token', accessToken);
    localStorage.setItem('lexaid_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lexaid_token');
    localStorage.removeItem('lexaid_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('lexaid_user', JSON.stringify(userData));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
