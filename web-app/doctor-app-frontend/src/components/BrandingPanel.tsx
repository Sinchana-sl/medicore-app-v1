import { Box, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';
import BrandLogo from './BrandLogo';

const features = [
  { icon: <SecurityIcon />, title: 'Encrypted Data', desc: 'Bank-level security protocols' },
  { icon: <BoltIcon />, title: 'Instant Sync', desc: 'Real-time health updates' },
];

export default function BrandingPanel() {
  return (
    <Box
      component="section"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: { md: '0 0 50%', lg: '0 0 60%' },
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        backgroundColor: '#002045',
      }}
    >
      {/* Background image */}
      <Box
        component="img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAgLy-OZqEMGYKxuLYlSu7emJXuKRG2cve-k0d8nucRJihij8-Qa7EYYQHnM2TI6mTojujOMLoRZozk5-98sR5xxQ1XpJjS87P8Jr7dq59bVfr-j8-U9yH7y4GcVx_DFK93Kr53Izrz4kaAfyEzuvsYoosVD7mQH6opK_ky_QvsJ5hw89FXt1gwCkI5uAxN6io2tWFXTU59Ujys71F1KGpMVzh1r9vV2_fQDhwy_P9gxkWIIobcZm6ZfzzeS9ElB9CE9YFZlTgmhFA"
        alt="Healthcare facility"
        sx={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.25, mixBlendMode: 'normal',
        }}
      />
      <Box
        sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top right, rgba(0,32,69,0.75), rgba(0,32,69,0.5), transparent)',
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480, color: 'white' }}>
        <Box mb={4}>
          {/* Logo row */}
          <Box mb={4}><BrandLogo color="white" iconSize="large" /></Box>

          {/* Headline */}
          <Typography variant="h1" sx={{ fontSize: { md: '2rem', lg: '2.5rem' }, lineHeight: 1.2, fontWeight: 700, color: 'white', mb: 3 }}>
            Advancing the future of clinical care.
          </Typography>

          {/* Subtext */}
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Connect with your healthcare provider or manage your patient records through our secure, HIPAA-compliant portal.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {features.map(({ icon, title, desc }) => (
            <Box
              key={title}
              sx={{
                p: 2, borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Box sx={{ color: '#adc7f7', mb: 1 }}>{icon}</Box>
              <Typography fontWeight={600} fontSize="0.875rem" letterSpacing="0.05em">{title}</Typography>
              <Typography fontSize="0.75rem" sx={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
