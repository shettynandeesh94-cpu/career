import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to load user profile on mount:', err.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        // Res.user contains name, email, profile
        setUser({
          _id: res._id,
          name: res.name,
          email: res.email,
          profile: res.profile,
        });
        setLoading(false);
        return res;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser({
          _id: res._id,
          name: res.name,
          email: res.email,
          profile: { title: '', summary: '', skills: [] },
        });
        setLoading(false);
        return res;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        setUser(prevUser => ({
          ...prevUser,
          name: res.name,
          email: res.email,
          profile: res.profile,
        }));
        return res;
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
