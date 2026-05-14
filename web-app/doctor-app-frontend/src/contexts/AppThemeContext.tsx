import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { createAppTheme, CSS_VARS } from '../styles/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppThemeCtx {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}


const AppThemeContext = createContext<AppThemeCtx>({
  themeMode: 'light',
  setThemeMode: () => {},
});

export function useAppTheme() {
  return useContext(AppThemeContext);
}

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => (localStorage.getItem('mc_theme') as ThemeMode | null) ?? 'light'
  );

  function setThemeMode(mode: ThemeMode) {
    localStorage.setItem('mc_theme', mode);
    setThemeModeState(mode);
  }

  // Re-render when the OS theme changes while "system" is selected
 
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setThemeModeState(m => m); // force re-render
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  const resolvedMode = themeMode === 'system' ? getSystemMode() : themeMode;
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  // Set data-theme attribute so CSS variables (var(--c-*)) switch correctly
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  return (
    <AppThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={CSS_VARS.light + CSS_VARS.dark} />
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}
