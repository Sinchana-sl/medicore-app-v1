import { Box, Typography } from '@mui/material';
import { C } from '../styles/theme';

interface BrandLogoProps {
  collapsed?: boolean;
  white?: boolean;
  iconSize?: 'small' | 'medium' | 'large';
}

export default function BrandLogo({ collapsed = false, white = false, iconSize = 'small' }: BrandLogoProps) {
  const size = iconSize === 'large' ? 34 : iconSize === 'medium' ? 30 : 26;
  const iconPx = size * 0.42;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, userSelect: 'none', flexShrink: 0 }}>
      <Box
        sx={{
          width: size, height: size, borderRadius: '6px', flexShrink: 0,
          background: white
            ? 'rgba(255,255,255,0.15)'
            : `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: white ? 'none' : `0 1px 4px rgba(13,148,136,0.3)`,
        }}
      >
        <svg width={iconPx} height={iconPx} viewBox="0 0 14 14" fill="none">
          <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white" />
        </svg>
      </Box>
      {!collapsed && (
        <Typography sx={{
          fontWeight: 700, fontSize: '0.9375rem',
          color: white ? '#fff' : C.ink,
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          MediCore
        </Typography>
      )}
    </Box>
  );
}
