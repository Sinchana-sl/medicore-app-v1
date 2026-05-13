import { useState } from 'react';
import {
  Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel,
  IconButton, InputAdornment, Link, TextField, Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sendOtp, verifyOtp } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { C } from '../styles/theme';

type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

const FEATURES = [
  'AI-powered appointment scheduling',
  'Real-time patient queue management',
  'Secure medical records & analytics',
];

const STATS = [
  { value: '50K+',  label: 'Appointments' },
  { value: '1.2K+', label: 'Providers' },
  { value: '98%',   label: 'Satisfaction' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error } = useAuth();

  const [tab, setTab] = useState<LoginTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) {
      toast('Signed in successfully', 'success');
      if (result.role === 'ADMIN_ROLE') navigate('/admin');
      else if (result.role === 'DOCTOR_ROLE') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } else {
      toast(error ?? 'Invalid credentials', 'error');
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail) return;
    setOtpLoading(true); setOtpError(null); setOtpSuccess(null);
    try {
      await sendOtp(otpEmail);
      setOtpStep('code');
      setOtpSuccess(`Code sent to ${otpEmail}`);
    } catch (err: unknown) {
      setOtpError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to send OTP.');
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    setOtpLoading(true); setOtpError(null);
    try {
      const result = await verifyOtp(otpEmail, otpCode);
      if (result.role === 'ADMIN_ROLE') navigate('/admin');
      else if (result.role === 'DOCTOR_ROLE') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err: unknown) {
      setOtpError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Invalid or expired OTP.');
    } finally { setOtpLoading(false); }
  };

  const switchTab = (t: LoginTab) => {
    setTab(t); setOtpStep('email'); setOtpEmail(''); setOtpCode(''); setOtpError(null); setOtpSuccess(null);
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: '0 0 480px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #021F1C 0%, #032B27 20%, #054F49 55%, #076960 80%, #0D9488 100%)',
        }}
      >
        {/* Background: dot grid */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.055,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          pointerEvents: 'none',
        }} />

        {/* Background: large circle top-right */}
        <Box sx={{
          position: 'absolute', top: -120, right: -120,
          width: 420, height: 420, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', top: -30, right: -30,
          width: 220, height: 220, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />

        {/* Background: large medical cross bottom-left (decoration) */}
        <Box sx={{
          position: 'absolute', bottom: -80, left: -60,
          width: 280, height: 280, opacity: 0.04, pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 100 100" fill="white">
            <path d="M38 0H62V38H100V62H62V100H38V62H0V38H38Z"/>
          </svg>
        </Box>

        {/* Background: glow spot */}
        <Box sx={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white"/>
            </svg>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            MediCore
          </Typography>
        </Box>

        {/* Main content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Accent line */}
          <Box sx={{ width: 40, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${C.blueBright}, ${C.blue})`, mb: 3 }} />

          <Typography sx={{
            fontSize: '2.25rem', fontWeight: 800, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-0.035em', mb: 2,
          }}>
            Healthcare<br/>
            management<br/>
            <Box component="span" sx={{ color: C.blueBright }}>made simple.</Box>
          </Typography>

          <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', mb: 4, lineHeight: 1.7, maxWidth: 340 }}>
            Everything your clinic needs to run smoothly — appointments, records, and AI — in one unified platform.
          </Typography>

          {/* Feature bullets */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {FEATURES.map(f => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 17, color: C.blueBright, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                  {f}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', pt: 3, display: 'flex', gap: 0 }}>
            {STATS.map(({ value, label }, i) => (
              <Box key={label} sx={{
                flex: 1,
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                pr: i < STATS.length - 1 ? 3 : 0,
                mr: i < STATS.length - 1 ? 3 : 0,
              }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', mt: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: C.paper,
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: { xs: 3, sm: 5 }, py: 2.5, borderBottom: `1px solid ${C.border}` }}>
          <Typography sx={{ fontSize: '0.8125rem', color: C.muted }}>
            Don&apos;t have an account?{' '}
            <Link component="button" onClick={() => navigate('/register')}
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Sign up free
            </Link>
          </Typography>
        </Box>

        {/* Form area — centered */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 5, md: 6 }, py: 5 }}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.25, mb: 4 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px ${C.blue}40` }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white"/>
                </svg>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: C.ink, letterSpacing: '-0.02em' }}>MediCore</Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.2, mb: 0.75 }}>
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.6 }}>
                Sign in to access your MediCore portal.
              </Typography>
            </Box>

            {/* Tab switcher */}
            <Box sx={{ display: 'flex', gap: 0, mb: 3.5, borderBottom: `2px solid ${C.border}` }}>
              {(['password', 'otp'] as const).map((t) => (
                <Box
                  key={t}
                  component="button"
                  onClick={() => switchTab(t)}
                  sx={{
                    flex: 1, py: 1, px: 0.5,
                    border: 'none', cursor: 'pointer',
                    background: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.8125rem', fontWeight: tab === t ? 700 : 500,
                    color: tab === t ? C.blue : C.muted,
                    borderBottom: `2px solid ${tab === t ? C.blue : 'transparent'}`,
                    marginBottom: '-2px',
                    transition: 'all 0.15s ease',
                    pb: 1.25,
                  }}
                >
                  {t === 'password' ? 'Password' : 'OTP Login'}
                </Box>
              ))}
            </Box>

            {/* Password form */}
            {tab === 'password' && (
              <Box component="form" onSubmit={handlePasswordLogin} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Email address</Typography>
                  <TextField
                    fullWidth type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: C.muted, fontSize: 17 }} /></InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid }}>Password</Typography>
                    <Link component="button" type="button" onClick={() => navigate('/forgot-password')}
                      sx={{ fontSize: '0.8125rem', color: C.blue, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      Forgot password?
                    </Link>
                  </Box>
                  <TextField
                    fullWidth type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: C.muted, fontSize: 17 }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(p => !p)} size="small" sx={{ color: C.muted }}>
                            {showPass ? <VisibilityOffIcon sx={{ fontSize: 17 }} /> : <VisibilityIcon sx={{ fontSize: 17 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -0.5 }}>
                  <FormControlLabel
                    control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" sx={{ color: C.border, '&.Mui-checked': { color: C.blue }, p: 0.5, mr: 0.5 }} />}
                    label={<Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>Stay signed in</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>

                <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 0.5 }}>
                  {loading ? <CircularProgress size={16} color="inherit" /> : 'Sign in'}
                </Button>

                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1, height: 1, backgroundColor: C.border }} />
                  <Typography sx={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500 }}>or continue with</Typography>
                  <Box sx={{ flex: 1, height: 1, backgroundColor: C.border }} />
                </Box>

                {/* Google */}
                <Button fullWidth variant="outlined" size="large"
                  sx={{ gap: 1.5, borderColor: C.border, color: C.inkMid }}
                  startIcon={
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  }>
                  Google
                </Button>
              </Box>
            )}

            {/* OTP form */}
            {tab === 'otp' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {otpError && <Alert severity="error" sx={{ py: 0.5 }}>{otpError}</Alert>}
                {otpSuccess && <Alert severity="success" sx={{ py: 0.5 }}>{otpSuccess}</Alert>}

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Email address</Typography>
                  <TextField
                    fullWidth type="email" placeholder="you@example.com"
                    value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                    disabled={otpStep === 'code'}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: C.muted, fontSize: 17 }} /></InputAdornment> }}
                  />
                </Box>

                {otpStep === 'email' && (
                  <Button fullWidth variant="contained" size="large" disabled={otpLoading || !otpEmail} onClick={handleSendOtp}>
                    {otpLoading ? <CircularProgress size={16} color="inherit" /> : 'Send OTP'}
                  </Button>
                )}

                {otpStep === 'code' && (
                  <>
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>6-digit code</Typography>
                      <TextField
                        fullWidth placeholder="123456"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputProps={{ maxLength: 6, inputMode: 'numeric', style: { letterSpacing: '0.35em', textAlign: 'center', fontSize: '1.125rem' } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon sx={{ color: C.muted, fontSize: 17 }} /></InputAdornment> }}
                      />
                    </Box>
                    <Button fullWidth variant="contained" size="large" disabled={otpLoading || otpCode.length !== 6} onClick={handleVerifyOtp}>
                      {otpLoading ? <CircularProgress size={16} color="inherit" /> : 'Verify & Sign In'}
                    </Button>
                    <Button fullWidth variant="text" size="small" disabled={otpLoading}
                      onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); setOtpSuccess(null); }}>
                      ← Resend code
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: { xs: 3, sm: 5 }, py: 2, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            {['Privacy', 'Terms', 'Support'].map(label => (
              <Link key={label} href="#" sx={{ fontSize: '0.75rem', color: C.muted, textDecoration: 'none', '&:hover': { color: C.slate } }}>
                {label}
              </Link>
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>© 2026 MediCore</Typography>
        </Box>
      </Box>
    </Box>
  );
}
