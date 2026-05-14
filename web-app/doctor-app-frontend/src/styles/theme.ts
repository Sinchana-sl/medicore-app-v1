import { createTheme, type Theme, alpha } from '@mui/material/styles';

const SANS = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

// CSS custom-property tokens — values switch automatically via [data-theme] attribute.
// All sx props referencing C.* pick up dark/light changes with zero component changes.
export const C = {
  // Brand — fixed across both modes
  blue:       '#0D9488',
  blueDark:   '#0F766E',
  blueLight:  'var(--c-blue-light)',
  blueMid:    'var(--c-blue-mid)',
  blueBright: '#2DD4BF',

  // Sidebar
  sidebarBg:         'var(--c-sidebar-bg)',
  sidebarBorder:     'var(--c-sidebar-border)',
  sidebarText:       'var(--c-sidebar-text)',
  sidebarHover:      'var(--c-sidebar-hover)',
  sidebarActive:     'var(--c-sidebar-active)',
  sidebarActiveText: 'var(--c-sidebar-active-text)',

  // Neutrals
  ink:       'var(--c-ink)',
  inkMid:    'var(--c-ink-mid)',
  slate:     'var(--c-slate)',
  muted:     'var(--c-muted)',
  subtle:    'var(--c-subtle)',
  border:    'var(--c-border)',
  borderSub: 'var(--c-border-sub)',
  surface:   'var(--c-surface)',
  paper:     'var(--c-paper)',

  // Semantic foreground — fixed (same intensity works on both modes)
  green:  '#0F7348',
  amber:  '#B45309',
  red:    '#C73535',
  purple: '#6B48C8',
  teal:   '#0D9488',

  // Semantic background — CSS vars so dark mode gets muted tints
  greenBg:  'var(--c-green-bg)',
  amberBg:  'var(--c-amber-bg)',
  redBg:    'var(--c-red-bg)',
  purpleBg: 'var(--c-purple-bg)',
  tealBg:   'var(--c-blue-light)',
} as const;

