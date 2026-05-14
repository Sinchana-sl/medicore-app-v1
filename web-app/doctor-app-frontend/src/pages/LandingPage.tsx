import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Avatar } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";

const FEATURES = [
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />,
    title: 'Smart Scheduling',
    desc: 'Book appointments in seconds. Real-time slot availability with instant confirmation.',
    bg: '#F0FDFA',
    color: '#0D9488',
  },
  {
    icon: <VideocamOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Video Consultations',
    desc: 'Connect with your doctor from anywhere — no travel, no waiting rooms.',
    bg: '#F5F3FF',
    color: '#6B48C8',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 26 }} />,
    title: 'AI Health Assistant',
    desc: 'Get instant answers, symptom checks, and document explanations powered by AI.',
    bg: '#FFFBEB',
    color: '#B45309',
  },
  {
    icon: <MonitorHeartIcon sx={{ fontSize: 26 }} />,
    title: 'Health Records',
    desc: 'All your medical records, reports and prescriptions in one secure place.',
    bg: '#F0FDF4',
    color: '#0F7348',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 26 }} />,
    title: 'Private & Secure',
    desc: 'End-to-end encrypted data. Your health information stays yours.',
    bg: '#FEF2F2',
    color: '#C73535',
  },
  {
    icon: <PeopleAltIcon sx={{ fontSize: 26 }} />,
    title: 'Top Specialists',
    desc: 'Access a network of verified doctors across all specializations.',
    bg: '#F0FDFA',
    color: '#0D9488',
  },
];

