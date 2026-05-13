import { Box, Typography } from '@mui/material';
import { C } from '../styles/theme';

interface BrandLogoProps {
  collapsed?: boolean;
  white?: boolean;
}

export default function BrandLogo({ collapsed = false, white = false }: BrandLogoProps) {
  const fg = white ? '#fff' : C.ink;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, userSelect: 'none', flexShrink: 0 }}>
      <Box
        sx={{
          width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
          background: white ? 'rgba(255,255,255,0.15)' : C.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white" />
        </svg>
      </Box>
      {!collapsed && (
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: fg, letterSpacing: '-0.02em', lineHeight: 1 }}>
          MediCore
        </Typography>
      )}
    </Box>
  );
}
