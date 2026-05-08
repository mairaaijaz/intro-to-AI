'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface SettingsState {
  theme: Theme;
  showDiacritics: boolean;
  toggleTheme: () => void;
  toggleDiacritics: () => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [showDiacritics, setShowDiacritics] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('arabot_theme') as Theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
      const savedDiacritics = localStorage.getItem('arabot_diacritics');
      if (savedDiacritics !== null) {
        setShowDiacritics(savedDiacritics === 'true');
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }, []);

  // Update body class and local storage when theme changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.className = theme;
    localStorage.setItem('arabot_theme', theme);
  }, [theme, mounted]);

  // Update local storage when diacritics changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('arabot_diacritics', showDiacritics.toString());
  }, [showDiacritics, mounted]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleDiacritics = () => setShowDiacritics(prev => !prev);

  return (
    <SettingsContext.Provider value={{ theme, showDiacritics, toggleTheme, toggleDiacritics }}>
      {!mounted ? <div style={{ visibility: 'hidden' }}>{children}</div> : children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
