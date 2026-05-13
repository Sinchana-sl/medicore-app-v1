import { Box, Typography } from '@mui/material';
import { C } from '../styles/theme';
import BrandLogo from './BrandLogo';

const QUOTES = [
  { q: 'The greatest wealth is health.', a: 'Virgil' },
  { q: 'To keep the body in good health is a duty.', a: 'Buddha' },
  { q: 'Healing is a matter of time, but also of opportunity.', a: 'Hippocrates' },
];
const quote = QUOTES[new Date().getDate() % QUOTES.length];

const stats = [
  { label: 'Appointments booked', value: '50K+' },
  { label: 'Verified providers',   value: '1.2K+' },
  { label: 'Patient satisfaction', value: '98%' },
];

export default function BrandingPanel() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 400px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 5,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(155deg, #071A2E 0%, #0D2137 40%, #0A3040 70%, #071A2E 100%)',
      }}
    >
      {/* Glow accents */}
      <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: `radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 65%)`, pointerEvents: 'none' }} />

      {/* Subtle dot grid */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Top — Logo */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <BrandLogo white />
        <Box sx={{ mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '20px', border: `1px solid rgba(45,212,191,0.25)`, backgroundColor: 'rgba(45,212,191,0.08)' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.sidebarActiveText }} />
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.sidebarActiveText, letterSpacing: '0.04em' }}>
            Healthcare Platform
          </Typography>
        </Box>
      </Box>

      {/* Center — Quote */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: 32, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${C.blue}, ${C.sidebarActiveText})`, mb: 2.5 }} />
        <Typography sx={{ fontSize: '1.3125rem', fontWeight: 700, color: '#fff', lineHeight: 1.45, letterSpacing: '-0.02em', mb: 1.5 }}>
          "{quote.q}"
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          — {quote.a}
        </Typography>
      </Box>

      {/* Bottom — Stats */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.07)', pt: 3, display: 'flex', gap: 0 }}>
          {stats.map(({ label, value }, i) => (
            <Box
              key={label}
              sx={{
                flex: 1, pr: 2,
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                mr: i < stats.length - 1 ? 2 : 0,
              }}
            >
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', mt: 0.5, fontWeight: 500 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
