import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Avatar, TextField } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const SANS   = "'Plus Jakarta Sans', system-ui, sans-serif";
const TEAL   = '#0D9488';
const TEAL_D = '#0F766E';

// Every section uses the same horizontal padding and inner max-width
const PX  = { xs: '20px', sm: '40px', lg: '80px' } as const;
const MXW = 1280; // max content width

const glass: React.CSSProperties = {
  background:              'rgba(255,255,255,0.55)',
  backdropFilter:          'blur(18px)',
  WebkitBackdropFilter:    'blur(18px)',
  border:                  '1px solid rgba(255,255,255,0.30)',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS   = [{ v: '500+', l: 'Top Doctors' }, { v: '4.9/5', l: 'User Rating' }, { v: '120K+', l: 'Active Users' }];
const DOCTORS = [
  { name: 'Dr. Anjali Sharma', role: 'Cardiologist · 12 yrs',  rating: 4.9, color: TEAL,      img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Sarah Chen',    role: 'Pediatrician · 8 yrs',   rating: 5.0, color: '#6B48C8', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Michael Ray',   role: 'Dermatologist · 15 yrs', rating: 4.8, color: '#0F7348', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Elena Vance',   role: 'Neurologist · 10 yrs',   rating: 4.9, color: '#B45309', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=480&q=80&auto=format&fit=crop' },
];
const TESTIMONIALS = [
  { name: 'Alexandra Smith', role: 'Marketing Director', highlight: false,
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop',
    text: '"The easiest doctor\'s appointment I\'ve ever booked. Found a specialist and confirmed within minutes. The video call was crystal clear!"' },
  { name: 'David Chen',      role: 'Software Engineer',  highlight: true,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&auto=format&fit=crop',
    text: '"Being able to see credentials before booking is a game changer. I felt so much more confident going into my consultation."' },
  { name: 'Emma Wilson',     role: 'Graphic Designer',   highlight: false,
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80&auto=format&fit=crop',
    text: '"MediCore saved me so much time. I used to spend hours calling clinics for an opening. Now it\'s done in 60 seconds."' },
];
const FAQS = [
  { q: 'Is my medical data secure?',       a: 'Yes. We use end-to-end encryption and are fully HIPAA compliant. Your personal health information is always protected and never shared without your consent.' },
  { q: 'How do I cancel an appointment?',  a: 'You can cancel or reschedule any appointment through "My Appointments" up to 24 hours before the scheduled time at no charge.' },
  { q: 'Do you accept insurance?',         a: 'We partner with most major insurance providers. Add your details to your profile to see covered practitioners and estimated co-pays upfront.' },
  { q: 'Can I consult doctors online?',    a: 'Absolutely. MediCore supports HD video consultations, audio calls, and chat — so you can get care from anywhere, anytime.' },
];

// ─── Reusable layout wrapper ──────────────────────────────────────────────────
function Section({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={{ px: PX, ...sx }}>
      <Box sx={{ maxWidth: MXW, mx: 'auto', width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}

function SectionHeading({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
      {label && (
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS, mb: 1.5 }}>
          {label}
        </Typography>
      )}
      <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.375rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: subtitle ? 1.5 : 0 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '1.0625rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7, maxWidth: 560, mx: 'auto' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ backgroundColor: '#fff', border: '1px solid #E4E7F0', borderRadius: '16px', mb: 2, overflow: 'hidden' }}>
      <Box onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, cursor: 'pointer', gap: 2, '&:hover': { backgroundColor: '#FAFBFF' } }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#0B1C30', fontFamily: SANS }}>
          {q}
        </Typography>
        <ExpandMoreIcon sx={{ color: TEAL, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </Box>
      {open && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75 }}>{a}</Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const nav = useNavigate();

  return (
    <Box sx={{ fontFamily: SANS, backgroundColor: '#F8F9FF', overflowX: 'hidden' }}>

      {/* NAV */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        ...glass,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(200,210,230,0.4)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        px: PX, height: 68,
        display: 'flex', alignItems: 'center',
      }}>
        <Box sx={{ maxWidth: MXW, mx: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MonitorHeartIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: TEAL, fontFamily: SANS, letterSpacing: '-0.02em' }}>MediCore</Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
            {['Find a Doctor', 'Specialties', 'How it Works'].map(l => (
              <Typography key={l} sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#424656', fontFamily: SANS, cursor: 'pointer', '&:hover': { color: TEAL }, transition: 'color 0.15s' }}>{l}</Typography>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button onClick={() => nav('/login')} sx={{ color: '#424656', fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', px: 2 }}>
              Sign in
            </Button>
            <Button onClick={() => nav('/login')} sx={{ backgroundColor: TEAL, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: '0.875rem', px: 2.5, py: 1, textTransform: 'none', borderRadius: '8px', boxShadow: 'none', '&:hover': { backgroundColor: TEAL_D, boxShadow: 'none' } }}>
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* HERO */}
      <Box sx={{
        pt: { xs: '120px', md: '140px' },
        pb: { xs: '80px', md: '120px' },
        px: PX,
        background: 'linear-gradient(145deg, #F0FDFA 0%, #F8F9FF 55%, #EEF2FF 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Soft blob */}
        <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '50%', height: '120%', background: `radial-gradient(ellipse at center, ${TEAL}0C 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: MXW, mx: 'auto', width: '100%' }}>
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Copy */}
            <Grid item xs={12} md={6}>
              {/* Badge */}
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 0.75, borderRadius: '100px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 13, color: TEAL }} />
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_D, fontFamily: SANS, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Trusted by 50,000+ Patients
                </Typography>
              </Box>

              <Typography sx={{ fontSize: { xs: '2.625rem', md: '3.75rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2.5 }}>
                Your Health,{' '}
                <Box component="span" sx={{ color: TEAL }}>Simplified</Box>
              </Typography>

              <Typography sx={{ fontSize: '1.0625rem', color: '#424656', fontFamily: SANS, lineHeight: 1.8, mb: 4, maxWidth: 460 }}>
                Access top-tier medical expertise from the comfort of your home. Connect with verified specialists instantly.
              </Typography>

              {/* CTAs */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                <Button onClick={() => nav('/login')}
                  sx={{ backgroundColor: TEAL, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: '0.9375rem', px: 3.5, py: 1.5, borderRadius: '10px', textTransform: 'none', boxShadow: `0 8px 24px ${TEAL}38`, '&:hover': { backgroundColor: TEAL_D, boxShadow: `0 12px 32px ${TEAL}48` } }}>
                  Book Appointment
                </Button>
                <Button onClick={() => nav('/login')}
                  sx={{ ...glass, color: TEAL, fontFamily: SANS, fontWeight: 600, fontSize: '0.9375rem', px: 3.5, py: 1.5, borderRadius: '10px', textTransform: 'none', '&:hover': { background: 'rgba(255,255,255,0.75)' } }}>
                  How it Works
                </Button>
              </Box>

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 4 }}>
                {STATS.map(s => (
                  <Box key={s.l}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: TEAL, fontFamily: SANS, lineHeight: 1.1 }}>{s.v}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#727687', fontFamily: SANS, mt: 0.25 }}>{s.l}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Hero image with floating cards */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', px: { xs: 0, md: 2 } }}>
                {/* Main photo */}
                <Box sx={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.16)', lineHeight: 0 }}>
                  <Box component="img"
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=85&auto=format&fit=crop"
                    alt="Doctor"
                    sx={{ width: '100%', height: { xs: 320, md: 500 }, objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                </Box>

                {/* Float: Quick Booking — bottom-left */}
                <Box sx={{ position: 'absolute', bottom: 28, left: { xs: 12, md: -16 }, ...glass, borderRadius: '16px', p: 2, boxShadow: '0 12px 36px rgba(0,0,0,0.13)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: `${TEAL}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarMonthIcon sx={{ fontSize: 20, color: TEAL }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1C30', fontFamily: SANS, lineHeight: 1.2 }}>Quick Booking</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#727687', fontFamily: SANS, mt: 0.25 }}>Next available in 15 mins</Typography>
                  </Box>
                </Box>

                {/* Float: Rating — top-right */}
                <Box sx={{ position: 'absolute', top: 24, right: { xs: 12, md: -12 }, ...glass, borderRadius: '16px', p: 2, boxShadow: '0 12px 36px rgba(0,0,0,0.13)', minWidth: 140, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.75 }}>
                    {[TEAL, '#6B48C8', '#0F7348'].map((c, i) => (
                      <Avatar key={i} sx={{ width: 28, height: 28, fontSize: '0.5rem', fontWeight: 700, backgroundColor: c, ml: i > 0 ? -0.75 : 0, border: '2px solid #fff' }}>
                        {['PS','AM','RV'][i]}
                      </Avatar>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', mb: 0.5 }}>
                    {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 12, color: '#F59E0B' }} />)}
                  </Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#727687', fontFamily: SANS }}>50K+ happy patients</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* SEARCH BAR */}
      <Section sx={{ py: { xs: '40px', md: '56px' } }}>
        <Box sx={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #E4E7F0', p: { xs: 2, md: 2.5 } }}>
          <Grid container spacing={1.5} alignItems="stretch">
            {[
              { icon: <PersonSearchIcon sx={{ fontSize: 20, color: '#727687' }} />, placeholder: 'Doctor, Specialty...', type: 'text' },
              { icon: <LocationOnIcon   sx={{ fontSize: 20, color: '#727687' }} />, placeholder: 'Location',             type: 'text' },
              { icon: <EventIcon        sx={{ fontSize: 20, color: '#727687' }} />, placeholder: '',                     type: 'date' },
            ].map((f, i) => (
              <Grid item xs={12} sm={i === 0 ? 4 : 3} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, backgroundColor: '#F5F7FF', borderRadius: '12px', px: 2, height: 52 }}>
                  {f.icon}
                  <TextField variant="standard" placeholder={f.placeholder} type={f.type} fullWidth
                    InputProps={{ disableUnderline: true, sx: { fontFamily: SANS, fontSize: '0.9rem', color: '#0B1C30' } }} />
                </Box>
              </Grid>
            ))}
            <Grid item xs={12} sm={2}>
              <Button fullWidth onClick={() => nav('/login')} startIcon={<SearchIcon />}
                sx={{ height: 52, backgroundColor: TEAL, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: '0.9rem', borderRadius: '12px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: TEAL_D, boxShadow: 'none' } }}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Section>

      {/* FEATURES — BENTO */}
      <Section sx={{ pb: { xs: '80px', md: '112px' } }}>
        <SectionHeading title="Why Choose MediCore?" subtitle="We've redesigned the medical experience to be as seamless as ordering a coffee." />
        <Grid container spacing={3}>
          {/* Large — Instant Booking */}
          <Grid item xs={12} md={8}>
            <Box sx={{ ...glass, borderRadius: '24px', p: { xs: 3.5, md: 4.5 }, backgroundColor: 'rgba(240,253,250,0.7)', height: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ width: 52, height: 52, backgroundColor: TEAL, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <BoltIcon sx={{ fontSize: 26, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0B1C30', fontFamily: SANS, mb: 1.25 }}>Instant Booking</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75, mb: 2.5 }}>
                  No more waiting on hold. Book your preferred slot with any specialist in under 60 seconds — syncs directly with your calendar.
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: TEAL, cursor: 'pointer', fontWeight: 600, fontFamily: SANS, fontSize: '0.875rem' }}>
                  Learn more <ArrowForwardIcon sx={{ fontSize: 15 }} />
                </Box>
              </Box>
              <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 240 }, height: 200, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
                <Box component="img" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop" alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>
            </Box>
          </Grid>

          {/* Small — Verified */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ ...glass, borderRadius: '24px', p: { xs: 3.5, md: 4 }, height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 20px 56px rgba(0,0,0,0.10)' } }}>
              <Box sx={{ width: 52, height: 52, backgroundColor: '#EEF2FF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                <VerifiedUserIcon sx={{ fontSize: 26, color: '#4F46E5' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0B1C30', fontFamily: SANS, mb: 1.25 }}>Verified Doctors</Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75 }}>
                Every practitioner undergoes a rigorous 5-step background and credential verification process.
              </Typography>
            </Box>
          </Grid>

          {/* Small — Support */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ ...glass, borderRadius: '24px', p: { xs: 3.5, md: 4 }, height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 20px 56px rgba(0,0,0,0.10)' } }}>
              <Box sx={{ width: 52, height: 52, backgroundColor: '#FFF7ED', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                <SupportAgentIcon sx={{ fontSize: 26, color: '#B45309' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0B1C30', fontFamily: SANS, mb: 1.25 }}>24/7 Support</Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75 }}>
                Our dedicated patient care team is available around the clock for rescheduling or any questions.
              </Typography>
            </Box>
          </Grid>

          {/* Large — Virtual Consult */}
          <Grid item xs={12} md={8}>
            <Box sx={{ ...glass, borderRadius: '24px', p: { xs: 3.5, md: 4.5 }, backgroundColor: 'rgba(238,242,255,0.6)', height: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row-reverse' }, gap: 4, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ width: 52, height: 52, backgroundColor: '#EEF2FF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <VideocamOutlinedIcon sx={{ fontSize: 26, color: '#4F46E5' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0B1C30', fontFamily: SANS, mb: 1.25 }}>Virtual Consultations</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75, mb: 2.5 }}>
                  Can't make it to the clinic? Experience HD video consultations that feel as personal as an in-office visit.
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: TEAL, cursor: 'pointer', fontWeight: 600, fontFamily: SANS, fontSize: '0.875rem' }}>
                  Explore Telehealth <ArrowForwardIcon sx={{ fontSize: 15 }} />
                </Box>
              </Box>
              <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 240 }, height: 200, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
                <Box component="img" src="https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&q=80&auto=format&fit=crop" alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* TOP DOCTORS */}
      <Box sx={{ backgroundColor: 'rgba(238,242,255,0.35)', py: { xs: '80px', md: '112px' }, px: PX }}>
        <Box sx={{ maxWidth: MXW, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 5, md: 7 }, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: '1.875rem', md: '2.375rem' }, fontWeight: 800, color: '#0B1C30', fontFamily: SANS, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 0.75 }}>
                Top Rated Doctors
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: '#424656', fontFamily: SANS }}>
                Highly specialized professionals with years of experience.
              </Typography>
            </Box>
            <Box onClick={() => nav('/login')} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: TEAL, fontWeight: 600, fontSize: '0.9375rem', fontFamily: SANS, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              View All <ArrowOutwardIcon sx={{ fontSize: 17 }} />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {DOCTORS.map(doc => (
              <Grid item xs={12} sm={6} lg={3} key={doc.name}>
                <Box sx={{
                  backgroundColor: '#fff', borderRadius: '24px', p: 2.5,
                  border: '1px solid #EAECF5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 56px rgba(0,0,0,0.10)' },
                  '&:hover .doc-img': { transform: 'scale(1.06)' },
                }}>
                  <Box sx={{ position: 'relative', mb: 2.5, borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <Box component="img" src={doc.img} alt={doc.name} className="doc-img"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.45s' }}
                    />
                    <Box sx={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(6px)', px: 1.25, py: 0.5, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: SANS }}>{doc.rating}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0B1C30', fontFamily: SANS, mb: 0.25 }}>{doc.name}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: doc.color, fontWeight: 600, fontFamily: SANS, mb: 2 }}>{doc.role}</Typography>
                  </Box>
                  <Button fullWidth onClick={() => nav('/login')}
                    sx={{ backgroundColor: '#EEF2FF', color: TEAL, fontFamily: SANS, fontWeight: 600, fontSize: '0.875rem', py: 1.25, borderRadius: '12px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: TEAL, color: '#fff', boxShadow: 'none' }, transition: 'background-color 0.2s, color 0.2s' }}>
                    Book Appointment
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* TESTIMONIALS */}
      <Section sx={{ py: { xs: '80px', md: '112px' }, backgroundColor: '#fff' }}>
        <SectionHeading title="What Our Patients Say" subtitle="Real feedback from people who've simplified their healthcare." />
        <Grid container spacing={3}>
          {TESTIMONIALS.map(t => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box sx={{
                ...glass,
                ...(t.highlight ? { backgroundColor: `${TEAL}0C`, border: `1px solid ${TEAL}28` } : {}),
                borderRadius: '24px', p: 3.5,
                height: '100%', display: 'flex', flexDirection: 'column',
              }}>
                <Box sx={{ display: 'flex', gap: 0.4, mb: 2.5 }}>
                  {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 15, color: '#F59E0B' }} />)}
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', color: '#1A1A2E', fontFamily: SANS, lineHeight: 1.78, fontStyle: 'italic', flex: 1, mb: 3 }}>
                  {t.text}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box component="img" src={t.img} alt={t.name} sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1C30', fontFamily: SANS, lineHeight: 1.3 }}>{t.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#727687', fontFamily: SANS }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* APP SHOWCASE */}
      <Section sx={{ pb: { xs: '80px', md: '112px' } }}>
        <Box sx={{ backgroundColor: TEAL, borderRadius: '32px', overflow: 'hidden', position: 'relative', p: { xs: '40px 28px', md: '72px 64px' } }}>
          <Box sx={{ position: 'absolute', top: '-20%', right: '-8%', width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} lg={6}>
              <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, color: '#fff', fontFamily: SANS, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2 }}>
                Your Health in Your Pocket
              </Typography>
              <Typography sx={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.75)', fontFamily: SANS, lineHeight: 1.75, mb: 4, maxWidth: 420 }}>
                Manage appointments, access records, and chat with doctors on the go.
              </Typography>
              {['Book appointments in 60 seconds', 'Secure medical record storage', 'AI-powered health assistant', 'Real-time doctor chat'].map(item => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircleIcon sx={{ fontSize: 13, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.88)', fontFamily: SANS, fontWeight: 500 }}>{item}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 2, mt: 4.5, flexWrap: 'wrap' }}>
                {[['Download on the', 'App Store'], ['Get it on', 'Google Play']].map(([sub, label]) => (
                  <Box key={label} sx={{ backgroundColor: '#000', color: '#fff', px: 2.5, py: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#111' }, userSelect: 'none' }}>
                    <PhoneIphoneIcon sx={{ fontSize: 26 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', fontFamily: SANS, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sub}</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, fontFamily: SANS, lineHeight: 1.1 }}>{label}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
              <Box sx={{ width: { xs: '100%', sm: 380 }, height: { xs: 260, md: 400 }, borderRadius: '28px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.28)', transform: { lg: 'rotate(2.5deg)' } }}>
                <Box component="img" src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=760&q=80&auto=format&fit=crop" alt="App" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Section>

      {/* FAQ */}
      <Section sx={{ pb: { xs: '80px', md: '112px' } }}>
        <SectionHeading title="Frequently Asked Questions" />
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </Box>
      </Section>

      {/* FOOTER */}
      <Box component="footer" sx={{ backgroundColor: '#F8F9FF', borderTop: '1px solid #E4E7F0', px: PX, pt: { xs: '60px', md: '80px' }, pb: '32px' }}>
        <Box sx={{ maxWidth: MXW, mx: 'auto', width: '100%' }}>
          <Grid container spacing={5} sx={{ mb: 6 }}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MonitorHeartIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0B1C30', fontFamily: SANS }}>MediCore</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#424656', fontFamily: SANS, lineHeight: 1.75, maxWidth: 280 }}>
                Empowering patients with seamless access to high-quality healthcare, anytime, anywhere.
              </Typography>
            </Grid>

            {/* Quick links */}
            <Grid item xs={6} md={2}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 2.5 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Find a Doctor', 'Specialties', 'How it Works', 'Pricing'].map(l => (
                  <Typography key={l} sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, cursor: 'pointer', '&:hover': { color: TEAL }, transition: 'color 0.15s' }}>{l}</Typography>
                ))}
              </Box>
            </Grid>

            {/* Support */}
            <Grid item xs={6} md={2}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 2.5 }}>Support</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
                  <Typography key={l} sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, cursor: 'pointer', '&:hover': { color: TEAL }, transition: 'color 0.15s' }}>{l}</Typography>
                ))}
              </Box>
            </Grid>

            {/* Newsletter */}
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1C30', fontFamily: SANS, mb: 1 }}>Newsletter</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#424656', fontFamily: SANS, lineHeight: 1.7, mb: 2.5 }}>
                Stay updated with the latest health tips and platform news.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField placeholder="Your email address" size="small" fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff', fontSize: '0.875rem', fontFamily: SANS, '& fieldset': { borderColor: '#E4E7F0' } } }} />
                <Button sx={{ backgroundColor: TEAL, color: '#fff', minWidth: 48, px: 1.75, borderRadius: '10px', flexShrink: 0, boxShadow: 'none', '&:hover': { backgroundColor: TEAL_D, boxShadow: 'none' } }}>
                  <SendIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ borderTop: '1px solid #E4E7F0', pt: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9B9A97', fontFamily: SANS }}>
              © 2026 MediCore Healthcare. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
