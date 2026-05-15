import { Box, Typography } from '@mui/material';
import BrandLogo from './BrandLogo';

const QUOTES = [
  { q: 'The greatest wealth is health.', a: 'Virgil' },
  { q: 'To keep the body in good health is a duty.', a: 'Buddha' },
  { q: 'Healing is a matter of time, but also of opportunity.', a: 'Hippocrates' },
];
const quote = QUOTES[new Date().getDate() % QUOTES.length];

const PERKS = [
  { title: 'Smart scheduling', desc: 'AI fills your calendar automatically' },
  { title: 'Unified records', desc: 'All patient data in one secure place' },
  { title: 'Instant payments', desc: 'Razorpay-powered, zero friction' },
];

export default function BrandingPanel() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 480px',
        flexDirection: 'column',
        p: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
        background: '#08111F',
      }}
    >
      {/* Soft colour blobs */}
      <Box sx={{ position: 'absolute', top: -140, right: -140, width: 440, height: 440, borderRadius: '50%', background: 'rgba(13,148,136,0.35)', filter: 'blur(110px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(45,212,191,0.18)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* ── Logo ── */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '9px',
          background: 'linear-gradient(135deg, #0D9488, #0F766E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(13,148,136,0.5)',
        }}>
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white"/>
          </svg>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
          MediCore
        </Typography>
      </Box>

      {/* ── Main copy ── */}
      <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography sx={{
          fontSize: '0.75rem', fontWeight: 700, color: '#2DD4BF',
          letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2,
        }}>
          Join MediCore
        </Typography>

        <Typography sx={{
          fontSize: '2.375rem', fontWeight: 900, color: '#fff',
          lineHeight: 1.1, letterSpacing: '-0.045em', mb: 3,
        }}>
          Your practice,<br />
          <Box component="span" sx={{ color: '#2DD4BF' }}>elevated.</Box>
        </Typography>

        <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, mb: 5 }}>
          Everything your clinic needs — from first appointment to final receipt.
        </Typography>

        {/* Perk list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {PERKS.map(({ title, desc }, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', flexShrink: 0, mt: 0.25,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#2DD4BF' }}>{i + 1}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', mb: 0.25 }}>{title}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Quote ── */}
      <Box sx={{
        position: 'relative', zIndex: 1,
        p: 2.5, borderRadius: '14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontStyle: 'italic', mb: 1.25 }}>
          "{quote.q}"
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          — {quote.a}
        </Typography>
      </Box>
    </Box>
  );
}
