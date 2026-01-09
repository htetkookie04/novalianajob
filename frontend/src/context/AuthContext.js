import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userEmail && userRole) {
      setIsAuthenticated(true);
      setUser({ email: userEmail, role: userRole });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, email: userEmail, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userRole', role);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser({ email: userEmail, role });

      return { success: true, user: { email: userEmail, role } };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid registration data';
      } else if (error.response.status === 409 || error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Email already registered';
      } else {
        errorMessage = error.response.data?.message || 'Registration failed';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, email: userEmail, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userRole', role);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser({ email: userEmail, role });

      return { success: true, user: { email: userEmail, role } };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (!error.response) {
        // Network error - backend not reachable
        errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
      } else if (error.response.status === 400) {
        // Bad request - invalid credentials
        errorMessage = error.response.data?.message || 'Invalid email or password';
      } else if (error.response.status === 500) {
        // Server error
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response.data?.message || 'Login failed';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

