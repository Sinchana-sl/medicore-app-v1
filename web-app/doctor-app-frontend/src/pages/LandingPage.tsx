import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Button, TextField, InputAdornment,
  Container, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const P   = '#0D9488';
const PD  = '#0F766E';
const PL  = '#CCFBF1';

const INK    = '#0F172A';
const SLATE  = '#475569';
const MUTED  = '#94A3B8';
const BG     = '#F8FAFF';
const WHITE  = '#FFFFFF';
const BORDER = 'rgba(15,23,42,0.08)';
const SHADOW_SM = '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)';
const SHADOW_MD = '0 4px 16px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)';
const SHADOW_LG = '0 12px 40px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06)';
const FONT  = "'Inter', system-ui, sans-serif";
const R     = '16px';
const R_LG  = '24px';

// ─── Data ───────────────────────────────────────────────────────────────────────
const DOCTORS = [
  { name: 'Dr. Anjali Sharma', specialty: 'Cardiologist', exp: '12 yrs', rating: 4.9,
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop' },
  { name: 'Dr. Sarah Chen',    specialty: 'Pediatrician', exp: '8 yrs',  rating: 5.0,
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop' },
  { name: 'Dr. Michael Ray',   specialty: 'Dermatologist', exp: '15 yrs', rating: 4.8,
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80&auto=format&fit=crop' },
  { name: 'Dr. Elena Vance',   specialty: 'Neurologist', exp: '10 yrs',  rating: 4.9,
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&auto=format&fit=crop' },
];

const FEATURES = [
  { icon: <BoltIcon sx={{ fontSize: 24, color: WHITE }} />, bg: P,
    title: 'Instant Booking', desc: 'Reserve your slot with any specialist in under 60 seconds. No phone calls, no waiting rooms.' },
  { icon: <VerifiedUserIcon sx={{ fontSize: 24, color: P }} />, bg: PL,
    title: 'Verified Doctors', desc: 'Every practitioner undergoes a rigorous 5-step credential and background check.' },
  { icon: <VideocamOutlinedIcon sx={{ fontSize: 24, color: '#6366F1' }} />, bg: '#EEF2FF',
    title: 'Virtual Visits', desc: 'HD video consultations that feel as personal as an in-office visit, from anywhere.' },
  { icon: <SupportAgentIcon sx={{ fontSize: 24, color: '#F59E0B' }} />, bg: '#FFFBEB',
    title: '24/7 Support', desc: 'Our patient care team is available around the clock for rescheduling and questions.' },
  { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 24, color: '#10B981' }} />, bg: '#ECFDF5',
    title: 'Smart Reminders', desc: 'Automated reminders sync to your calendar so you never miss an appointment.' },
  { icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 24, color: '#EC4899' }} />, bg: '#FDF2F8',
    title: 'Reviewed & Rated', desc: 'Real patient reviews help you choose the right doctor with confidence every time.' },
];

const TESTIMONIALS = [
  { name: 'Alexandra Smith', role: 'Marketing Director',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop',
    text: 'The easiest doctor\'s appointment I\'ve ever booked. Found a specialist, saw availability, and was confirmed in minutes. Absolutely brilliant.' },
  { name: 'David Chen', role: 'Software Engineer', highlight: true,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
    text: 'Being able to see reviews and credentials before booking is a game changer. I felt so much more confident going into my consultation.' },
  { name: 'Emma Wilson', role: 'Graphic Designer',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop',
    text: 'MediCore saved me so much time. I used to spend hours calling clinics. Now I just open the app and it\'s done in seconds.' },
];

const FAQS = [
  { q: 'Is my medical data secure?',
    a: 'Yes. We use end-to-end encryption and are fully HIPAA compliant to ensure your personal health information is always protected.' },
  { q: 'How do I cancel an appointment?',
    a: 'Cancel or reschedule through "My Bookings" up to 24 hours before the scheduled time, at no charge.' },
  { q: 'Do you accept insurance?',
    a: 'We partner with most major insurance providers. Add your insurance details to your profile to see covered practitioners and co-pays.' },
  { q: 'Can I get a prescription online?',
    a: 'Yes, licensed physicians can prescribe medications during a virtual consultation, sent directly to your preferred pharmacy.' },
];

