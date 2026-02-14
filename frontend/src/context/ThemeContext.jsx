// context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme-preference');
    return savedTheme && ['light', 'dark', 'auto'].includes(savedTheme) ? savedTheme : 'light';
  });
  
  const [systemTheme, setSystemTheme] = useState('light');

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine active theme
    const activeTheme = theme === 'auto' ? systemTheme : theme;
    
    // Add theme class
    root.classList.add(activeTheme);
    
    // Store theme preference
    localStorage.setItem('theme-preference', theme);
  }, [theme, systemTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);