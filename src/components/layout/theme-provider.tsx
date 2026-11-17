'use client';

import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** Current resolved theme (always 'light' or 'dark') */
  theme: 'light' | 'dark';
  /** User-selected preference (may be 'system') */
  preference: Theme;
  /** Set the theme preference */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'uaq-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(preference: Theme): 'light' | 'dark' {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  /** Initial theme preference; defaults to 'system' */
  readonly defaultTheme?: Theme;
}

/**
 * Theme provider that manages light/dark mode with localStorage persistence
 * and system preference detection.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [preference, setPreference] = React.useState<Theme>(defaultTheme);
  const [theme, setResolvedTheme] = React.useState<'light' | 'dark'>(() =>
    resolveTheme(defaultTheme)
  );

  // On mount, read persisted preference
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setPreference(stored);
      const resolved = resolveTheme(stored);
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    } else {
      const resolved = resolveTheme(defaultTheme);
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    }
  }, [defaultTheme]);

  // Listen for system preference changes when preference is 'system'
  React.useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = React.useCallback((newPreference: Theme) => {
    setPreference(newPreference);
    localStorage.setItem(STORAGE_KEY, newPreference);
    const resolved = resolveTheme(newPreference);
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, []);

  const value = React.useMemo(
    () => ({ theme, preference, setTheme }),
    [theme, preference, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
