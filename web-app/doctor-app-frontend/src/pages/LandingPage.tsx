import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, TextField } from '@mui/material';
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

// ─── Design tokens (matching reference: container-max=1280, margin-desktop=64px, section-gap=120px)
const INTER = "'Inter', system-ui, sans-serif";
const PRIMARY   = '#0D9488'; // teal brand colour
const PRIMARY_D = '#0F766E';

// Matches: max-w-container-max mx-auto px-margin-desktop
const GUTTER: Record<string, string> = { xs: '20px', md: '40px', lg: '64px' };
const MAX_W = 1280;

const glass = {
  background:           'rgba(255,255,255,0.4)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.2)',
} as const;

// ─── Data ──────────────────────────────────────────────────────────────────────
const DOCTORS = [
  { name: 'Dr. Anjali Sharma', role: 'Cardiologist, 12 yrs exp',  rating: 4.9,
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Sarah Chen',    role: 'Pediatrician, 8 yrs exp',   rating: 5.0,
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Michael Ray',   role: 'Dermatologist, 15 yrs exp', rating: 4.8,
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=480&q=80&auto=format&fit=crop' },
  { name: 'Dr. Elena Vance',   role: 'Neurologist, 10 yrs exp',   rating: 4.9,
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=480&q=80&auto=format&fit=crop' },
];

const TESTIMONIALS = [
  { name: 'Alexandra Smith', role: 'Marketing Director', highlight: false,
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80&auto=format&fit=crop',
    text: '"The easiest doctor\'s appointment I\'ve ever booked. Found a specialist, saw their availability, and was booked within minutes. The video call was crystal clear!"' },
  { name: 'David Chen',      role: 'Software Engineer',  highlight: true,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80&auto=format&fit=crop',
    text: '"Being able to see reviews and credentials before booking is a game changer. I felt so much more confident going into my consultation with my specialist."' },
  { name: 'Emma Wilson',     role: 'Graphic Designer',   highlight: false,
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80&auto=format&fit=crop',
    text: '"MediCore saved me so much time. I used to spend hours calling different clinics for an opening. Now I just use the app and it\'s done."' },
];

const FAQS = [
  { q: 'Is my medical data secure?',      a: 'Yes, your privacy is our top priority. We use end-to-end encryption and are fully HIPAA compliant to ensure your personal health information is always protected.' },
  { q: 'How do I cancel an appointment?', a: 'You can cancel or reschedule any appointment through the "My Bookings" section up to 24 hours before the scheduled time at no charge.' },
  { q: 'Do you accept insurance?',        a: 'We partner with most major insurance providers. You can add your insurance details to your profile to see covered practitioners and estimated co-pays.' },
  { q: 'Can I consult doctors online?',   a: 'Absolutely. MediCore supports high-definition video consultations, audio calls, and chat — so you can get care from anywhere, anytime.' },
];

// ─── Inner content wrapper — matches max-w-container-max mx-auto px-margin-desktop
function Inner({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: GUTTER, ...sx }}>
      {children}
    </Box>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ backgroundColor: '#fff', border: '1px solid rgba(194,198,216,0.2)', borderRadius: '16px', p: 3, mb: 2 }}>
      <Box onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: '#0B1C30', fontFamily: INTER }}>
          {q}
        </Typography>
        <ExpandMoreIcon sx={{ color: PRIMARY, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </Box>
      {open && (
        <Typography sx={{ mt: 2, fontSize: '1rem', lineHeight: '1.5rem', color: '#424656', fontFamily: INTER }}>
          {a}
        </Typography>
      )}
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const nav = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#f8f9ff', color: '#0B1C30', fontFamily: INTER, overflowX: 'hidden' }}>

      {/* ── NAV — fixed, glass, h-20 (80px) ─────────────────────────────────── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        height: 80,
        display: 'flex', alignItems: 'center',
      }}>
        <Inner sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeartIcon sx={{ fontSize: 30, color: PRIMARY }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: PRIMARY, fontFamily: INTER }}>MediCore</Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
            {[
              { label: 'Home',          active: true },
              { label: 'Find a Doctor', active: false },
              { label: 'Specialties',   active: false },
              { label: 'How it Works',  active: false },
            ].map(({ label, active }) => (
              <Typography key={label} sx={{
                fontSize: '0.875rem', fontWeight: 500, fontFamily: INTER, cursor: 'pointer',
                color: active ? PRIMARY : '#424656',
                borderBottom: active ? `2px solid ${PRIMARY}` : '2px solid transparent',
                pb: '2px',
                '&:hover': { color: PRIMARY },
                transition: 'color 0.15s',
              }}>
                {label}
              </Typography>
            ))}
          </Box>

          {/* CTA */}
          <Button onClick={() => nav('/login')}
            sx={{ backgroundColor: PRIMARY, color: '#fff', fontFamily: INTER, fontWeight: 500, fontSize: '0.875rem', px: 3, py: 1.25, letterSpacing: '0.01em', textTransform: 'none', borderRadius: '8px', boxShadow: 'none', '&:hover': { backgroundColor: PRIMARY_D, boxShadow: 'none', opacity: 0.9 }, '&:active': { transform: 'scale(0.97)' } }}>
            Book Now
          </Button>
        </Inner>
      </Box>

      {/* ── HERO — pt-40 (160px) pb-section-gap (120px) ─────────────────────── */}
      <Box component="section" sx={{
        position: 'relative', pt: { xs: '120px', md: '160px' }, pb: { xs: '80px', md: '120px' }, overflow: 'hidden',
      }}>
        {/* right gradient blob */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 0, width: '66%', height: '100%', background: `linear-gradient(to left, ${PRIMARY}0D, transparent)`, borderBottomLeftRadius: '200px', pointerEvents: 'none' }} />

        <Inner sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
            {/* Left — copy */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Badge */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, backgroundColor: '#7ed4fd33', color: '#005b78', borderRadius: '9999px', width: 'fit-content' }}>
                  <CheckCircleIcon sx={{ fontSize: '0.875rem' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: INTER, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Trusted by 50,000+ Patients
                  </Typography>
                </Box>

                {/* Headline */}
                <Typography sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, lineHeight: { xs: '3rem', md: '4.5rem' }, letterSpacing: '-0.02em', fontFamily: INTER }}>
                  Your Health,{' '}
                  <Box component="span" sx={{ color: PRIMARY }}>Simplified</Box>
                </Typography>

                {/* Body */}
                <Typography sx={{ fontSize: '1.125rem', lineHeight: '1.75rem', color: '#424656', fontFamily: INTER, maxWidth: 500 }}>
                  Access top-tier medical expertise from the comfort of your home. MediCore connects you with verified specialists instantly.
                </Typography>

                {/* Buttons */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button onClick={() => nav('/login')}
                    sx={{ backgroundColor: PRIMARY, color: '#fff', fontFamily: INTER, fontWeight: 500, fontSize: '0.875rem', px: 4, py: 2, letterSpacing: '0.01em', textTransform: 'none', borderRadius: '8px', boxShadow: `0 4px 24px ${PRIMARY}33`, '&:hover': { backgroundColor: PRIMARY_D, boxShadow: `0 8px 32px ${PRIMARY}55` } }}>
                    Book Appointment
                  </Button>
                  <Button onClick={() => nav('/login')}
                    sx={{ ...glass, color: PRIMARY, fontFamily: INTER, fontWeight: 500, fontSize: '0.875rem', px: 4, py: 2, letterSpacing: '0.01em', textTransform: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { background: 'rgba(255,255,255,0.6)' } }}>
                    How it Works
                  </Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, pt: 1 }}>
                  {[{ v: '500+', l: 'Top Doctors' }, { v: '4.9/5', l: 'User Rating' }, { v: '120k+', l: 'Active Users' }].map(s => (
                    <Box key={s.l}>
                      <Typography sx={{ fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600, color: PRIMARY, fontFamily: INTER }}>{s.v}</Typography>
                      <Typography sx={{ fontSize: '0.875rem', lineHeight: '1.25rem', letterSpacing: '0.01em', color: '#424656', fontFamily: INTER }}>{s.l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right — image + floating cards */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Main doctor image */}
                <Box sx={{ position: 'relative', zIndex: 1, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', lineHeight: 0 }}>
                  <Box component="img"
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=85&auto=format&fit=crop"
                    alt="Professional Doctor"
                    sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                </Box>

                {/* Float card: Quick Booking — bottom left, extends beyond image */}
                <Box sx={{
                  ...glass, position: 'absolute', zIndex: 20,
                  bottom: 48, left: { xs: 12, md: -48 },
                  p: 3, borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  maxWidth: 240,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: `${PRIMARY}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarMonthIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.01em', fontFamily: INTER, lineHeight: 1.3 }}>Quick Booking</Typography>
                      <Typography sx={{ fontSize: '0.625rem', color: '#424656', fontFamily: INTER }}>Next available in 15 mins</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Float card: Joined Patients — top right */}
                <Box sx={{
                  ...glass, position: 'absolute', zIndex: 20,
                  top: 48, right: { xs: 12, md: -32 },
                  p: 3, borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    {/* Overlapping avatars */}
                    <Box sx={{ display: 'flex', mb: 0.5 }}>
                      {[
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
                      ].map((src, i) => (
                        <Box key={i} component="img" src={src} alt="User"
                          sx={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', ml: i > 0 ? -1.5 : 0 }}
                        />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: PRIMARY, fontFamily: INTER }}>Joined Patients</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Inner>
      </Box>

      {/* ── SEARCH BAR — overlaps hero with -mt-20 (-80px) ───────────────────── */}
      <Box component="section" sx={{ position: 'relative', zIndex: 30, mt: { xs: '-40px', md: '-80px' } }}>
        <Inner>
          <Box sx={{
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            p: { xs: 2, md: 4 },
            borderRadius: '24px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
            border: '1px solid rgba(194,198,216,0.2)',
          }}>
            <Grid container spacing={2} alignItems="center">
              {[
                { icon: <PersonSearchIcon sx={{ fontSize: 20, color: '#424656' }} />, placeholder: 'Doctor, Specialty...', type: 'text', border: true },
                { icon: <LocationOnIcon   sx={{ fontSize: 20, color: '#424656' }} />, placeholder: 'Location',             type: 'text', border: true },
                { icon: <EventIcon        sx={{ fontSize: 20, color: '#424656' }} />, placeholder: '',                     type: 'date', border: false },
              ].map((f, i) => (
                <Grid item xs={12} md={3} key={i}>
                  <Box sx={{
                    position: 'relative',
                    borderRight: { md: f.border ? '1px solid rgba(194,198,216,0.3)' : 'none' },
                    pr: { md: f.border ? 2 : 0 },
                  }}>
                    <Box sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                      {f.icon}
                    </Box>
                    <TextField variant="outlined" placeholder={f.placeholder} type={f.type} fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          pl: 4.5, backgroundColor: '#eff4ff', borderRadius: '8px', fontSize: '0.875rem', fontFamily: INTER, color: '#0B1C30',
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: `2px solid ${PRIMARY}33` },
                        },
                        '& input': { py: 1.5 },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12} md={3}>
                <Button fullWidth onClick={() => nav('/login')} startIcon={<SearchIcon />}
                  sx={{ backgroundColor: PRIMARY, color: '#fff', fontFamily: INTER, fontWeight: 500, fontSize: '0.875rem', py: 1.75, borderRadius: '12px', letterSpacing: '0.01em', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: PRIMARY_D, opacity: 0.9, boxShadow: 'none' } }}>
                  Find Doctor
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Inner>
      </Box>

      {/* ── FEATURES — BENTO (py-section-gap = 120px) ───────────────────────── */}
      <Box component="section" sx={{ py: { xs: '80px', md: '120px' } }}>
        <Inner>
          {/* Heading */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: '2rem', md: '2rem' }, fontWeight: 600, lineHeight: '2.5rem', letterSpacing: '-0.01em', fontFamily: INTER, mb: 1.5 }}>
              Why Choose MediCore?
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', lineHeight: '1.75rem', color: '#424656', fontFamily: INTER, maxWidth: '42rem', mx: 'auto' }}>
              We've redesigned the medical appointment experience to be as seamless as ordering a coffee.
            </Typography>
          </Box>

          {/* 3-col bento grid — matches md:grid-cols-3 gap-gutter(24px) */}
          <Grid container spacing={3}>
            {/* Large — md:col-span-2 */}
            <Grid item xs={12} md={8}>
              <Box sx={{ ...glass, p: { xs: 4, md: 5 }, borderRadius: '24px', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,244,255,0.5)', height: '100%' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ width: 56, height: 56, backgroundColor: PRIMARY, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BoltIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem', fontFamily: INTER }}>Instant Booking</Typography>
                  <Typography sx={{ color: '#424656', fontFamily: INTER, lineHeight: 1.6 }}>
                    No more waiting on hold. Book your preferred slot with any specialist in under 60 seconds. Sync directly with your Apple or Google calendar.
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: PRIMARY, fontSize: '0.875rem', fontWeight: 500, fontFamily: INTER, cursor: 'pointer', '&:hover .arrow': { transform: 'translateX(4px)' } }}>
                    Learn more <ArrowForwardIcon className="arrow" sx={{ fontSize: '0.875rem', transition: 'transform 0.2s' }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', lineHeight: 0 }}>
                  <Box component="img"
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop"
                    alt=""
                    sx={{ width: '100%', height: { xs: 200, md: 240 }, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Small */}
            <Grid item xs={12} md={4}>
              <Box sx={{ ...glass, p: { xs: 4, md: 5 }, borderRadius: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ width: 56, height: 56, backgroundColor: '#7ed4fd33', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VerifiedUserIcon sx={{ fontSize: 30, color: '#005b78' }} />
                </Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem', fontFamily: INTER }}>Verified Doctors</Typography>
                <Typography sx={{ color: '#424656', fontFamily: INTER, lineHeight: 1.6 }}>
                  Every practitioner on our platform undergoes a rigorous 5-step background and credential check.
                </Typography>
              </Box>
            </Grid>

            {/* Small */}
            <Grid item xs={12} md={4}>
              <Box sx={{ ...glass, p: { xs: 4, md: 5 }, borderRadius: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ width: 56, height: 56, backgroundColor: '#d3e4fe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SupportAgentIcon sx={{ fontSize: 30, color: PRIMARY }} />
                </Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem', fontFamily: INTER }}>24/7 Support</Typography>
                <Typography sx={{ color: '#424656', fontFamily: INTER, lineHeight: 1.6 }}>
                  Our dedicated patient care team is available around the clock to help with any rescheduling or questions.
                </Typography>
              </Box>
            </Grid>

            {/* Large — md:col-span-2, row-reverse */}
            <Grid item xs={12} md={8}>
              <Box sx={{ ...glass, p: { xs: 4, md: 5 }, borderRadius: '24px', display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: 'center', gap: 4, backgroundColor: 'rgba(211,228,254,0.3)', height: '100%' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ width: 56, height: 56, backgroundColor: '#dae1ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VideocamOutlinedIcon sx={{ fontSize: 30, color: '#001849' }} />
                  </Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem', fontFamily: INTER }}>Virtual Consultations</Typography>
                  <Typography sx={{ color: '#424656', fontFamily: INTER, lineHeight: 1.6 }}>
                    Can't make it to the clinic? Experience high-definition video consultations that feel as personal as an in-office visit.
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: PRIMARY, fontSize: '0.875rem', fontWeight: 500, fontFamily: INTER, cursor: 'pointer', '&:hover .arrow': { transform: 'translateX(4px)' } }}>
                    Explore Telehealth <ArrowForwardIcon className="arrow" sx={{ fontSize: '0.875rem', transition: 'transform 0.2s' }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', lineHeight: 0 }}>
                  <Box component="img"
                    src="https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&q=80&auto=format&fit=crop"
                    alt=""
                    sx={{ width: '100%', height: { xs: 200, md: 240 }, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Inner>
      </Box>

      {/* ── TOP DOCTORS (py-section-gap, bg-surface-container-low/30) ────────── */}
      <Box component="section" sx={{ py: { xs: '80px', md: '120px' }, backgroundColor: 'rgba(239,244,255,0.3)' }}>
        <Inner>
          {/* Header row */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, mb: 6, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2rem' }, fontWeight: 600, lineHeight: '2.5rem', letterSpacing: '-0.01em', fontFamily: INTER }}>
                Top Rated Doctors
              </Typography>
              <Typography sx={{ color: '#424656', fontFamily: INTER }}>Highly specialized professionals with years of experience.</Typography>
            </Box>
            <Box onClick={() => nav('/login')} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: PRIMARY, fontSize: '0.875rem', fontWeight: 500, fontFamily: INTER, cursor: 'pointer', letterSpacing: '0.01em', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } }}>
              View All Doctors <ArrowOutwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* 4-col doctor grid */}
          <Grid container spacing={3}>
            {DOCTORS.map(doc => (
              <Grid item xs={12} sm={6} lg={3} key={doc.name}>
                <Box sx={{
                  backgroundColor: '#fff', borderRadius: '24px', p: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(194,198,216,0.1)',
                  height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-8px)' },
                  '&:hover .doc-img': { transform: 'scale(1.10)' },
                }}>
                  {/* Image with rating badge */}
                  <Box sx={{ position: 'relative', mb: 2, borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <Box component="img" src={doc.img} alt={doc.name} className="doc-img"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.5s' }}
                    />
                    <Box sx={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', px: 1, py: 0.375, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 0.375 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#EAB308', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: INTER }}>{doc.rating}</Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: INTER, mb: 0.375 }}>{doc.name}</Typography>
                  <Typography sx={{ color: PRIMARY, fontSize: '0.75rem', fontWeight: 600, fontFamily: INTER, mb: 2 }}>{doc.role}</Typography>

                  <Button fullWidth onClick={() => nav('/login')}
                    sx={{ mt: 'auto', backgroundColor: '#d3e4fe', color: PRIMARY, fontFamily: INTER, fontWeight: 500, fontSize: '0.875rem', py: 1.5, borderRadius: '12px', letterSpacing: '0.01em', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: PRIMARY, color: '#fff', boxShadow: 'none' }, transition: 'background-color 0.2s, color 0.2s' }}>
                    Book Appointment
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Inner>
      </Box>

      {/* ── TESTIMONIALS (py-section-gap) ────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: '80px', md: '120px' }, overflow: 'hidden' }}>
        <Inner>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: '2rem', md: '2rem' }, fontWeight: 600, lineHeight: '2.5rem', letterSpacing: '-0.01em', fontFamily: INTER, mb: 1.5 }}>
              What Our Patients Say
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', lineHeight: '1.75rem', color: '#424656', fontFamily: INTER }}>
              Real feedback from people who've simplified their healthcare.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {TESTIMONIALS.map(t => (
              <Grid item xs={12} md={4} key={t.name}>
                <Box sx={{
                  ...glass,
                  ...(t.highlight ? { backgroundColor: `${PRIMARY}0D`, border: `1px solid ${PRIMARY}1A` } : {}),
                  p: 4, borderRadius: '24px',
                  height: '100%', display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  {/* Stars */}
                  <Box sx={{ display: 'flex', gap: 0.25, color: '#EAB308' }}>
                    {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 20 }} />)}
                  </Box>

                  <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem', fontStyle: 'italic', color: '#0B1C30', fontFamily: INTER, flex: 1 }}>
                    {t.text}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={t.img} alt={t.name}
                      sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.01em', fontFamily: INTER, lineHeight: 1.3 }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#424656', fontFamily: INTER }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Inner>
      </Box>

      {/* ── APP SHOWCASE (py-section-gap) ────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: '80px', md: '120px' } }}>
        <Inner>
          <Box sx={{
            backgroundColor: PRIMARY, borderRadius: '40px',
            p: { xs: '48px 24px', md: '96px' },
            overflow: 'hidden', position: 'relative',
            color: '#fff',
          }}>
            {/* Blur blob */}
            <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 0, opacity: 0.2, transform: 'translate(25%, -25%)' }}>
              <Box sx={{ width: 600, height: 600, backgroundColor: '#fff', borderRadius: '50%', filter: 'blur(100px)' }} />
            </Box>

            <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} lg={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, lineHeight: { xs: '3rem', md: '4.5rem' }, letterSpacing: '-0.02em', fontFamily: INTER }}>
                    Your Health in Your Pocket
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', lineHeight: '1.75rem', color: 'rgba(255,255,255,0.8)', fontFamily: INTER, maxWidth: 400 }}>
                    Download the MediCore app to manage appointments, access records, and chat with doctors on the go.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {[['Download on the', 'App Store'], ['Get it on', 'Google Play']].map(([sub, label]) => (
                      <Box key={label} sx={{ backgroundColor: '#000', color: '#fff', px: 4, py: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.2s', userSelect: 'none' }}>
                        <PhoneIphoneIcon sx={{ fontSize: 32 }} />
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography sx={{ fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: INTER, letterSpacing: '0.06em', opacity: 0.7 }}>{sub}</Typography>
                          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: INTER, lineHeight: 1 }}>{label}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box component="img"
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=760&q=80&auto=format&fit=crop"
                  alt="Mobile App"
                  sx={{ width: '100%', maxWidth: 400, borderRadius: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', transform: 'rotate(3deg)', display: 'block' }}
                />
              </Grid>
            </Grid>
          </Box>
        </Inner>
      </Box>

      {/* ── FAQ (py-section-gap, max-w-3xl centered) ─────────────────────────── */}
      <Box component="section" sx={{ py: { xs: '80px', md: '120px' } }}>
        <Box sx={{ maxWidth: '48rem', mx: 'auto', px: { xs: '20px', md: '20px' } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: '2rem', md: '2rem' }, fontWeight: 600, lineHeight: '2.5rem', letterSpacing: '-0.01em', fontFamily: INTER }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          <Box>
            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </Box>
        </Box>
      </Box>

      {/* ── FOOTER (py-section-gap, bg-surface, border-t) ───────────────────── */}
      <Box component="footer" sx={{
        py: { xs: '80px', md: '120px' },
        backgroundColor: '#f8f9ff',
        borderTop: '1px solid rgba(194,198,216,0.2)',
      }}>
        <Inner>
          <Grid container spacing={3} sx={{ mb: { xs: 6, md: 10 } }}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonitorHeartIcon sx={{ fontSize: 24, color: PRIMARY }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', fontFamily: INTER }}>MediCore</Typography>
                </Box>
                <Typography sx={{ color: '#424656', fontFamily: INTER, lineHeight: 1.6, maxWidth: 280 }}>
                  Empowering patients with seamless access to high-quality healthcare, anytime, anywhere.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[SendIcon, ArrowOutwardIcon, CheckCircleIcon].map((Icon, i) => (
                    <Box key={i} sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e5eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: PRIMARY, color: '#fff' }, transition: 'all 0.2s' }}>
                      <Icon sx={{ fontSize: 16 }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} md={2}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography sx={{ fontWeight: 700, fontFamily: INTER }}>Quick Links</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Find a Doctor', 'Specialties', 'How it Works'].map(l => (
                    <Typography key={l} component="a" href="#" sx={{ color: '#424656', fontFamily: INTER, fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: PRIMARY, transform: 'translateX(4px)' }, transition: 'color 0.15s, transform 0.15s', display: 'inline-block' }}>{l}</Typography>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Support */}
            <Grid item xs={6} md={2}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography sx={{ fontWeight: 700, fontFamily: INTER }}>Support</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Help Center', 'Privacy Policy', 'Terms of Service'].map(l => (
                    <Typography key={l} component="a" href="#" sx={{ color: '#424656', fontFamily: INTER, fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: PRIMARY, transform: 'translateX(4px)' }, transition: 'color 0.15s, transform 0.15s', display: 'inline-block' }}>{l}</Typography>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Newsletter */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography sx={{ fontWeight: 700, fontFamily: INTER }}>Newsletter</Typography>
                <Typography sx={{ color: '#424656', fontFamily: INTER, fontSize: '0.875rem' }}>
                  Stay updated with the latest health tips and news.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField placeholder="Email" type="email" size="small" fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#eff4ff', borderRadius: '8px', fontSize: '0.875rem', fontFamily: INTER, '& fieldset': { border: 'none' }, '&:hover fieldset': { border: 'none' }, '&.Mui-focused fieldset': { border: `2px solid ${PRIMARY}33` } } }}
                  />
                  <Button sx={{ backgroundColor: PRIMARY, color: '#fff', minWidth: 48, px: 1.5, borderRadius: '8px', flexShrink: 0, boxShadow: 'none', '&:hover': { backgroundColor: PRIMARY_D, boxShadow: 'none' } }}>
                    <SendIcon sx={{ fontSize: 18 }} />
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: { xs: 6, md: 10 }, pt: 4, borderTop: '1px solid rgba(194,198,216,0.1)', textAlign: 'center' }}>
            <Typography sx={{ color: '#424656', fontSize: '0.875rem', fontFamily: INTER }}>
              © 2026 MediCore Healthcare. All rights reserved.
            </Typography>
          </Box>
        </Inner>
      </Box>
    </Box>
  );
}
