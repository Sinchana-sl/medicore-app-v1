import { Box, Typography } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

interface BrandLogoProps {
  color?: string;
  iconSize?: 'small' | 'medium' | 'large';
}

export default function BrandLogo({ color = 'inherit', iconSize = 'medium' }: BrandLogoProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
        <MedicalServicesIcon sx={{ color, fontSize: iconSize === 'large' ? 36 : 28 }} />
      </Box>
      <Typography
        sx={{ color, fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '1.25rem', lineHeight: 1, whiteSpace: 'nowrap' }}
      >
        MediConnect
      </Typography>
    </Box>
  );
}