const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary:   { main: '#0D9488', dark: '#0F766E', light: '#F0FDFA', contrastText: '#fff' },
      secondary: { main: dark ? '#E4E8F0' : '#37352F', contrastText: dark ? '#13151C' : '#fff' },
      success:   { main: '#0F7348' },
      warning:   { main: '#B45309' },
      error:     { main: '#C73535' },
      background: {
        default: dark ? '#13151C' : '#F7F7F5',
        paper:   dark ? '#1C1F28' : '#FFFFFF',
      },
      text: {
        primary:   dark ? '#E4E8F0' : '#37352F',
        secondary: dark ? '#8891A2' : '#73726E',
        disabled:  dark ? '#545F72' : '#9B9A97',
      },
      divider: dark ? '#2D3240' : '#E9E9E7',
    },

    typography: {
      fontFamily: SANS,
      fontSize: 13,
      h1: { fontFamily: SANS, fontWeight: 700, fontSize: '1.25rem',   letterSpacing: '-0.02em', lineHeight: 1.3 },
      h2: { fontFamily: SANS, fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.015em', lineHeight: 1.4 },
      h3: { fontFamily: SANS, fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em', lineHeight: 1.4 },
      h4: { fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem',  lineHeight: 1.4 },
      h5: { fontFamily: SANS, fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4 },
      h6: { fontFamily: SANS, fontWeight: 600, fontSize: '0.75rem',   lineHeight: 1.4 },
      body1:   { fontFamily: SANS, fontSize: '0.8438rem', lineHeight: 1.6,  fontWeight: 400 },
      body2:   { fontFamily: SANS, fontSize: '0.7813rem', lineHeight: 1.55, fontWeight: 400 },
      caption: { fontFamily: SANS, fontSize: '0.6875rem', lineHeight: 1.4,  fontWeight: 500 },
      overline: { fontFamily: SANS, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' as const },
      button:  { fontFamily: SANS, fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none' as const, letterSpacing: '0' },
    },

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontSize: 13, WebkitFontSmoothing: 'antialiased', backgroundColor: C.surface },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 6,
            letterSpacing: '0',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            transition: `all 0.12s ${ease}`,
          },
          sizeLarge:  { height: 40, fontSize: '0.875rem',  padding: '0 20px' },
          sizeMedium: { height: 34, fontSize: '0.8125rem', padding: '0 14px' },
          sizeSmall:  { height: 28, fontSize: '0.75rem',   padding: '0 10px' },
          containedPrimary: {
            backgroundColor: C.blue,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: C.blueDark,
              boxShadow: 'none',
            },
          },
          containedSecondary: {
            backgroundColor: C.ink,
            boxShadow: 'none',
            '&:hover': { backgroundColor: C.inkMid, boxShadow: 'none' },
          },
          outlined: {
            borderColor: C.border,
            color: C.inkMid,
            boxShadow: 'none',
            '&:hover': { backgroundColor: C.borderSub, borderColor: C.subtle, boxShadow: 'none' },
          },
          text: {
            color: C.slate,
            '&:hover': { backgroundColor: C.borderSub, color: C.inkMid },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            transition: `background-color 0.12s ${ease}`,
            '&:hover': { backgroundColor: C.borderSub },
          },
          sizeMedium: { width: 32, height: 32 },
          sizeSmall:  { width: 26, height: 26 },
        },
      },

      MuiTextField: {
        defaultProps: { size: 'small' as const },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: '0.8438rem',
            borderRadius: 6,
            backgroundColor: dark ? '#1C1F28' : C.paper,
            transition: `box-shadow 0.12s ${ease}, border-color 0.12s ${ease}`,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.subtle },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: C.blue,
              borderWidth: 1,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 2px ${alpha(C.blue, 0.18)}`,
            },
          },
          notchedOutline: { borderColor: C.border },
          input: { padding: '7px 11px' },
          inputSizeSmall: { padding: '6px 10px' },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            color: C.muted,
            '&.Mui-focused': { color: C.blue },
          },
          sizeSmall: { fontSize: '0.8125rem' },
        },
      },

      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: '0.6875rem', marginTop: 4 } },
      },

      MuiSelect: {
        styleOverrides: { select: { fontSize: '0.8125rem' } },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 8,
            border: `1px solid ${dark ? '#2D3240' : C.border}`,
            boxShadow: 'none',
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: { padding: '16px', '&:last-child': { paddingBottom: 16 } },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 8 },
          elevation1: { boxShadow: '0 1px 3px rgba(55,53,47,0.06)' },
          elevation2: { boxShadow: '0 3px 12px rgba(55,53,47,0.08)' },
          elevation3: { boxShadow: '0 8px 24px rgba(55,53,47,0.12)' },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 4, fontWeight: 500, fontSize: '0.6875rem', height: 22 },
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
            minHeight: 38,
            color: C.slate,
            '&.Mui-selected': { color: C.ink, fontWeight: 600 },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 38 },
          indicator: { height: 2, borderRadius: 0, backgroundColor: C.ink },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            transition: `background-color 0.1s ${ease}`,
          },
        },
      },

      MuiListItemText: {
        styleOverrides: {
          primary:   { fontSize: '0.8125rem' },
          secondary: { fontSize: '0.75rem' },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 6, fontSize: '0.8125rem', border: '1px solid transparent' },
          standardSuccess: { backgroundColor: C.greenBg,   color: '#065F46', borderColor: '#A7F3D0' },
          standardError:   { backgroundColor: C.redBg,     color: '#991B1B', borderColor: '#FECACA' },
          standardWarning: { backgroundColor: C.amberBg,   color: '#92400E', borderColor: '#FDE68A' },
          standardInfo:    { backgroundColor: C.blueLight, color: C.blueDark, borderColor: C.blueMid },
          message: { fontSize: '0.8125rem', padding: '2px 0' },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            boxShadow: '0 16px 48px rgba(55,53,47,0.18), 0 4px 16px rgba(55,53,47,0.08)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: '1rem', fontWeight: 600, padding: '20px 22px 8px', color: C.ink },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { padding: '8px 22px 14px', fontSize: '0.8438rem' },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '10px 18px 18px', gap: 8 },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            boxShadow: '0 8px 24px rgba(55,53,47,0.14), 0 1px 4px rgba(55,53,47,0.06)',
            backgroundImage: 'none',
          },
          list: { padding: '4px' },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontSize: '0.8125rem',
            minHeight: 34,
            color: C.inkMid,
            padding: '6px 10px',
            '&:hover': { backgroundColor: C.borderSub },
            '&.Mui-selected': { backgroundColor: C.blueLight, color: C.blue },
          },
        },
      },

      MuiDivider: {
        styleOverrides: { root: { borderColor: C.border } },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.6875rem', fontWeight: 500,
            backgroundColor: C.ink, borderRadius: 5,
            padding: '5px 9px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          },
          arrow: { color: C.ink },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 5, backgroundColor: C.borderSub },
          bar: { borderRadius: 999 },
        },
      },

      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 6, backgroundColor: C.borderSub } },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: C.muted,
              backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`,
              padding: '8px 14px',
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem', borderBottom: `1px solid ${C.borderSub}`,
            color: C.inkMid, padding: '10px 14px',
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
          badge: { fontSize: '0.5625rem', minWidth: 15, height: 15, padding: '0 3px' },
        },
      },

      MuiAppBar: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },

      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.22)' },
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          root: { padding: 0, width: 38, height: 22 },
          switchBase: {
            padding: 3,
            '&.Mui-checked': { transform: 'translateX(16px)' },
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: C.blue, opacity: 1 },
          },
          thumb: { width: 16, height: 16, boxShadow: 'none' },
          track: { borderRadius: 11, backgroundColor: C.subtle, opacity: 1 },
          sizeSmall: { width: 32, height: 18 },
        },
      },
    },
  });
}