const STATS = [
  { value: '50K+', label: 'Patients served' },
  { value: '1,200+', label: 'Verified doctors' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '24/7', label: 'Support available' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Patient',
    text: 'MediCore made it so easy to find a cardiologist and book same-day. The video call quality was excellent.',
    rating: 5,
    initials: 'PS',
    color: '#0D9488',
  },
  {
    name: 'Dr. Arjun Mehta',
    role: 'Cardiologist',
    text: 'Managing my clinic schedule used to be a headache. MediCore completely streamlined everything.',
    rating: 5,
    initials: 'AM',
    color: '#6B48C8',
  },
  {
    name: 'Rohit Verma',
    role: 'Patient',
    text: 'The AI assistant helped me understand my lab reports in plain language. Incredibly useful feature.',
    rating: 5,
    initials: 'RV',
    color: '#0F7348',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ fontFamily: SANS, backgroundColor: '#FFFFFF', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E9E9E7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 3, md: 8 }, height: 60,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px', backgroundColor: '#0D9488',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MonitorHeartIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0D9488', fontFamily: SANS, letterSpacing: '-0.02em' }}>
            MediCore
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={() => navigate('/login')}
            sx={{ color: '#37352F', fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', px: 2, textTransform: 'none' }}>
            Sign in
          </Button>
          <Button onClick={() => navigate('/login')} variant="contained"
            sx={{ backgroundColor: '#0D9488', fontFamily: SANS, fontWeight: 700, fontSize: '0.875rem', px: 2.5, py: 0.875, textTransform: 'none', borderRadius: '8px', boxShadow: 'none', '&:hover': { backgroundColor: '#0F766E', boxShadow: 'none' } }}>
            Get Started
          </Button>
        </Box>
      </Box>

      {/* ── HERO ── */}
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F0FDFA 0%, #FFFFFF 45%, #F5F3FF 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pt: 10, pb: 8, px: { xs: 3, md: 8 }, textAlign: 'center',
        position: 'relative',
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: '12%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '15%', right: '6%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,72,200,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5,
          borderRadius: 20, backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', mb: 3,
        }}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#0D9488' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F766E', fontFamily: SANS, letterSpacing: '0.04em' }}>
            AI-powered healthcare platform
          </Typography>
        </Box>

        <Typography sx={{
          fontSize: { xs: '2.5rem', md: '3.75rem' }, fontWeight: 800,
          color: '#1A1A2E', fontFamily: SANS, lineHeight: 1.1,
          letterSpacing: '-0.03em', maxWidth: 720, mb: 2.5,
        }}>
          Healthcare that works{' '}
          <Box component="span" sx={{ color: '#0D9488' }}>around you</Box>
        </Typography>

        <Typography sx={{
          fontSize: { xs: '1rem', md: '1.125rem' }, color: '#73726E',
          fontFamily: SANS, maxWidth: 560, lineHeight: 1.7, mb: 5,
        }}>
          Book appointments, consult doctors online, manage your health records,
          and get AI-powered insights — all in one place.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 6 }}>
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: '#0D9488', fontFamily: SANS, fontWeight: 700,
              fontSize: '1rem', px: 4, py: 1.5, borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(13,148,136,0.30)',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#0F766E', boxShadow: '0 6px 24px rgba(13,148,136,0.38)' },
            }}
          >
            Get Started — it's free
          </Button>
          <Button
            onClick={() => navigate('/register')}
            variant="outlined"
            sx={{
              borderColor: '#E9E9E7', color: '#37352F', fontFamily: SANS, fontWeight: 600,
              fontSize: '1rem', px: 4, py: 1.5, borderRadius: '10px',
              textTransform: 'none', backgroundColor: '#fff',
              '&:hover': { borderColor: '#C8C8C5', backgroundColor: '#F7F7F5' },
            }}
          >
            Register as Doctor
          </Button>
        </Box>

        {/* Trust badges */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {['No credit card required', 'HIPAA compliant', '256-bit encryption'].map(t => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CheckCircleIcon sx={{ fontSize: 15, color: '#0D9488' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: '#73726E', fontFamily: SANS, fontWeight: 500 }}>{t}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── STATS ── */}
      <Box sx={{ backgroundColor: '#0D9488', py: 6, px: { xs: 3, md: 8 } }}>
        <Grid container spacing={2} justifyContent="center">
          {STATS.map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', fontFamily: SANS, mt: 0.5, fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── FEATURES ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, backgroundColor: '#FAFAF9' }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 1.5 }}>
            Everything you need
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#1A1A2E', fontFamily: SANS, letterSpacing: '-0.025em', maxWidth: 520, mx: 'auto', lineHeight: 1.2 }}>
            Modern healthcare, simplified
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ maxWidth: 1100, mx: 'auto' }}>
          {FEATURES.map(f => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Box sx={{
                backgroundColor: '#fff', borderRadius: '12px',
                border: '1px solid #E9E9E7', p: 3,
                height: '100%',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
              }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '12px', backgroundColor: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {f.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A2E', fontFamily: SANS, mb: 0.75 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#73726E', fontFamily: SANS, lineHeight: 1.65 }}>
                  {f.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, backgroundColor: '#fff' }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 1.5 }}>
            What people say
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#1A1A2E', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Trusted by patients & doctors
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
          {TESTIMONIALS.map(t => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box sx={{ backgroundColor: '#FAFAF9', borderRadius: '12px', border: '1px solid #E9E9E7', p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', color: '#4A4744', fontFamily: SANS, lineHeight: 1.65, mb: 2.5 }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Avatar sx={{ width: 38, height: 38, borderRadius: '8px', backgroundColor: t.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {t.initials}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A1A2E', fontFamily: SANS }}>{t.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9B9A97', fontFamily: SANS }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{
        py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 },
        background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        textAlign: 'center',
      }}>
        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 1.5 }}>
          Your health, your way
        </Typography>
        <Typography sx={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.80)', fontFamily: SANS, mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.65 }}>
          Join thousands of patients and doctors who've made the switch to smarter healthcare.
        </Typography>
        <Button
          onClick={() => navigate('/login')}
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: '#fff', color: '#0D9488', fontFamily: SANS, fontWeight: 700,
            fontSize: '1rem', px: 4, py: 1.5, borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textTransform: 'none',
            '&:hover': { backgroundColor: '#F0FDFA', boxShadow: '0 6px 28px rgba(0,0,0,0.20)' },
          }}
        >
          Get Started for free
        </Button>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ backgroundColor: '#1A1A2E', py: 4, px: { xs: 3, md: 8 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MonitorHeartIcon sx={{ fontSize: 15, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: SANS }}>MediCore</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', fontFamily: SANS }}>
          © 2026 MediCore. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