const STATS = [
  { icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20, color: P }} />, value: '120k+', label: 'Active Patients' },
  { icon: <VerifiedUserIcon sx={{ fontSize: 20, color: P }} />, value: '500+',  label: 'Verified Doctors' },
  { icon: <StarIcon sx={{ fontSize: 20, color: '#F59E0B' }} />,            value: '4.9',   label: 'Average Rating' },
  { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: P }} />,      value: '< 60s', label: 'Avg. Booking Time' },
];

// ─── Components ─────────────────────────────────────────────────────────────────
function SectionHeading({ tag, title, subtitle }: { tag?: string; title: string; subtitle?: string }) {
  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
      {tag && (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: '12px', py: '4px', backgroundColor: PL, borderRadius: '999px' }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: PD, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
            {tag}
          </Typography>
        </Box>
      )}
      <Typography sx={{ fontSize: { xs: '26px', md: '36px' }, fontWeight: 700, letterSpacing: '-0.025em', color: INK, lineHeight: 1.2, fontFamily: FONT, mb: subtitle ? 2 : 0 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: { xs: '15px', md: '17px' }, color: SLATE, lineHeight: 1.6, fontFamily: FONT, maxWidth: 560, mx: 'auto' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}


// ─── Testimonials ───────────────────────────────────────────────────────────────
function TestimonialsSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 10 }, backgroundColor: BG }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 5, md: 8 }, alignItems: { md: 'center' } }}>

          {/* ── Left: info panel ── */}
          <Box sx={{ flex: '0 0 auto', width: { md: '340px' } }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: '12px', py: '4px', backgroundColor: PL, borderRadius: '999px' }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: PD, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>Patient Stories</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: '26px', md: '32px' }, fontWeight: 700, color: INK, fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 2 }}>
              Loved by<br />thousands
            </Typography>
            <Typography sx={{ fontSize: '15px', color: SLATE, fontFamily: FONT, lineHeight: 1.7, mb: 4 }}>
              Real feedback from patients who've simplified their healthcare journey with MediCore.
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              {[{ v: '4.9', l: 'Avg rating' }, { v: '50k+', l: 'Patients' }].map(s => (
                <Box key={s.l}>
                  <Typography sx={{ fontSize: '26px', fontWeight: 800, color: P, fontFamily: FONT, lineHeight: 1 }}>{s.v}</Typography>
                  <Typography sx={{ fontSize: '12px', color: MUTED, fontFamily: FONT, mt: '4px' }}>{s.l}</Typography>
                </Box>
              ))}
            </Box>

            {/* Avatar stack */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex' }}>
                {TESTIMONIALS.map((t, i) => (
                  <Box key={i} component="img" src={t.img} alt={t.name}
                    sx={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', ml: i > 0 ? '-10px' : 0 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => <StarIcon key={s} sx={{ fontSize: 14, color: '#F59E0B' }} />)}
              </Box>
            </Box>

            {/* Dot nav */}
            <Box sx={{ display: 'flex', gap: 1, mt: 4 }}>
              {TESTIMONIALS.map((_, i) => (
                <Box key={i} onClick={() => setActive(i)} sx={{ width: i === active ? '28px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === active ? P : BORDER, cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </Box>
          </Box>

          {/* ── Right: active testimonial card ── */}
          <Box sx={{ flex: 1 }}>
            {TESTIMONIALS.map((t, i) => (
              <Box key={t.name} sx={{
                display: i === active ? 'flex' : 'none',
                flexDirection: 'column',
                gap: 3,
                backgroundColor: WHITE,
                borderRadius: '24px',
                border: `1px solid ${BORDER}`,
                boxShadow: SHADOW_LG,
                p: { xs: 3.5, md: 5 },
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Teal accent corner */}
                <Box sx={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle at top right, ${P}18, transparent 70%)`, pointerEvents: 'none' }} />

                {/* Quote mark */}
                <Typography sx={{ fontSize: '72px', lineHeight: 0.8, color: P, opacity: 0.15, fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</Typography>

                {/* Stars */}
                <Box sx={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} sx={{ fontSize: 18, color: '#F59E0B' }} />)}
                </Box>

                {/* Text */}
                <Typography sx={{ fontSize: { xs: '16px', md: '19px' }, lineHeight: 1.75, color: INK, fontFamily: FONT }}>
                  "{t.text}"
                </Typography>

                {/* Author */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 2, borderTop: `1px solid ${BORDER}` }}>
                  <Box component="img" src={t.img} alt={t.name}
                    sx={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${P}40` }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '15px', color: INK, fontFamily: FONT }}>{t.name}</Typography>
                    <Typography sx={{ fontSize: '13px', color: MUTED, fontFamily: FONT }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

        </Box>
      </Container>
    </Box>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <Box sx={{ backgroundColor: BG, color: INK, fontFamily: FONT, overflowX: 'hidden' }}>

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '68px',
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center',
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeartIcon sx={{ fontSize: 26, color: P }} />
            <Typography sx={{ fontWeight: 700, fontSize: '20px', color: P, fontFamily: FONT, letterSpacing: '-0.01em' }}>
              MediCore
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '32px' }}>
            {['Find a Doctor', 'Specialties', 'How it Works', 'About'].map(l => (
              <Typography key={l} sx={{ fontSize: '14px', color: SLATE, fontFamily: FONT, cursor: 'pointer', fontWeight: 500, '&:hover': { color: P }, transition: 'color 0.15s' }}>
                {l}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button onClick={() => nav('/login')} variant="text"
              sx={{ color: SLATE, fontFamily: FONT, fontWeight: 500, fontSize: '14px', textTransform: 'none', px: 2, '&:hover': { color: P, backgroundColor: 'transparent' } }}>
              Sign In
            </Button>
            <Button onClick={() => nav('/login')} variant="contained"
              sx={{ backgroundColor: P, color: WHITE, fontFamily: FONT, fontWeight: 600, fontSize: '14px', textTransform: 'none', px: '20px', py: '9px', borderRadius: '10px', boxShadow: 'none', '&:hover': { backgroundColor: PD, boxShadow: 'none' } }}>
              Book Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <Box component="section" sx={{
        pt: { xs: '100px', md: '120px' },
        pb: { xs: '0px', md: '0px' },
        background: 'linear-gradient(160deg, #E8FDF8 0%, #EEF9FF 40%, #F0F4FF 80%, #F8FAFF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <Box sx={{ position: 'absolute', top: '-120px', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: `${P}12`, filter: 'blur(120px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '60px', right: '5%', width: '340px', height: '340px', borderRadius: '50%', background: '#6366F10E', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* Centered text content */}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge */}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: '14px', py: '7px', backgroundColor: WHITE, border: `1px solid ${BORDER}`, borderRadius: '999px', mb: 3, boxShadow: SHADOW_SM }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: P }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: PD, fontFamily: FONT, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Trusted by 50,000+ Patients
            </Typography>
          </Box>

          {/* Headline */}
          <Typography sx={{ fontSize: { xs: '38px', sm: '52px', md: '64px' }, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.035em', color: INK, fontFamily: FONT, mb: 3 }}>
            Your Health,{' '}
            <Box component="span" sx={{ background: `linear-gradient(135deg, ${P} 0%, #0EA5E9 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Simplified
            </Box>
          </Typography>

          {/* Subtext */}
          <Typography sx={{ fontSize: { xs: '16px', md: '18px' }, lineHeight: 1.75, color: SLATE, fontFamily: FONT, maxWidth: '560px', mx: 'auto', mb: 4 }}>
            Book verified specialists in seconds. MediCore connects you with top doctors — online or in-clinic — with zero waiting, zero hassle.
          </Typography>

          {/* CTAs */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button onClick={() => nav('/register')} variant="contained"
              sx={{ backgroundColor: P, color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: '15px', textTransform: 'none', px: '32px', py: '14px', borderRadius: '12px', boxShadow: `0 6px 28px ${P}45`, '&:hover': { backgroundColor: PD, boxShadow: `0 8px 36px ${P}55` } }}>
              Get Started Free
            </Button>
            <Button onClick={() => nav('/login')} variant="outlined"
              sx={{ borderColor: BORDER, color: INK, fontFamily: FONT, fontWeight: 600, fontSize: '15px', textTransform: 'none', px: '32px', py: '14px', borderRadius: '12px', backgroundColor: WHITE, boxShadow: SHADOW_SM, '&:hover': { backgroundColor: BG, borderColor: MUTED } }}>
              Sign In
            </Button>
          </Box>

          {/* Social proof */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ display: 'flex' }}>
              {[
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop',
              ].map((src, i) => (
                <Box key={i} component="img" src={src} alt=""
                  sx={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', ml: i > 0 ? '-10px' : 0, boxShadow: SHADOW_SM }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => <StarIcon key={s} sx={{ fontSize: 15, color: '#F59E0B' }} />)}
            </Box>
            <Typography sx={{ fontSize: '13px', color: SLATE, fontFamily: FONT, fontWeight: 500 }}>
              <Box component="span" sx={{ fontWeight: 700, color: INK }}>4.9</Box> · 120k+ patients
            </Typography>
          </Box>
        </Container>

        {/* Hero image — wide, centered, bleeds into next section */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ position: 'relative', borderRadius: '24px 24px 0 0', overflow: 'hidden', boxShadow: '0 -4px 60px rgba(15,23,42,0.10), 0 24px 80px rgba(15,23,42,0.12)', mx: { xs: 0, sm: 2, md: 4 } }}>
            <Box component="img"
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=85&auto=format&fit=crop"
              alt="Doctor consultation"
              sx={{ width: '100%', aspectRatio: { xs: '4/3', md: '21/9' }, objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
            />
            {/* Bottom fade into next section */}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(248,250,255,0.6), transparent)', pointerEvents: 'none' }} />

            {/* Float card — bottom left */}
            <Box sx={{
              position: 'absolute', bottom: 28, left: 28,
              backgroundColor: WHITE, borderRadius: '16px', p: '13px 18px',
              boxShadow: SHADOW_LG, display: 'flex', alignItems: 'center', gap: '12px',
              border: `1px solid ${BORDER}`,
            }}>
              <Box sx={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${P}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarTodayIcon sx={{ fontSize: 19, color: P }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: INK, fontFamily: FONT, lineHeight: 1.2 }}>Next Available Slot</Typography>
                <Typography sx={{ fontSize: '11px', color: P, fontFamily: FONT, mt: '3px', fontWeight: 600 }}>Today · in 15 minutes</Typography>
              </Box>
            </Box>

            {/* Float card — bottom right */}
            <Box sx={{
              position: 'absolute', bottom: 28, right: 28,
              backgroundColor: WHITE, borderRadius: '16px', p: '13px 18px',
              boxShadow: SHADOW_LG, border: `1px solid ${BORDER}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
                {[1,2,3,4,5].map(s => <StarIcon key={s} sx={{ fontSize: 13, color: '#F59E0B' }} />)}
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: INK, fontFamily: FONT, ml: '2px' }}>4.9</Typography>
              </Box>
              <Typography sx={{ fontSize: '11px', color: SLATE, fontFamily: FONT, fontWeight: 500 }}>500+ verified doctors</Typography>
            </Box>
          </Box>
        </Container>

      </Box>

      {/* ─── SEARCH BAR ──────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ pb: { xs: 5, md: '64px' } }}>
        <Container maxWidth="lg">
          <Box sx={{
            backgroundColor: WHITE,
            borderRadius: R_LG,
            p: { xs: 2, md: '20px' },
            boxShadow: SHADOW_LG,
            border: `1px solid ${BORDER}`,
          }}>
            {/* Desktop: single flex row | Mobile: stacked */}
            <Box sx={{ display: { xs: 'flex', md: 'flex' }, flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: '12px' }, alignItems: { md: 'center' } }}>
              {/* Field 1 */}
              <TextField fullWidth placeholder="Doctor or Specialty..."
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonSearchIcon sx={{ fontSize: 18, color: MUTED }} /></InputAdornment> }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: '48px', borderRadius: '10px', fontSize: '14px', fontFamily: FONT, backgroundColor: BG, '& fieldset': { borderColor: BORDER } } }}
              />

              {/* Divider — desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: '32px', backgroundColor: BORDER, flexShrink: 0 }} />

              {/* Field 2 */}
              <TextField fullWidth placeholder="City or Location"
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: 18, color: MUTED }} /></InputAdornment> }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: '48px', borderRadius: '10px', fontSize: '14px', fontFamily: FONT, backgroundColor: BG, '& fieldset': { borderColor: BORDER } } }}
              />

              {/* Divider — desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: '32px', backgroundColor: BORDER, flexShrink: 0 }} />

              {/* Field 3 — date */}
              <TextField fullWidth type="date"
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon sx={{ fontSize: 18, color: MUTED }} /></InputAdornment> }}
                sx={{ flex: '0 0 auto', width: { xs: '100%', md: '200px' }, '& .MuiOutlinedInput-root': { height: '48px', borderRadius: '10px', fontSize: '14px', fontFamily: FONT, backgroundColor: BG, '& fieldset': { borderColor: BORDER } } }}
              />

              {/* Search button */}
              <Button onClick={() => nav('/login')} startIcon={<SearchIcon />} variant="contained"
                sx={{ flexShrink: 0, width: { xs: '100%', md: '160px' }, height: '48px', backgroundColor: P, color: WHITE, fontFamily: FONT, fontWeight: 600, fontSize: '14px', textTransform: 'none', borderRadius: '10px', boxShadow: 'none', '&:hover': { backgroundColor: PD, boxShadow: 'none' } }}>
                Find Doctor
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── STATS STRIP ─────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 4, md: '40px' }, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, backgroundColor: WHITE }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: { xs: 3, md: 0 } }}>
            {STATS.map((s, i) => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { xs: 0, md: 3 }, borderRight: { md: i < STATS.length - 1 ? `1px solid ${BORDER}` : 'none' } }}>
                {/* Icon badge */}
                <Box sx={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${P}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: { xs: '22px', md: '24px' }, fontWeight: 800, color: INK, fontFamily: FONT, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: MUTED, fontFamily: FONT, fontWeight: 500, mt: '3px' }}>
                    {s.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionHeading tag="Why MediCore" title="Everything you need, in one place" subtitle="We've redesigned the healthcare experience to be as seamless as ordering a coffee." />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {FEATURES.map(f => (
              <Box key={f.title} sx={{
                flex: { md: 1 },
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                minWidth: { md: '120px' },
                maxWidth: { md: '200px' },
                backgroundColor: WHITE,
                borderRadius: R,
                p: 2.5,
                border: `1px solid ${BORDER}`,
                boxShadow: SHADOW_SM,
                display: 'flex', flexDirection: 'column', gap: 1.5,
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: SHADOW_MD, transform: 'translateY(-3px)' },
              }}>
                <Box sx={{ width: '40px', height: '40px', borderRadius: '11px', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.icon}
                </Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: INK, fontFamily: FONT, lineHeight: 1.3 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: '12px', lineHeight: 1.6, color: SLATE, fontFamily: FONT }}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TOP DOCTORS ─────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 7, md: 10 }, backgroundColor: WHITE }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: { xs: 4, md: 6 }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5, px: '12px', py: '4px', backgroundColor: PL, borderRadius: '999px' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: PD, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>Top Rated</Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '26px', md: '32px' }, fontWeight: 700, color: INK, fontFamily: FONT, letterSpacing: '-0.02em' }}>Meet Our Specialists</Typography>
              <Typography sx={{ fontSize: '15px', color: SLATE, fontFamily: FONT, mt: 1 }}>Highly experienced professionals ready to help you.</Typography>
            </Box>
            <Button onClick={() => nav('/login')} endIcon={<ArrowForwardIcon />} variant="text"
              sx={{ color: P, fontFamily: FONT, fontWeight: 600, fontSize: '14px', textTransform: 'none', flexShrink: 0, '&:hover': { backgroundColor: `${P}0A` } }}>
              View All Doctors
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            {DOCTORS.map(doc => (
              <Box key={doc.name} sx={{
                flex: { md: 1 },
                width: { xs: '100%', sm: 'calc(50% - 10px)' },
                minWidth: { md: '0' },
                backgroundColor: WHITE,
                borderRadius: R,
                border: `1px solid ${BORDER}`,
                boxShadow: SHADOW_SM,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: SHADOW_LG, transform: 'translateY(-4px)' },
                '&:hover .doc-img': { transform: 'scale(1.05)' },
              }}>
                {/* Image */}
                <Box sx={{ overflow: 'hidden', lineHeight: 0 }}>
                  <Box component="img" src={doc.img} alt={doc.name} className="doc-img"
                    sx={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.4s ease' }}
                  />
                </Box>
                {/* Info */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '14px', color: INK, fontFamily: FONT, lineHeight: 1.3 }}>{doc.name}</Typography>
                    <Typography sx={{ fontSize: '12px', color: P, fontFamily: FONT, fontWeight: 600, mt: '3px' }}>{doc.specialty} · {doc.exp}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: INK, fontFamily: FONT }}>{doc.rating}</Typography>
                    <Typography sx={{ fontSize: '11px', color: MUTED, fontFamily: FONT }}>· Highly rated</Typography>
                  </Box>
                  <Button fullWidth onClick={() => nav('/login')} variant="outlined"
                    sx={{ mt: 'auto', borderColor: `${P}40`, color: P, fontFamily: FONT, fontWeight: 600, fontSize: '12px', textTransform: 'none', borderRadius: '8px', py: '6px', boxShadow: 'none', '&:hover': { backgroundColor: P, color: WHITE, borderColor: P } }}>
                    Book Appointment
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TESTIMONIALS — sliding carousel ─────────────────────────────────── */}
      <TestimonialsSlider />

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 7, md: 10 }, backgroundColor: WHITE }}>
        <Container maxWidth="lg">
          <SectionHeading tag="How it Works" title="Book a doctor in 3 easy steps" subtitle="From search to consultation in under 60 seconds — no calls, no queues." />

          {/* ── Process row with connectors ── */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-start' }, gap: { xs: 4, md: 0 } }}>
            {[
              {
                step: '01',
                icon: <PersonSearchIcon sx={{ fontSize: 26, color: P }} />,
                iconBg: `${P}12`,
                title: 'Find Your Doctor',
                desc: 'Search by specialty, location, or availability. Browse verified profiles with real reviews.',
              },
              {
                step: '02',
                icon: <CalendarTodayIcon sx={{ fontSize: 26, color: '#6366F1' }} />,
                iconBg: '#EEF2FF',
                title: 'Book Your Slot',
                desc: 'Pick a date and time — in-person or virtual. Instant confirmation with calendar sync.',
              },
              {
                step: '03',
                icon: <CheckCircleIcon sx={{ fontSize: 26, color: '#10B981' }} />,
                iconBg: '#ECFDF5',
                title: 'Get Consultation',
                desc: 'Meet your doctor online or at the clinic. Receive prescriptions and follow-ups in one place.',
              },
            ].map((item, i) => (
              <Box key={item.step} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { md: 'center' }, flex: 1, position: 'relative' }}>

                {/* Card */}
                <Box sx={{
                  flex: 1,
                  backgroundColor: BG,
                  borderRadius: R_LG,
                  border: `1px solid ${BORDER}`,
                  p: 3,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  textAlign: { md: 'center' },
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': { boxShadow: SHADOW_LG, transform: 'translateY(-4px)' },
                  mx: { md: 1.5 },
                }}>
                  {/* Step badge + icon */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center', gap: 1.5, justifyContent: { md: 'center' } }}>
                    {/* Numbered circle */}
                    <Box sx={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 800, color: WHITE, fontFamily: FONT }}>{item.step}</Typography>
                    </Box>
                    {/* Icon badge */}
                    <Box sx={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: INK, fontFamily: FONT, mb: '6px' }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '13px', lineHeight: 1.7, color: SLATE, fontFamily: FONT }}>{item.desc}</Typography>
                  </Box>
                </Box>

                {/* Connector — between cards, desktop only */}
                {i < 2 && (
                  <Box sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    position: 'absolute',
                    top: '48px',
                    right: { md: '-28px' },
                    zIndex: 2,
                  }}>
                    {/* Dashed line + arrow */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <Box sx={{ width: '28px', height: '2px', background: `repeating-linear-gradient(90deg, ${P} 0px, ${P} 6px, transparent 6px, transparent 12px)` }} />
                      <Box sx={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid ${P}` }} />
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Bottom CTA */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button onClick={() => nav('/register')} variant="contained"
              sx={{ backgroundColor: P, color: WHITE, fontFamily: FONT, fontWeight: 600, fontSize: '15px', textTransform: 'none', px: '36px', py: '13px', borderRadius: '12px', boxShadow: `0 4px 20px ${P}40`, '&:hover': { backgroundColor: PD, boxShadow: `0 6px 24px ${P}55` } }}>
              Get Started — It's Free
            </Button>
            <Typography sx={{ mt: 1.5, fontSize: '13px', color: MUTED, fontFamily: FONT }}>No credit card required · Cancel anytime</Typography>
          </Box>
        </Container>
      </Box>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 7, md: 10 }, backgroundColor: BG }}>
        <Container maxWidth="lg">
          <SectionHeading tag="FAQ" title="Frequently asked questions" subtitle="Have questions? We've got answers." />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: '800px', mx: 'auto' }}>
            {FAQS.map((f, i) => (
              <Accordion key={f.q} defaultExpanded={i === 0} disableGutters elevation={0}
                sx={{ backgroundColor: WHITE, border: `1px solid ${BORDER}`, borderRadius: `${R} !important`, overflow: 'hidden', '&:before': { display: 'none' }, '&.Mui-expanded': { boxShadow: SHADOW_MD } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: P }} />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '15px', color: INK, fontFamily: FONT, py: '4px' }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: '20px' }}>
                  <Typography sx={{ fontSize: '14px', lineHeight: 1.7, color: SLATE, fontFamily: FONT }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <Box component="footer" sx={{ backgroundColor: WHITE, borderTop: `1px solid ${BORDER}`, pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          {/* Columns row — pure flex, no negative Grid margins */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 5, md: '48px' } }}>

            {/* Brand — wider */}
            <Box sx={{ flex: '0 0 auto', width: { md: '280px' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonitorHeartIcon sx={{ fontSize: 24, color: P }} />
                <Typography sx={{ fontWeight: 700, fontSize: '18px', color: INK, fontFamily: FONT }}>MediCore</Typography>
              </Box>
              <Typography sx={{ fontSize: '14px', lineHeight: 1.7, color: SLATE, fontFamily: FONT }}>
                Empowering patients with seamless access to high-quality healthcare, anytime, anywhere.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[TwitterIcon, LinkedInIcon, MailOutlinedIcon].map((Icon, i) => (
                  <Box key={i} sx={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: `${P}10`, borderColor: `${P}30` }, transition: 'all 0.15s' }}>
                    <Icon sx={{ fontSize: 17, color: SLATE }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Spacer */}
            <Box sx={{ flex: 1 }} />

            {/* Product links */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: INK, fontFamily: FONT, mb: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Product</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Find a Doctor', 'Specialties', 'How it Works', 'Pricing'].map(l => (
                  <Typography key={l} component="a" href="#" sx={{ fontSize: '14px', color: SLATE, fontFamily: FONT, textDecoration: 'none', '&:hover': { color: P }, transition: 'color 0.15s' }}>{l}</Typography>
                ))}
              </Box>
            </Box>

            {/* Support links */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: INK, fontFamily: FONT, mb: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Support</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
                  <Typography key={l} component="a" href="#" sx={{ fontSize: '14px', color: SLATE, fontFamily: FONT, textDecoration: 'none', '&:hover': { color: P }, transition: 'color 0.15s' }}>{l}</Typography>
                ))}
              </Box>
            </Box>

            {/* Newsletter */}
            <Box sx={{ flex: '0 0 auto', width: { md: '260px' } }}>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: INK, fontFamily: FONT, mb: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Stay Updated</Typography>
              <Typography sx={{ fontSize: '14px', color: SLATE, fontFamily: FONT, mb: 2, lineHeight: 1.6 }}>
                Get health tips and platform news in your inbox.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" size="small" fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '14px', fontFamily: FONT, backgroundColor: BG, '& fieldset': { borderColor: BORDER } } }}
                />
                <Button sx={{ backgroundColor: P, color: WHITE, minWidth: '42px', px: 1.5, borderRadius: '10px', flexShrink: 0, boxShadow: 'none', '&:hover': { backgroundColor: PD, boxShadow: 'none' } }}>
                  <SendIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Bottom bar */}
          <Box sx={{ mt: { xs: 5, md: 6 }, pt: 3, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '13px', color: MUTED, fontFamily: FONT }}>
              © 2026 MediCore Healthcare. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy', 'Terms', 'Cookies'].map(l => (
                <Typography key={l} component="a" href="#" sx={{ fontSize: '13px', color: MUTED, fontFamily: FONT, textDecoration: 'none', '&:hover': { color: P } }}>{l}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