export default createAppTheme('light');

// CSS custom property definitions injected by AppThemeProvider.
// These drive all C.* references (which are var(--c-*) strings).
export const CSS_VARS = {
  light: `
    :root, [data-theme="light"] {
      --c-ink: #37352F;
      --c-ink-mid: #4A4744;
      --c-slate: #73726E;
      --c-muted: #9B9A97;
      --c-subtle: #C8C8C5;
      --c-border: #E9E9E7;
      --c-border-sub: #F1F0EF;
      --c-surface: #F7F7F5;
      --c-paper: #FFFFFF;
      --c-blue-light: #F0FDFA;
      --c-blue-mid: #CCFBF1;
      --c-green-bg: #F0FDF4;
      --c-amber-bg: #FFFBEB;
      --c-red-bg: #FEF2F2;
      --c-purple-bg: #F5F3FF;
      --c-sidebar-bg: #FAFAF9;
      --c-sidebar-border: #E3E2E0;
      --c-sidebar-text: #73726E;
      --c-sidebar-hover: #EBEBEA;
      --c-sidebar-active: #E3E2E0;
      --c-sidebar-active-text: #37352F;
    }
  `,
  dark: `
    [data-theme="dark"] {
      --c-ink: #E4E8F0;
      --c-ink-mid: #B4BCCB;
      --c-slate: #8891A2;
      --c-muted: #545F72;
      --c-subtle: #363D4F;
      --c-border: #2D3240;
      --c-border-sub: #21242F;
      --c-surface: #13151C;
      --c-paper: #1C1F28;
      --c-blue-light: #0A2520;
      --c-blue-mid: #0D3530;
      --c-green-bg: #0C1F12;
      --c-amber-bg: #1E1408;
      --c-red-bg: #1E0C0C;
      --c-purple-bg: #130F20;
      --c-sidebar-bg: #0F1118;
      --c-sidebar-border: #232733;
      --c-sidebar-text: #8891A2;
      --c-sidebar-hover: #1C2030;
      --c-sidebar-active: #242838;
      --c-sidebar-active-text: #E4E8F0;
    }
  `,
};
