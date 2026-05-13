import { Box, Typography } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import BrandLogo from './BrandLogo';
import { COLORS } from '../styles/theme';

const features = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />,
    title: 'HIPAA Compliant',
    desc: 'End-to-end encryption & audit trails',
  },
  {
    icon: <BoltIcon sx={{ fontSize: 18 }} />,
    title: 'Real-time Sync',
    desc: 'Instant health record updates',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 18 }} />,
    title: '10,000+ Providers',
    desc: 'Trusted by clinics nationwide',
  },
];

const stats = [
  { value: '98%', label: 'Patient satisfaction' },
  { value: '4.9★', label: 'App store rating' },
  { value: '< 2min', label: 'Avg. wait time' },
];

export default function BrandingPanel() {
  return (
    <Box
      component="section"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: { md: '0 0 48%', lg: '0 0 55%' },
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        p: { md: 5, lg: 8 },
        background: `linear-gradient(145deg, #0A1628 0%, #0F2044 40%, #0D1E3C 70%, #0A1628 100%)`,
      }}
    >
      {/* Subtle grid lines */}
      <Box
        sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow orbs */}
      <Box sx={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.primary}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, #0EA5E922 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480, width: '100%', color: 'white' }}>
        {/* Logo */}
        <Box mb={5}>
          <BrandLogo variant="white" iconSize="large" />
        </Box>

        {/* Badge */}
        <Box
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1.5, py: 0.625,
            backgroundColor: 'rgba(37,99,235,0.25)',
            border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: 999, mb: 3,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#60A5FA', flexShrink: 0, boxShadow: '0 0 6px #60A5FA' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#93C5FD', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Trusted Healthcare Platform
          </Typography>
        </Box>

        {/* Headline */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { md: '2.25rem', lg: '2.75rem' },
            lineHeight: 1.15,
            fontWeight: 800,
            color: 'white',
            mb: 2.5,
            letterSpacing: '-0.03em',
          }}
        >
          Advancing the future of{' '}
          <Box component="span" sx={{
            background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            clinical care.
          </Box>
        </Typography>

        {/* Subtext */}
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            lineHeight: 1.75,
            mb: 5,
            maxWidth: 400,
          }}
        >
          Connect with your healthcare provider or manage patient records through our secure, HIPAA-compliant clinical portal.
        </Typography>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex', gap: 0, mb: 4,
            p: 2.5,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {stats.map(({ value, label }, i) => (
            <Box
              key={label}
              sx={{
                flex: 1, textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                px: 1,
              }}
            >
              <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', mt: 0.25, fontWeight: 500, letterSpacing: '0.02em' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Feature chips */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {features.map(({ icon, title, desc }) => (
            <Box
              key={title}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 1.75, borderRadius: 2.5,
                border: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.07)' },
              }}
            >
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.4) 0%, rgba(14,165,233,0.4) 100%)',
                border: '1px solid rgba(96,165,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#93C5FD',
              }}>
                {icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
                  {title}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', mt: 0.1 }}>
                  {desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
