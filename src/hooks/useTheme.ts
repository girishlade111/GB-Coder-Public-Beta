import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('gb-coder-theme', 'dark');

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log(`Theme switched to ${newTheme}`);
  };

  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme);
    console.log(`Theme set to ${newTheme}`);
  };

  return {
    theme,
    setTheme: setThemeDirectly,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};