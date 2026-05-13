import { createTheme, type Theme } from '@mui/material/styles';

const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: { fontFamily: 'Manrope, sans-serif', fontWeight: 700 },
  h2: { fontFamily: 'Manrope, sans-serif', fontWeight: 600 },
  h3: { fontFamily: 'Manrope, sans-serif', fontWeight: 600 },
  button: { fontFamily: 'Inter, sans-serif', textTransform: 'none' as const },
  body1: { fontFamily: 'Inter, sans-serif' },
  body2: { fontFamily: 'Inter, sans-serif' },
  caption: { fontFamily: 'Inter, sans-serif' },
};

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary:    { main: '#0061a5', contrastText: '#ffffff' },
      secondary:  { main: '#002045', contrastText: '#ffffff' },
      background: {
        default: dark ? '#0f172a' : '#f4f6fb',
        paper:   dark ? '#1e293b' : '#ffffff',
      },
      text: {
        primary:   dark ? '#f1f5f9' : '#0f172a',
        secondary: dark ? '#94a3b8' : '#475569',
      },
      divider: dark ? '#334155' : '#e2e8f0',
    },
    typography,
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: dark ? '#1e293b' : '#F7FAFC',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  });
}

export default createAppTheme('light');
