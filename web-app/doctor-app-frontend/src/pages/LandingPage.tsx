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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";

const FEATURES = [
  { icon: <CalendarMonthIcon sx={{ fontSize: 24 }} />, title: 'Smart Scheduling', desc: 'Book appointments in seconds with real-time slot availability and instant confirmation.', bg: '#F0FDFA', color: '#0D9488' },
  { icon: <VideocamOutlinedIcon sx={{ fontSize: 24 }} />, title: 'Video Consultations', desc: 'Connect with your doctor from anywhere — no travel, no waiting rooms.', bg: '#F5F3FF', color: '#6B48C8' },
  { icon: <AutoAwesomeIcon sx={{ fontSize: 24 }} />, title: 'AI Health Assistant', desc: 'Get instant symptom checks and AI-powered explanations of your medical documents.', bg: '#FFFBEB', color: '#B45309' },
  { icon: <MonitorHeartIcon sx={{ fontSize: 24 }} />, title: 'Health Records', desc: 'All your medical records, reports and prescriptions in one secure place.', bg: '#F0FDF4', color: '#0F7348' },
  { icon: <SecurityIcon sx={{ fontSize: 24 }} />, title: 'Private & Secure', desc: 'End-to-end encrypted. Your health information stays yours, always.', bg: '#FEF2F2', color: '#C73535' },
  { icon: <PeopleAltIcon sx={{ fontSize: 24 }} />, title: 'Top Specialists', desc: 'Access a network of verified doctors across every specialization.', bg: '#F0FDFA', color: '#0D9488' },
];

