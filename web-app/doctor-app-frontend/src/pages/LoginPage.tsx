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
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sendOtp, verifyOtp } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { C } from '../styles/theme';

type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

const STATS = [
  { value: '50K+', label: 'Appointments' },
  { value: '1.2K+', label: 'Providers' },
  { value: '98%', label: 'Satisfaction' },
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
          flex: '0 0 500px',
          flexDirection: 'column',
          p: '48px 56px',
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
            Healthcare Platform
          </Typography>

          <Typography sx={{
            fontSize: '2.75rem', fontWeight: 900, color: '#fff',
            lineHeight: 1.08, letterSpacing: '-0.05em', mb: 3,
          }}>
            Better care,<br />
            every single<br />
            <Box component="span" sx={{ color: '#2DD4BF' }}>day.</Box>
          </Typography>

          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, maxWidth: 340 }}>
            The all-in-one platform for appointments, records, payments, and AI-powered insights.
          </Typography>

          {/* Divider */}
          <Box sx={{ my: 4, width: 48, height: 2, borderRadius: 99, background: 'linear-gradient(90deg, #2DD4BF, transparent)' }} />

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            {STATS.map(({ value, label }) => (
              <Box key={label}>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', mt: 0.5, fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Bottom label ── */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#2DD4BF', boxShadow: '0 0 8px #2DD4BF' }} />
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            Trusted by 1,200+ healthcare providers
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAF9' }}>

        {/* Top bar */}
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          px: { xs: 3, sm: 5 }, py: 2.5,
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: '#fff',
        }}>
          <Typography sx={{ fontSize: '0.8125rem', color: C.muted }}>
            Don&apos;t have an account?{' '}
            <Link component="button" onClick={() => navigate('/register')}
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Sign up free →
            </Link>
          </Typography>
        </Box>

        {/* Form area */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 5, md: 6 }, py: 6 }}>
          <Box sx={{ width: '100%', maxWidth: 440 }}>

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.25, mb: 5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${C.blue}40` }}>
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                  <path d="M6 1H8V5H12V7H8V13H6V7H2V5H6V1Z" fill="white"/>
                </svg>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: C.ink, letterSpacing: '-0.02em' }}>MediCore</Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: C.slate, lineHeight: 1.6 }}>
                Sign in to your MediCore account.
              </Typography>
            </Box>

            {/* Tab switcher — segmented control */}
            <Box sx={{
              display: 'flex', mb: 4,
              p: '5px',
              backgroundColor: C.surface,
              borderRadius: '12px',
              border: `1px solid ${C.border}`,
            }}>
              {(['password', 'otp'] as const).map((t) => (
                <Box
                  key={t}
                  component="button"
                  onClick={() => switchTab(t)}
                  sx={{
                    flex: 1, py: 1, px: 2,
                    border: 'none', cursor: 'pointer',
                    borderRadius: '8px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: tab === t ? C.ink : C.muted,
                    backgroundColor: tab === t ? '#fff' : 'transparent',
                    boxShadow: tab === t ? '0 1px 3px rgba(55,53,47,0.1), 0 0 0 1px rgba(55,53,47,0.04)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t === 'password' ? 'Password Login' : 'Email OTP'}
                </Box>
              ))}
            </Box>

            {/* Password form */}
            {tab === 'password' && (
              <Box component="form" onSubmit={handlePasswordLogin} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {error && <Alert severity="error">{error}</Alert>}

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 1 }}>Email address</Typography>
                  <TextField
                    fullWidth type="email" placeholder="you@example.com" size="medium"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    sx={{ '& .MuiOutlinedInput-root': { height: 48, backgroundColor: '#fff' } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: C.muted, fontSize: 18 }} /></InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid }}>Password</Typography>
                    <Link component="button" type="button" onClick={() => navigate('/forgot-password')}
                      sx={{ fontSize: '0.8125rem', color: C.blue, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      Forgot password?
                    </Link>
                  </Box>
                  <TextField
                    fullWidth type={showPass ? 'text' : 'password'} placeholder="Your password" size="medium"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    sx={{ '& .MuiOutlinedInput-root': { height: 48, backgroundColor: '#fff' } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: C.muted, fontSize: 18 }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(p => !p)} size="small" sx={{ color: C.muted }}>
                            {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" sx={{ color: C.border, '&.Mui-checked': { color: C.blue }, p: 0.5, mr: 0.5 }} />}
                  label={<Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>Stay signed in</Typography>}
                  sx={{ m: 0, mt: -1 }}
                />

                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{
                    height: 50, borderRadius: '12px',
                    fontSize: '0.9375rem', fontWeight: 700,
                    background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                    boxShadow: `0 4px 16px ${C.blue}35`,
                    '&:hover': { background: `linear-gradient(135deg, ${C.blueDark} 0%, #0B5E57 100%)`, boxShadow: `0 6px 20px ${C.blue}45` },
                    '&:disabled': { opacity: 0.6, background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)` },
                  }}
                >
                  {loading ? <CircularProgress size={18} color="inherit" /> : 'Sign in'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1, height: 1, backgroundColor: C.border }} />
                  <Typography sx={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500 }}>or</Typography>
                  <Box sx={{ flex: 1, height: 1, backgroundColor: C.border }} />
                </Box>

                <Button
                  fullWidth variant="outlined" size="large"
                  sx={{
                    height: 48, gap: 1.5, borderColor: C.border,
                    color: C.inkMid, borderRadius: '12px',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: C.surface, borderColor: C.subtle },
                  }}
                  startIcon={
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 13, color: C.muted }} />
                  <Typography sx={{ fontSize: '0.6875rem', color: C.muted }}>
                    256-bit SSL encryption · HIPAA compliant
                  </Typography>
                </Box>
              </Box>
            )}

            {/* OTP form */}
            {tab === 'otp' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {otpError && <Alert severity="error">{otpError}</Alert>}
                {otpSuccess && <Alert severity="success">{otpSuccess}</Alert>}

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 1 }}>Email address</Typography>
                  <TextField
                    fullWidth type="email" placeholder="you@example.com" size="medium"
                    value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                    disabled={otpStep === 'code'}
                    sx={{ '& .MuiOutlinedInput-root': { height: 48, backgroundColor: '#fff' } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: C.muted, fontSize: 18 }} /></InputAdornment> }}
                  />
                </Box>

                {otpStep === 'email' && (
                  <Button
                    fullWidth variant="contained" disabled={otpLoading || !otpEmail}
                    onClick={handleSendOtp}
                    sx={{
                      height: 50, borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700,
                      background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                      boxShadow: `0 4px 16px ${C.blue}35`,
                      '&:hover': { background: `linear-gradient(135deg, ${C.blueDark} 0%, #0B5E57 100%)` },
                      '&:disabled': { opacity: 0.6, background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)` },
                    }}
                  >
                    {otpLoading ? <CircularProgress size={18} color="inherit" /> : 'Send verification code'}
                  </Button>
                )}

                {otpStep === 'code' && (
                  <>
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 1 }}>6-digit verification code</Typography>
                      <TextField
                        fullWidth placeholder="000000" size="medium"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputProps={{ maxLength: 6, inputMode: 'numeric', style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 } }}
                        sx={{ '& .MuiOutlinedInput-root': { height: 56, backgroundColor: '#fff' } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon sx={{ color: C.muted, fontSize: 18 }} /></InputAdornment> }}
                      />
                    </Box>
                    <Button
                      fullWidth variant="contained" disabled={otpLoading || otpCode.length !== 6}
                      onClick={handleVerifyOtp}
                      sx={{
                        height: 50, borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700,
                        background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                        boxShadow: `0 4px 16px ${C.blue}35`,
                        '&:hover': { background: `linear-gradient(135deg, ${C.blueDark} 0%, #0B5E57 100%)` },
                        '&:disabled': { opacity: 0.6, background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)` },
                      }}
                    >
                      {otpLoading ? <CircularProgress size={18} color="inherit" /> : 'Verify & Sign In'}
                    </Button>
                    <Button fullWidth variant="text" size="small" disabled={otpLoading}
                      onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); setOtpSuccess(null); }}
                      sx={{ color: C.blue, fontWeight: 600 }}>
                      ← Resend code
                    </Button>
                  </>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 13, color: C.muted }} />
                  <Typography sx={{ fontSize: '0.6875rem', color: C.muted }}>
                    256-bit SSL encryption · HIPAA compliant
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: { xs: 3, sm: 5 }, py: 2.5, borderTop: `1px solid ${C.border}`, backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
