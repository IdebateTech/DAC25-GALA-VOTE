import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  // Default to light mode as requested
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check for saved theme preference, but default to light mode
    const savedTheme = localStorage.getItem('dreamers-theme') as Theme;
    
    // Always default to light mode unless explicitly saved as dark
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    
    // Set CSS custom properties for better performance
    document.documentElement.style.setProperty(
      '--theme-transition', 
      'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease'
    );
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('dreamers-theme', newTheme);
    
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    });
  };

  return { theme, toggleTheme };
};