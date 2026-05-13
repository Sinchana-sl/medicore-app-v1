import { Box, Typography } from '@mui/material';
import { C } from '../styles/theme';
import BrandLogo from './BrandLogo';

const QUOTES = [
  { q: 'The greatest wealth is health.', a: 'Virgil' },
  { q: 'To keep the body in good health is a duty.', a: 'Buddha' },
  { q: 'Healing is a matter of time, but also of opportunity.', a: 'Hippocrates' },
];
const quote = QUOTES[new Date().getDate() % QUOTES.length];

const features = [
  { label: 'Appointments booked' , value: '50,000+' },
  { label: 'Verified providers',    value: '1,200+' },
  { label: 'Patient satisfaction',  value: '98%' },
];

export default function BrandingPanel() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 420px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 5,
        background: '#0D1B2A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.035,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Top */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <BrandLogo white />
      </Box>

      {/* Center */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: '#fff', lineHeight: 1.4, letterSpacing: '-0.02em', mb: 1.5 }}>
          "{quote.q}"
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
          — {quote.a}
        </Typography>
      </Box>

      {/* Bottom stats */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.08)', pt: 3 }}>
          {features.map(({ label, value }, i) => (
            <Box
              key={label}
              sx={{
                flex: 1, pr: 2,
                borderRight: i < features.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                mr: i < features.length - 1 ? 2 : 0,
              }}
            >
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', mt: 0.5, fontWeight: 500 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
