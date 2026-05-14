import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Avatar, TextField } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SecurityIcon from '@mui/icons-material/Security';

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";
const TEAL = '#0D9488';
const TEAL_DARK = '#0F766E';
const TEAL_LIGHT = '#F0FDFA';

const glass = {
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.25)',
} as const;

const DOCTORS = [
  { name: 'Dr. Anjali Sharma', role: 'Cardiologist · 12 yrs', rating: 4.9, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop', color: TEAL },
  { name: 'Dr. Sarah Chen', role: 'Pediatrician · 8 yrs', rating: 5.0, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop', color: '#6B48C8' },
  { name: 'Dr. Michael Ray', role: 'Dermatologist · 15 yrs', rating: 4.8, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80&auto=format&fit=crop', color: '#0F7348' },
  { name: 'Dr. Elena Vance', role: 'Neurologist · 10 yrs', rating: 4.9, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&auto=format&fit=crop', color: '#B45309' },
];

const TESTIMONIALS = [
  { name: 'Alexandra Smith', role: 'Marketing Director', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&auto=format&fit=crop&face', text: '"The easiest doctor\'s appointment I\'ve ever booked. Found a specialist, saw their availability, and was confirmed within minutes. The video call was crystal clear!"', highlight: false },
  { name: 'David Chen', role: 'Software Engineer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop', text: '"Being able to see reviews and credentials before booking is a game changer. I felt so much more confident going into my consultation with my specialist."', highlight: true },
  { name: 'Emma Wilson', role: 'Graphic Designer', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&auto=format&fit=crop', text: '"MediCore saved me so much time. I used to spend hours calling different clinics for an opening. Now I just open the app and it\'s done in 60 seconds."', highlight: false },
];

const FAQS = [
  { q: 'Is my medical data secure?', a: 'Yes. We use end-to-end encryption and are fully HIPAA compliant to ensure your personal health information is always protected and never shared without your consent.' },
  { q: 'How do I cancel an appointment?', a: 'You can cancel or reschedule any appointment through the "My Appointments" section in the app up to 24 hours before the scheduled time at no charge.' },
  { q: 'Do you accept insurance?', a: 'We partner with most major insurance providers. Add your insurance details to your profile to see covered practitioners and estimated co-pays upfront.' },
  { q: 'Can I consult doctors online?', a: 'Absolutely. MediCore supports HD video consultations, audio calls, and chat — so you can get care from anywhere, anytime.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ backgroundColor: '#fff', border: '1px solid #E9E9E7', borderRadius: '16px', overflow: 'hidden', mb: 1.5 }}>
      <Box onClick={() => setOpen(o => !o)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, cursor: 'pointer', '&:hover': { backgroundColor: '#FAFAF9' } }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#1A1A2E', fontFamily: SANS }}>{q}</Typography>
        <ExpandMoreIcon sx={{ color: TEAL, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }} />
      </Box>
      {open && (
        <Box sx={{ px: 3, pb: 2.5 }}>
          <Typography sx={{ fontSize: '0.9375rem', color: '#73726E', fontFamily: SANS, lineHeight: 1.7 }}>{a}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ fontFamily: SANS, backgroundColor: '#F8F9FF', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        ...glass, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 3, md: '64px' }, height: 72,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MonitorHeartIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: TEAL, fontFamily: SANS, letterSpacing: '-0.02em' }}>MediCore</Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
          {['Find a Doctor', 'Specialties', 'How it Works'].map(l => (
            <Typography key={l} sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#424656', cursor: 'pointer', fontFamily: SANS, '&:hover': { color: TEAL } }}>{l}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={() => navigate('/login')} sx={{ color: '#37352F', fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none' }}>Sign in</Button>
          <Button onClick={() => navigate('/login')} sx={{ backgroundColor: TEAL, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: '0.875rem', px: 3, py: 1, textTransform: 'none', borderRadius: '8px', boxShadow: 'none', '&:hover': { backgroundColor: TEAL_DARK, boxShadow: 'none' } }}>Book Now</Button>
        </Box>
      </Box>

      {/* ── HERO ── */}
      <Box sx={{ pt: { xs: 14, md: 18 }, pb: 16, px: { xs: 3, md: '64px' }, background: 'linear-gradient(150deg, #F0FDFA 0%, #F8F9FF 50%, #EEF2FF 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Gradient blob top-right */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', background: `linear-gradient(to left, ${TEAL}08, transparent)`, borderBottomLeftRadius: '200px', zIndex: 0, pointerEvents: 'none' }} />

        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center" sx={{ maxWidth: 1280, mx: 'auto', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 0.625, borderRadius: 20, backgroundColor: TEAL_LIGHT, border: `1px solid #CCFBF1`, mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: TEAL }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEAL_DARK, fontFamily: SANS, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Trusted by 50,000+ Patients</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: '2.75rem', md: '4rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2.5 }}>
              Your Health,{' '}
              <Box component="span" sx={{ color: TEAL }}>Simplified</Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, color: '#424656', fontFamily: SANS, lineHeight: 1.75, mb: 4.5, maxWidth: 480 }}>
              Access top-tier medical expertise from the comfort of your home. MediCore connects you with verified specialists instantly.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
              <Button onClick={() => navigate('/login')} variant="contained" sx={{ backgroundColor: TEAL, fontFamily: SANS, fontWeight: 700, fontSize: '1rem', px: 4, py: 1.5, borderRadius: '10px', textTransform: 'none', boxShadow: `0 8px 24px ${TEAL}35`, '&:hover': { backgroundColor: TEAL_DARK, boxShadow: `0 12px 32px ${TEAL}45` } }}>
                Book Appointment
              </Button>
              <Button onClick={() => navigate('/login')} sx={{ ...glass, color: TEAL, fontFamily: SANS, fontWeight: 600, fontSize: '1rem', px: 4, py: 1.5, borderRadius: '10px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { background: 'rgba(255,255,255,0.7)' } }}>
                How it Works
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 5 }}>
              {[{ v: '500+', l: 'Top Doctors' }, { v: '4.9/5', l: 'User Rating' }, { v: '120K+', l: 'Active Users' }].map(s => (
                <Box key={s.l}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: TEAL, fontFamily: SANS }}>{s.v}</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#424656', fontFamily: SANS, fontWeight: 500 }}>{s.l}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right — hero image */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: { xs: '100%', md: 480 }, height: { xs: 340, md: 520 }, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.18)' }}>
                <Box component="img"
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=85&auto=format&fit=crop"
                  alt="Doctor"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </Box>
              {/* Floating card — top left */}
              <Box sx={{ position: 'absolute', top: { xs: 10, md: 32 }, left: { xs: 0, md: -36 }, ...glass, borderRadius: '18px', p: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 190 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: `${TEAL}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarMonthIcon sx={{ fontSize: 20, color: TEAL }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1C30', fontFamily: SANS }}>Quick Booking</Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#727687', fontFamily: SANS }}>Next available in 15 mins</Typography>
                </Box>
              </Box>
              {/* Floating card — bottom right */}
              <Box sx={{ position: 'absolute', bottom: { xs: 10, md: 44 }, right: { xs: 0, md: -32 }, ...glass, borderRadius: '18px', p: 2.5, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  {[TEAL, '#6B48C8', '#0F7348'].map((c, i) => (
                    <Avatar key={i} sx={{ width: 30, height: 30, fontSize: '0.55rem', fontWeight: 700, backgroundColor: c, ml: i > 0 ? -1 : 0, border: '2px solid #fff' }}>
                      {['PS', 'AM', 'RV'][i]}
                    </Avatar>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', mb: 0.5 }}>
                  {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 12, color: '#F59E0B' }} />)}
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#727687', fontFamily: SANS, textAlign: 'center' }}>50K+ happy patients</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ── SEARCH BAR ── */}
      <Box sx={{ position: 'relative', zIndex: 10, mt: -7, px: { xs: 3, md: '64px' } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.09)', border: '1px solid rgba(226,228,240,0.5)', p: { xs: 2.5, md: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#F0F4FF', borderRadius: '12px', px: 2, py: 1.5 }}>
                  <PersonSearchIcon sx={{ color: '#727687', fontSize: 20, flexShrink: 0 }} />
                  <TextField variant="standard" placeholder="Doctor, Specialty..." fullWidth InputProps={{ disableUnderline: true, sx: { fontFamily: SANS, fontSize: '0.9rem', color: '#0B1C30' } }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#F0F4FF', borderRadius: '12px', px: 2, py: 1.5 }}>
                  <LocationOnIcon sx={{ color: '#727687', fontSize: 20, flexShrink: 0 }} />
                  <TextField variant="standard" placeholder="Location" fullWidth InputProps={{ disableUnderline: true, sx: { fontFamily: SANS, fontSize: '0.9rem', color: '#0B1C30' } }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#F0F4FF', borderRadius: '12px', px: 2, py: 1.5 }}>
                  <EventIcon sx={{ color: '#727687', fontSize: 20, flexShrink: 0 }} />
                  <TextField variant="standard" type="date" fullWidth InputProps={{ disableUnderline: true, sx: { fontFamily: SANS, fontSize: '0.9rem', color: '#0B1C30' } }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth onClick={() => navigate('/login')} startIcon={<SearchIcon />}
                  sx={{ backgroundColor: TEAL, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: '0.9375rem', py: 1.75, borderRadius: '12px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: TEAL_DARK, boxShadow: 'none' } }}>
                  Find Doctor
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* ── FEATURES (BENTO) ── */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: '64px' } }}>
        <Box sx={{ textAlign: 'center', mb: 8, maxWidth: 640, mx: 'auto' }}>
          <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 1.5 }}>Why Choose MediCore?</Typography>
          <Typography sx={{ fontSize: '1.0625rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7 }}>
            We've redesigned the medical experience to be as seamless as ordering a coffee.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Grid container spacing={3}>
            {/* Large card — Instant Booking */}
            <Grid item xs={12} md={8}>
              <Box sx={{ ...glass, borderRadius: '28px', p: { xs: 4, md: 5 }, height: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'center', backgroundColor: 'rgba(240,253,250,0.6)' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: 56, height: 56, backgroundColor: TEAL, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    <BoltIcon sx={{ fontSize: 28, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#0B1C30', fontFamily: SANS, mb: 1.5 }}>Instant Booking</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7, mb: 2.5 }}>
                    No more waiting on hold. Book your preferred slot with any specialist in under 60 seconds. Syncs directly with your calendar.
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: TEAL, cursor: 'pointer', fontWeight: 600, fontFamily: SANS, fontSize: '0.875rem' }}>
                    Learn more <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', flexShrink: 0, maxWidth: { sm: 240, md: 280 }, width: '100%', height: 220 }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop" alt="Booking" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Box>
            </Grid>

            {/* Small card — Verified Doctors */}
            <Grid item xs={12} md={4}>
              <Box sx={{ ...glass, borderRadius: '28px', p: 4, height: '100%', '&:hover': { boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }, transition: 'box-shadow 0.25s' }}>
                <Box sx={{ width: 56, height: 56, backgroundColor: '#EEF2FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <VerifiedUserIcon sx={{ fontSize: 28, color: '#4F46E5' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#0B1C30', fontFamily: SANS, mb: 1.5 }}>Verified Doctors</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7 }}>
                  Every practitioner undergoes a rigorous 5-step background and credential verification process.
                </Typography>
              </Box>
            </Grid>

            {/* Small card — 24/7 Support */}
            <Grid item xs={12} md={4}>
              <Box sx={{ ...glass, borderRadius: '28px', p: 4, height: '100%', '&:hover': { boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }, transition: 'box-shadow 0.25s' }}>
                <Box sx={{ width: 56, height: 56, backgroundColor: '#FFF7ED', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <SupportAgentIcon sx={{ fontSize: 28, color: '#B45309' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#0B1C30', fontFamily: SANS, mb: 1.5 }}>24/7 Support</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7 }}>
                  Our dedicated patient care team is available around the clock for rescheduling or any questions.
                </Typography>
              </Box>
            </Grid>

            {/* Large card — Virtual Consultations */}
            <Grid item xs={12} md={8}>
              <Box sx={{ ...glass, borderRadius: '28px', p: { xs: 4, md: 5 }, height: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row-reverse' }, gap: 4, alignItems: 'center', backgroundColor: 'rgba(238,242,255,0.5)' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: 56, height: 56, backgroundColor: '#EEF2FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    <VideocamOutlinedIcon sx={{ fontSize: 28, color: '#4F46E5' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#0B1C30', fontFamily: SANS, mb: 1.5 }}>Virtual Consultations</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7, mb: 2.5 }}>
                    Can't make it to the clinic? Experience HD video consultations that feel as personal as an in-office visit.
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: TEAL, cursor: 'pointer', fontWeight: 600, fontFamily: SANS, fontSize: '0.875rem' }}>
                    Explore Telehealth <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', flexShrink: 0, maxWidth: { sm: 240, md: 280 }, width: '100%', height: 220 }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&q=80&auto=format&fit=crop" alt="Video call" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ── TOP DOCTORS ── */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: '64px' }, backgroundColor: 'rgba(240,244,255,0.4)' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em', mb: 0.75 }}>Top Rated Doctors</Typography>
              <Typography sx={{ fontSize: '1rem', color: '#424656', fontFamily: SANS }}>Highly specialized professionals with years of experience.</Typography>
            </Box>
            <Box onClick={() => navigate('/login')} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: TEAL, fontWeight: 600, fontSize: '0.9375rem', fontFamily: SANS, cursor: 'pointer' }}>
              View All Doctors <ArrowOutwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {DOCTORS.map(doc => (
              <Grid item xs={12} sm={6} lg={3} key={doc.name}>
                <Box sx={{
                  backgroundColor: '#fff', borderRadius: '28px', p: 3,
                  border: '1px solid rgba(194,198,216,0.2)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 24px 60px rgba(0,0,0,0.11)' },
                  '&:hover .doc-img': { transform: 'scale(1.08)' },
                }}>
                  <Box sx={{ position: 'relative', mb: 2.5, borderRadius: '18px', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <Box component="img" src={doc.img} alt={doc.name} className="doc-img"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.5s' }}
                    />
                    <Box sx={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', px: 1.25, py: 0.5, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: SANS }}>{doc.rating}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0B1C30', fontFamily: SANS, mb: 0.5 }}>{doc.name}</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: doc.color, fontWeight: 600, fontFamily: SANS, mb: 2 }}>{doc.role}</Typography>
                  <Button fullWidth onClick={() => navigate('/login')}
                    sx={{ backgroundColor: '#EEF2FF', color: TEAL, fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', py: 1.25, borderRadius: '12px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: TEAL, color: '#fff', boxShadow: 'none' }, transition: 'all 0.2s' }}>
                    Book Appointment
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: '64px' }, backgroundColor: '#fff' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em', mb: 1.5 }}>What Our Patients Say</Typography>
            <Typography sx={{ fontSize: '1.0625rem', color: '#424656', fontFamily: SANS }}>Real feedback from people who've simplified their healthcare.</Typography>
          </Box>
          <Grid container spacing={3}>
            {TESTIMONIALS.map(t => (
              <Grid item xs={12} md={4} key={t.name}>
                <Box sx={{ ...glass, ...(t.highlight ? { backgroundColor: `${TEAL}0A`, border: `1px solid ${TEAL}25` } : {}), borderRadius: '28px', p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2.5 }}>
                    {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />)}
                  </Box>
                  <Typography sx={{ fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, lineHeight: 1.75, fontStyle: 'italic', flex: 1, mb: 3 }}>{t.text}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box component="img" src={t.img} alt={t.name} sx={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1C30', fontFamily: SANS }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#727687', fontFamily: SANS }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── APP SHOWCASE ── */}
      <Box sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, md: '64px' } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Box sx={{ backgroundColor: TEAL, borderRadius: '40px', p: { xs: 5, md: 10 }, overflow: 'hidden', position: 'relative' }}>
            {/* Glow */}
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)', transform: 'translate(30%, -30%)', pointerEvents: 'none' }} />
            <Grid container spacing={6} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} lg={6}>
                <Typography sx={{ fontSize: { xs: '2.25rem', md: '3.25rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2 }}>
                  Your Health in Your Pocket
                </Typography>
                <Typography sx={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.75)', fontFamily: SANS, lineHeight: 1.75, mb: 5, maxWidth: 420 }}>
                  Manage appointments, access records, and chat with doctors on the go.
                </Typography>
                {[
                  'Book appointments in 60 seconds',
                  'Secure medical record storage',
                  'AI-powered health assistant',
                  'Real-time doctor chat',
                ].map(item => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.88)', fontFamily: SANS, fontWeight: 500 }}>{item}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                  {['App Store', 'Google Play'].map(store => (
                    <Box key={store} sx={{ backgroundColor: '#000', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                      <PhoneIphoneIcon sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.6rem', fontFamily: SANS, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{store === 'App Store' ? 'Download on the' : 'Get it on'}</Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, fontFamily: SANS, lineHeight: 1.1 }}>{store}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: { xs: '100%', md: 380 }, height: { xs: 280, md: 420 }, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.3)', transform: { md: 'rotate(3deg)' } }}>
                  <Box component="img"
                    src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=760&q=80&auto=format&fit=crop"
                    alt="App"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: '64px' } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em' }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box component="footer" sx={{ backgroundColor: '#F8F9FF', borderTop: '1px solid #E2E4F0', pt: { xs: 8, md: 12 }, pb: 4, px: { xs: 3, md: '64px' } }}>
        <Grid container spacing={5} sx={{ maxWidth: 1280, mx: 'auto', mb: 6 }}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonitorHeartIcon sx={{ fontSize: 18, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0B1C30', fontFamily: SANS }}>MediCore</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7, mb: 3, maxWidth: 280 }}>
              Empowering patients with seamless access to high-quality healthcare, anytime, anywhere.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[SecurityIcon].map((Icon, i) => (
                <Box key={i} sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#E5E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: TEAL, color: '#fff' }, transition: 'all 0.2s' }}>
                  <Icon sx={{ fontSize: 18, color: 'inherit' }} />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Quick links */}
          <Grid item xs={6} md={2}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 2.5 }}>Quick Links</Typography>
            {['Find a Doctor', 'Specialties', 'How it Works', 'Pricing'].map(l => (
              <Typography key={l} sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, mb: 1.5, cursor: 'pointer', '&:hover': { color: TEAL, transform: 'translateX(4px)' }, display: 'inline-block', transition: 'all 0.15s' }}>{l}</Typography>
            ))}
          </Grid>

          {/* Support */}
          <Grid item xs={6} md={2}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 2.5 }}>Support</Typography>
            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
              <Typography key={l} sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, mb: 1.5, cursor: 'pointer', '&:hover': { color: TEAL }, display: 'block', transition: 'color 0.15s' }}>{l}</Typography>
            ))}
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 1 }}>Newsletter</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, mb: 2.5, lineHeight: 1.65 }}>Stay updated with the latest health tips and platform news.</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField placeholder="Your email" size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff', fontSize: '0.875rem', fontFamily: SANS } }} />
              <Button sx={{ backgroundColor: TEAL, color: '#fff', minWidth: 'auto', px: 2, borderRadius: '10px', flexShrink: 0, boxShadow: 'none', '&:hover': { backgroundColor: TEAL_DARK, boxShadow: 'none' } }}>
                <SendIcon sx={{ fontSize: 18 }} />
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box sx={{ maxWidth: 1280, mx: 'auto', pt: 3, borderTop: '1px solid #E2E4F0', display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: '#727687', fontFamily: SANS }}>© 2026 MediCore Healthcare. All rights reserved.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
