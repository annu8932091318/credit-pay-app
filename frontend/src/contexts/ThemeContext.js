import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../styles/theme';

// Create context with default values
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Theme Provider component
export const AppThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = () => useContext(ThemeContext);
