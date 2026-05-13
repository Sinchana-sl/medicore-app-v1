import { createTheme, type Theme, alpha } from '@mui/material/styles';

const SANS = 'Inter, system-ui, -apple-system, sans-serif';

export const C = {
  // Brand
  blue:       '#2563EB',
  blueDark:   '#1D4ED8',
  blueLight:  '#EFF6FF',
  blueMid:    '#DBEAFE',

  // Neutrals
  ink:        '#111827',
  inkMid:     '#374151',
  slate:      '#6B7280',
  muted:      '#9CA3AF',
  subtle:     '#D1D5DB',
  border:     '#E5E7EB',
  borderSub:  '#F3F4F6',
  surface:    '#F7F8FA',
  paper:      '#FFFFFF',

  // Semantic
  green:      '#059669',
  greenBg:    '#ECFDF5',
  amber:      '#D97706',
  amberBg:    '#FFFBEB',
  red:        '#DC2626',
  redBg:      '#FEF2F2',
  purple:     '#7C3AED',
  purpleBg:   '#F5F3FF',
  teal:       '#0891B2',
  tealBg:     '#ECFEFF',
} as const;

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary:   { main: C.blue, dark: C.blueDark, light: C.blueLight, contrastText: '#fff' },
      secondary: { main: C.ink, contrastText: '#fff' },
      success:   { main: C.green },
      warning:   { main: C.amber },
      error:     { main: C.red },
      background: {
        default: dark ? '#0D1117' : C.surface,
        paper:   dark ? '#161B22' : C.paper,
      },
      text: {
        primary:   dark ? '#E6EDF3' : C.ink,
        secondary: dark ? '#8B949E' : C.slate,
        disabled:  dark ? '#484F58' : C.muted,
      },
      divider: dark ? '#21262D' : C.border,
    },

    typography: {
      fontFamily: SANS,
      fontSize: 13,
      // page title
      h1: { fontFamily: SANS, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.3 },
      // section header
      h2: { fontFamily: SANS, fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.015em', lineHeight: 1.4 },
      // card title
      h3: { fontFamily: SANS, fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em', lineHeight: 1.4 },
      h4: { fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 },
      h5: { fontFamily: SANS, fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4 },
      h6: { fontFamily: SANS, fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4 },
      body1: { fontFamily: SANS, fontSize: '0.8438rem', lineHeight: 1.55, fontWeight: 400 },
      body2: { fontFamily: SANS, fontSize: '0.7813rem', lineHeight: 1.5, fontWeight: 400 },
      caption: { fontFamily: SANS, fontSize: '0.6875rem', lineHeight: 1.4, fontWeight: 500 },
      overline: { fontFamily: SANS, fontSize: '0.6563rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const },
      button: { fontFamily: SANS, fontWeight: 500, fontSize: '0.8125rem', textTransform: 'none' as const, letterSpacing: '0' },
    },

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontSize: 13, WebkitFontSmoothing: 'antialiased' },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 7,
            letterSpacing: 0,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          },
          sizeLarge:  { height: 40, fontSize: '0.875rem', px: '18px' },
          sizeMedium: { height: 34, fontSize: '0.8125rem', px: '14px' },
          sizeSmall:  { height: 28, fontSize: '0.75rem', px: '10px' },
          containedPrimary: {
            backgroundColor: C.blue,
            '&:hover': { backgroundColor: C.blueDark },
          },
          containedSecondary: {
            backgroundColor: C.ink,
            '&:hover': { backgroundColor: C.inkMid },
          },
          outlined: {
            borderColor: C.border,
            color: C.inkMid,
            '&:hover': { backgroundColor: C.surface, borderColor: C.subtle },
          },
          text: {
            color: C.slate,
            '&:hover': { backgroundColor: C.surface },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            '&:hover': { backgroundColor: C.borderSub },
          },
          sizeMedium: { width: 32, height: 32 },
          sizeSmall: { width: 26, height: 26 },
        },
      },

      MuiTextField: {
        defaultProps: { size: 'small' as const },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: '0.8438rem',
            borderRadius: 7,
            backgroundColor: dark ? '#161B22' : C.paper,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.subtle },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: C.blue,
              borderWidth: 1.5,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(C.blue, 0.12)}`,
            },
          },
          notchedOutline: { borderColor: C.border },
          input: { padding: '7px 12px' },
          inputSizeSmall: { padding: '6px 11px' },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            color: C.slate,
            '&.Mui-focused': { color: C.blue },
          },
          sizeSmall: { fontSize: '0.8125rem' },
        },
      },

      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: '0.6875rem', marginTop: 4 } },
      },

      MuiSelect: {
        styleOverrides: {
          select: { fontSize: '0.8125rem' },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 10,
            border: `1px solid ${dark ? '#21262D' : C.border}`,
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px',
            '&:last-child': { paddingBottom: 16 },
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 10 },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.6875rem',
            height: 22,
          },
          label: { paddingLeft: 8, paddingRight: 8 },
          sizeSmall: { height: 20, fontSize: '0.625rem' },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            minHeight: 40,
            color: C.slate,
            '&.Mui-selected': { color: C.ink, fontWeight: 600 },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: { height: 2, borderRadius: 2, backgroundColor: C.blue },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 7, py: 0 },
        },
      },

      MuiListItemText: {
        styleOverrides: {
          primary: { fontSize: '0.8125rem' },
          secondary: { fontSize: '0.75rem' },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: '0.8125rem',
            border: '1px solid transparent',
          },
          standardSuccess: { backgroundColor: C.greenBg, color: '#065F46', borderColor: '#A7F3D0' },
          standardError:   { backgroundColor: C.redBg,   color: '#991B1B', borderColor: '#FECACA' },
          standardWarning: { backgroundColor: C.amberBg, color: '#92400E', borderColor: '#FDE68A' },
          standardInfo:    { backgroundColor: C.blueLight, color: C.blueDark, borderColor: C.blueMid },
          message: { fontSize: '0.8125rem', padding: '2px 0' },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: '0.9375rem', fontWeight: 600, padding: '20px 24px 8px', color: C.ink },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { padding: '8px 24px 16px', fontSize: '0.8438rem' },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '12px 20px 20px', gap: 8 },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)',
            backgroundImage: 'none',
          },
          list: { padding: '4px' },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.8125rem',
            minHeight: 34,
            color: C.inkMid,
            padding: '6px 10px',
            '&:hover': { backgroundColor: C.surface },
            '&.Mui-selected': { backgroundColor: C.blueLight, color: C.blue },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: C.border },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.6875rem',
            fontWeight: 500,
            backgroundColor: C.ink,
            borderRadius: 6,
            padding: '5px 10px',
          },
          arrow: { color: C.ink },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 5 },
          bar: { borderRadius: 999 },
        },
      },

      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 6 } },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: C.slate,
              backgroundColor: C.surface,
              borderBottom: `1px solid ${C.border}`,
              padding: '8px 14px',
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            borderBottom: `1px solid ${C.borderSub}`,
            color: C.inkMid,
            padding: '10px 14px',
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: C.surface },
            '&:last-child td': { borderBottom: 'none' },
          },
        },
      },

      MuiBadge: {
        styleOverrides: {
          badge: { fontSize: '0.5625rem', minWidth: 16, height: 16, padding: '0 4px' },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },

      MuiFab: {
        styleOverrides: {
          root: { boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)' },
        },
      },
    },
  });
}

export default createAppTheme('light');
