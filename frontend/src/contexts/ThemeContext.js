import React, { createContext, useContext } from 'react';

// Create context with default values
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Custom hook to use theme context
export const useThemeContext = () => useContext(ThemeContext);