const STATS = [
  { value: '50K+', label: 'Patients served' },
  { value: '1,200+', label: 'Verified doctors' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '24/7', label: 'Support available' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Patient', text: 'MediCore made it so easy to find a cardiologist and book same-day. The video call quality was excellent.', rating: 5, initials: 'PS', color: '#0D9488' },
  { name: 'Dr. Arjun Mehta', role: 'Cardiologist', text: 'Managing my clinic schedule used to be a headache. MediCore completely streamlined everything for me.', rating: 5, initials: 'AM', color: '#6B48C8' },
  { name: 'Rohit Verma', role: 'Patient', text: 'The AI assistant helped me understand my lab reports in plain language. An incredibly useful feature.', rating: 5, initials: 'RV', color: '#0F7348' },
];

// Floating stat card shown over the hero image
function FloatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Box sx={{
      backgroundColor: '#fff', borderRadius: '12px', px: 2, py: 1.5,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 1.25,
      minWidth: 160,
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#1A1A2E', fontFamily: SANS, lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: '#9B9A97', fontFamily: SANS, mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ fontFamily: SANS, backgroundColor: '#fff', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #E9E9E7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 3, md: 8 }, height: 60,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        minHeight: '100vh', pt: { xs: 12, md: 10 }, pb: { xs: 8, md: 6 },
        px: { xs: 3, md: 8 },
        background: 'linear-gradient(150deg, #F0FDFA 0%, #FAFAF9 50%, #F5F3FF 100%)',
        display: 'flex', alignItems: 'center',
      }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center" sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>

          {/* Left — copy */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: 20, backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', mb: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 13, color: '#0D9488' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F766E', fontFamily: SANS, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AI-powered healthcare
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, color: '#1A1A2E', fontFamily: SANS, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2.5 }}>
              Healthcare that works{' '}
              <Box component="span" sx={{ color: '#0D9488' }}>around you</Box>
            </Typography>

            <Typography sx={{ fontSize: { xs: '1rem', md: '1.0625rem' }, color: '#73726E', fontFamily: SANS, lineHeight: 1.75, mb: 4.5, maxWidth: 480 }}>
              Book appointments, consult doctors online, manage your health records,
              and get AI-powered insights — all in one beautiful platform.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
              <Button onClick={() => navigate('/login')} variant="contained" endIcon={<ArrowForwardIcon />}
                sx={{ backgroundColor: '#0D9488', fontFamily: SANS, fontWeight: 700, fontSize: '0.9375rem', px: 3.5, py: 1.4, borderRadius: '10px', boxShadow: '0 4px 20px rgba(13,148,136,0.30)', textTransform: 'none', '&:hover': { backgroundColor: '#0F766E', boxShadow: '0 6px 24px rgba(13,148,136,0.40)' } }}>
                Get Started free
              </Button>
              <Button onClick={() => navigate('/register')} variant="outlined"
                sx={{ borderColor: '#D1D5DB', color: '#37352F', fontFamily: SANS, fontWeight: 600, fontSize: '0.9375rem', px: 3.5, py: 1.4, borderRadius: '10px', textTransform: 'none', backgroundColor: '#fff', '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' } }}>
                Register as Doctor
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
              {['No credit card required', 'HIPAA compliant', '256-bit encryption'].map(t => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#0D9488' }} />
                  <Typography sx={{ fontSize: '0.8125rem', color: '#73726E', fontFamily: SANS, fontWeight: 500 }}>{t}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right — doctor image with floating cards */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>

              {/* Main image */}
              <Box sx={{
                width: { xs: '100%', md: 460 }, height: { xs: 320, md: 500 },
                borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
                position: 'relative', flexShrink: 0,
              }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=920&q=85&auto=format&fit=crop"
                  alt="Doctor consultation"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
                {/* Subtle overlay */}
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(13,20,30,0.35) 100%)' }} />
              </Box>

              {/* Floating card — top left */}
              <Box sx={{ position: 'absolute', top: { xs: -12, md: 24 }, left: { xs: 0, md: -32 }, zIndex: 2 }}>
                <FloatCard icon={<VerifiedIcon sx={{ fontSize: 18 }} />} label="Verified doctors" value="1,200+" color="#0D9488" />
              </Box>

              {/* Floating card — bottom right */}
              <Box sx={{ position: 'absolute', bottom: { xs: -12, md: 40 }, right: { xs: 0, md: -28 }, zIndex: 2 }}>
                <FloatCard icon={<AccessTimeIcon sx={{ fontSize: 18 }} />} label="Avg. booking time" value="< 2 min" color="#6B48C8" />
              </Box>

              {/* Floating card — bottom left (inside image) */}
              <Box sx={{ position: 'absolute', bottom: { xs: 20, md: 60 }, left: { xs: 12, md: -16 }, zIndex: 2 }}>
                <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', px: 2, py: 1.25, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex' }}>
                    {['#0D9488','#6B48C8','#0F7348'].map((c, i) => (
                      <Avatar key={i} sx={{ width: 26, height: 26, fontSize: '0.5rem', fontWeight: 700, backgroundColor: c, ml: i > 0 ? -0.8 : 0, border: '2px solid #fff' }}>
                        {['PS','AM','RV'][i]}
                      </Avatar>
                    ))}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                      {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 11, color: '#F59E0B' }} />)}
                    </Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#9B9A97', fontFamily: SANS }}>50K+ happy patients</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ── STATS — full bleed with bg image ── */}
      <Box sx={{ position: 'relative', py: { xs: 7, md: 9 }, overflow: 'hidden' }}>
        {/* Background image */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=70&auto=format&fit=crop"
          alt=""
          aria-hidden
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Dark teal overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,148,136,0.93) 0%, rgba(10,80,75,0.96) 100%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 8 } }}>
          <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 900, mx: 'auto' }}>
            {STATS.map(s => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, lineHeight: 1 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.72)', fontFamily: SANS, mt: 0.75, fontWeight: 500 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── FEATURES ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, backgroundColor: '#FAFAF9' }}>
        <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 560, mx: 'auto' }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0D9488', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 1.5 }}>
            Everything you need
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#1A1A2E', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Modern healthcare, simplified
          </Typography>
        </Box>
        <Grid container spacing={2.5} sx={{ maxWidth: 1100, mx: 'auto' }}>
          {FEATURES.map(f => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Box sx={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E9E9E7', p: 3, height: '100%', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: '0 12px 36px -8px rgba(0,0,0,0.12)', transform: 'translateY(-3px)' } }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '12px', backgroundColor: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {f.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A2E', fontFamily: SANS, mb: 0.75 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#73726E', fontFamily: SANS, lineHeight: 1.65 }}>{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── SPLIT IMAGE SECTION ── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: { md: 480 }, overflow: 'hidden' }}>
        {/* Left — image */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: { xs: 280, md: 'auto' } }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=900&q=80&auto=format&fit=crop"
            alt="Doctor using MediCore"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.08) 100%)' }} />
        </Box>

        {/* Right — copy */}
        <Box sx={{ flex: 1, backgroundColor: '#1A1A2E', display: 'flex', alignItems: 'center', p: { xs: 5, md: 8 } }}>
          <Box sx={{ maxWidth: 440 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#2DD4BF', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 2 }}>
              Built for doctors too
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 2.5 }}>
              Your entire practice, in one dashboard
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.68)', fontFamily: SANS, lineHeight: 1.75, mb: 4 }}>
              Set your schedule, manage clinics, communicate with patients, and handle appointments — all without leaving MediCore.
            </Typography>
            {['Manage availability & slots', 'Multi-clinic support', 'Real-time patient chat', 'Appointment history & records'].map(item => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircleIcon sx={{ fontSize: 13, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.85)', fontFamily: SANS, fontWeight: 500 }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, backgroundColor: '#fff' }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0D9488', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 1.5 }}>
            What people say
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#1A1A2E', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Trusted by patients & doctors
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
          {TESTIMONIALS.map(t => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box sx={{ backgroundColor: '#FAFAF9', borderRadius: '14px', border: '1px solid #E9E9E7', p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  {Array.from({ length: t.rating }).map((_, i) => <StarIcon key={i} sx={{ fontSize: 15, color: '#F59E0B' }} />)}
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', color: '#4A4744', fontFamily: SANS, lineHeight: 1.7, flex: 1, mb: 2.5 }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Avatar sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: t.color, fontSize: '0.75rem', fontWeight: 700 }}>
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

      {/* ── CTA — bg image ── */}
      <Box sx={{ position: 'relative', py: { xs: 10, md: 16 }, px: { xs: 3, md: 8 }, overflow: 'hidden', textAlign: 'center' }}>
        {/* Background image */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=75&auto=format&fit=crop"
          alt=""
          aria-hidden
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,60,55,0.94) 0%, rgba(13,148,136,0.90) 100%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 620, mx: 'auto' }}>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 1.5 }}>
            Your health, your way
          </Typography>
          <Typography sx={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.78)', fontFamily: SANS, mb: 5, lineHeight: 1.7 }}>
            Join thousands of patients and doctors who've made the switch to smarter, simpler healthcare.
          </Typography>
          <Button onClick={() => navigate('/login')} variant="contained" endIcon={<ArrowForwardIcon />}
            sx={{ backgroundColor: '#fff', color: '#0D9488', fontFamily: SANS, fontWeight: 700, fontSize: '1rem', px: 4.5, py: 1.6, borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.20)', textTransform: 'none', '&:hover': { backgroundColor: '#F0FDFA', boxShadow: '0 12px 40px rgba(0,0,0,0.28)' } }}>
            Get Started for free
          </Button>
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ backgroundColor: '#0F172A', py: 4, px: { xs: 3, md: 8 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MonitorHeartIcon sx={{ fontSize: 15, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: SANS }}>MediCore</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.38)', fontFamily: SANS }}>
          © 2026 MediCore. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
