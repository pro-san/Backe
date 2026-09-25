import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'hms_theme';

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null) as Theme | null;
  const initialTheme: Theme = savedTheme || 'system';

  const applyTheme = (t: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
      applyTheme(newTheme);
      set({ theme: newTheme });
    },
  };
});
