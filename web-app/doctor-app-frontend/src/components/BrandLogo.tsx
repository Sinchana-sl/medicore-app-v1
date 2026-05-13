import { Box, Typography } from '@mui/material';
import { COLORS } from '../styles/theme';

interface BrandLogoProps {
  color?: string;
  iconSize?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white';
}

export default function BrandLogo({ color, iconSize = 'medium', variant = 'default' }: BrandLogoProps) {
  const isWhite = variant === 'white';
  const textColor = color ?? (isWhite ? '#ffffff' : COLORS.navy);
  const iconBg = isWhite ? 'rgba(255,255,255,0.15)' : COLORS.primary;
  const iconColor = isWhite ? '#ffffff' : '#ffffff';
  const iconBorder = isWhite ? 'rgba(255,255,255,0.25)' : 'transparent';

  const size = iconSize === 'large' ? 40 : iconSize === 'small' ? 28 : 34;
  const fontSize = iconSize === 'large' ? '1.5rem' : iconSize === 'small' ? '1rem' : '1.2rem';
  const logoTextSize = iconSize === 'large' ? '1.5rem' : iconSize === 'small' ? '1rem' : '1.2rem';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, userSelect: 'none' }}>
      <Box
        sx={{
          width: size, height: size,
          borderRadius: '10px',
          background: isWhite ? 'rgba(255,255,255,0.15)' : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          border: `1.5px solid ${iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          backdropFilter: isWhite ? 'blur(8px)' : 'none',
          boxShadow: isWhite ? 'none' : '0 2px 8px rgba(37,99,235,0.3)',
        }}
      >
        {/* Pulse / Cross icon */}
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2v4M10 14v4M2 10h4M14 10h4M7 7l-3.5-3.5M13 7l3.5-3.5M7 13l-3.5 3.5M13 13l3.5 3.5"
            stroke="transparent"
          />
          <path
            d="M8 2H12V6H16V10H12V14H8V10H4V6H8V2Z"
            fill={iconColor}
          />
        </svg>
      </Box>

      <Typography
        sx={{
          color: textColor,
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 800,
          fontSize: logoTextSize,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        Medi<span style={{ opacity: isWhite ? 0.7 : 1, color: isWhite ? 'rgba(255,255,255,0.75)' : COLORS.primary }}>Core</span>
      </Typography>
    </Box>
  );
}
