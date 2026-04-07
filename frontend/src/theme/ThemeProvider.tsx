import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ThemePreference } from '../types/articles';

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (nextTheme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const storageKey = 'article-registration-theme';

function readStoredTheme(): ThemePreference {
  const saved = localStorage.getItem(storageKey);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

function detectSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(readStoredTheme);

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? detectSystemTheme() : theme,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const next = theme === 'system' ? detectSystemTheme() : theme;
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
      localStorage.setItem(storageKey, theme);
    };

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}