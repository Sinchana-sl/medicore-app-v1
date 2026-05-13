import { createTheme, type Theme, alpha } from '@mui/material/styles';

const FONT_SANS = 'Inter, system-ui, -apple-system, sans-serif';
const FONT_DISPLAY = 'Manrope, system-ui, -apple-system, sans-serif';

export const COLORS = {
  primary:        '#2563EB',
  primaryDark:    '#1D4ED8',
  primaryLight:   '#EFF6FF',
  primaryMid:     '#BFDBFE',
  navy:           '#0F172A',
  navyMid:        '#1E293B',
  teal:           '#0EA5E9',
  surface:        '#F8FAFC',
  surfaceAlt:     '#F1F5F9',
  border:         '#E2E8F0',
  borderDark:     '#CBD5E1',
  textPrimary:    '#0F172A',
  textSecondary:  '#475569',
  textMuted:      '#94A3B8',
  success:        '#10B981',
  warning:        '#F59E0B',
  error:          '#EF4444',
  info:           '#0EA5E9',
} as const;

const typography = {
  fontFamily: FONT_SANS,
  h1: { fontFamily: FONT_DISPLAY, fontWeight: 800, letterSpacing: '-0.025em' },
  h2: { fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: '-0.015em' },
  h4: { fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: '-0.01em' },
  h5: { fontFamily: FONT_DISPLAY, fontWeight: 600 },
  h6: { fontFamily: FONT_DISPLAY, fontWeight: 600 },
  button: { fontFamily: FONT_SANS, textTransform: 'none' as const, fontWeight: 600, letterSpacing: '0' },
  body1: { fontFamily: FONT_SANS, lineHeight: 1.6 },
  body2: { fontFamily: FONT_SANS, lineHeight: 1.5 },
  caption: { fontFamily: FONT_SANS, letterSpacing: '0.01em' },
};

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary:   { main: COLORS.primary, dark: COLORS.primaryDark, light: COLORS.primaryLight, contrastText: '#ffffff' },
      secondary: { main: COLORS.navy, contrastText: '#ffffff' },
      success:   { main: COLORS.success, contrastText: '#ffffff' },
      warning:   { main: COLORS.warning, contrastText: '#ffffff' },
      error:     { main: COLORS.error, contrastText: '#ffffff' },
      info:      { main: COLORS.info, contrastText: '#ffffff' },
      background: {
        default: dark ? '#0B1120' : COLORS.surface,
        paper:   dark ? '#111827' : '#FFFFFF',
      },
      text: {
        primary:   dark ? '#F1F5F9' : COLORS.textPrimary,
        secondary: dark ? '#94A3B8' : COLORS.textSecondary,
        disabled:  dark ? '#475569' : COLORS.textMuted,
      },
      divider: dark ? '#1E293B' : COLORS.border,
    },
    typography,
    shape: { borderRadius: 10 },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, #1740C0 100%)`,
            },
          },
          sizeLarge: { height: 52, fontSize: '0.9375rem', px: 3 },
          sizeMedium: { height: 42, fontSize: '0.875rem' },
          sizeSmall: { height: 34, fontSize: '0.8125rem' },
          outlinedPrimary: {
            borderColor: COLORS.border,
            color: COLORS.textPrimary,
            '&:hover': { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' as const },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: dark ? '#1E293B' : '#FFFFFF',
            transition: 'box-shadow 0.15s, border-color 0.15s',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.borderDark,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.15)}`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primary,
              borderWidth: 1.5,
            },
          },
          notchedOutline: {
            borderColor: dark ? '#2D3748' : COLORS.border,
          },
          input: {
            fontSize: '0.9375rem',
            padding: '12px 14px',
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: COLORS.textSecondary,
            '&.Mui-focused': { color: COLORS.primary },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            border: `1px solid ${dark ? '#1E293B' : COLORS.border}`,
            boxShadow: dark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 16 },
          elevation1: {
            boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
          },
          elevation2: {
            boxShadow: '0 4px 6px -1px rgba(15,23,42,0.07), 0 2px 4px -1px rgba(15,23,42,0.04)',
          },
          elevation3: {
            boxShadow: '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -2px rgba(15,23,42,0.04)',
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.01em',
          },
          colorSuccess: {
            backgroundColor: '#D1FAE5',
            color: '#065F46',
          },
          colorWarning: {
            backgroundColor: '#FEF3C7',
            color: '#92400E',
          },
          colorError: {
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
          },
          colorInfo: {
            backgroundColor: '#E0F2FE',
            color: '#0C4A6E',
          },
          colorPrimary: {
            backgroundColor: COLORS.primaryLight,
            color: COLORS.primaryDark,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: FONT_SANS,
            fontSize: '0.875rem',
            minHeight: 44,
            color: COLORS.textSecondary,
            '&.Mui-selected': { color: COLORS.primary },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2.5,
            borderRadius: 2,
            backgroundColor: COLORS.primary,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'background 0.15s, color 0.15s',
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 500,
            fontSize: '0.875rem',
          },
          standardSuccess: { backgroundColor: '#D1FAE5', color: '#065F46' },
          standardError:   { backgroundColor: '#FEE2E2', color: '#991B1B' },
          standardWarning: { backgroundColor: '#FEF3C7', color: '#92400E' },
          standardInfo:    { backgroundColor: '#E0F2FE', color: '#0C4A6E' },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -2px rgba(15,23,42,0.04)',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            mx: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'background 0.12s',
            '&:hover': { backgroundColor: COLORS.surface },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: `1px solid ${COLORS.border}`,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: COLORS.border },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: COLORS.navy,
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '6px 12px',
          },
          arrow: { color: COLORS.navy },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999 },
          bar: { borderRadius: 999 },
        },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
}

export default createAppTheme('light');
