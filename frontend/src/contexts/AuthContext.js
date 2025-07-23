import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginShopkeeper, registerShopkeeper } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginShopkeeper(credentials);
      // Save JWT token to localStorage if present
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      const userData = response.user || response.shopkeeper || response;
      setUser(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerShopkeeper({
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        shopName: userData.shopName
      });
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      const newUser = response.user || response.shopkeeper || response;
      setUser(newUser);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
