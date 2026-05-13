import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Link,
  TextField, Typography, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import TagIcon from '@mui/icons-material/Tag';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import BrandingPanel from '../components/BrandingPanel';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { sendOtp, verifyOtp } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { C } from '../styles/theme';

type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error } = useAuth();

  const [tab, setTab] = useState<LoginTab>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const handlePasswordLogin = async (data: { email: string; password: string }) => {
    const result = await login(data.email, data.password);
    if (result) {
      toast('Signed in successfully', 'success');
      if (result.role === 'ADMIN_ROLE') navigate('/admin');
      else if (result.role === 'DOCTOR_ROLE') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } else {
      toast(error ?? 'Invalid email or password', 'error');
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail) return;
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      await sendOtp(otpEmail);
      setOtpStep('code');
      setOtpSuccess(`A 6-digit code was sent to ${otpEmail}`);
      toast(`OTP sent to ${otpEmail}`, 'info');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string; message?: string } } })
        ?.response?.data?.detail
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to send OTP. Please try again.';
      setOtpError(msg);
      toast(msg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const result = await verifyOtp(otpEmail, otpCode);
      if (result.role === 'ADMIN_ROLE') navigate('/admin');
      else if (result.role === 'DOCTOR_ROLE') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string; message?: string } } })
        ?.response?.data?.detail
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Invalid or expired OTP.';
      setOtpError(msg);
      toast(msg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const switchTab = (t: LoginTab) => {
    setTab(t);
    setOtpStep('email');
    setOtpEmail('');
    setOtpCode('');
    setOtpError(null);
    setOtpSuccess(null);
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, backgroundColor: C.surface }}>
      <BrandingPanel />

      <Box
        component="section"
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          backgroundColor: C.paper,
          px: { xs: 3, sm: 5, md: 5, lg: 10 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
            <BrandLogo iconSize="medium" />
          </Box>

          <Box mb={3}>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.3, mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>
              Sign in to access your clinical portal.
            </Typography>
          </Box>

          {/* Tab switcher */}
          <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, backgroundColor: C.surface, borderRadius: 8, mb: 3, border: `1px solid ${C.border}` }}>
            {(['password', 'otp'] as const).map((t) => (
              <Box
                key={t}
                component="button"
                onClick={() => switchTab(t)}
                sx={{
                  flex: 1, py: 1, px: 1.5,
                  border: 'none', cursor: 'pointer', borderRadius: 7,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8125rem', fontWeight: 500,
                  backgroundColor: tab === t ? C.paper : 'transparent',
                  color: tab === t ? C.ink : C.slate,
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'password' ? 'Password' : 'OTP'}
              </Box>
            ))}
          </Box>

          {tab === 'password' && (
            <AuthForm onSubmit={handlePasswordLogin} loading={loading} error={error} />
          )}

          {tab === 'otp' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {otpError && <Alert severity="error">{otpError}</Alert>}
              {otpSuccess && <Alert severity="success">{otpSuccess}</Alert>}

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.slate, mb: 0.5 }}>Email address</Typography>
                <TextField
                  fullWidth type="email" placeholder="you@example.com"
                  value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={otpStep === 'code'}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: C.muted, fontSize: 16 }} /></InputAdornment> }}
                />
              </Box>

              {otpStep === 'email' && (
                <Button fullWidth variant="contained" size="medium" disabled={otpLoading || !otpEmail} onClick={handleSendOtp} sx={{ mt: 0.5, height: 38 }}>
                  {otpLoading ? <CircularProgress size={15} color="inherit" /> : 'Send OTP'}
                </Button>
              )}

              {otpStep === 'code' && (
                <>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.slate, mb: 0.5 }}>6-digit code</Typography>
                    <TextField
                      fullWidth placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputProps={{ maxLength: 6, inputMode: 'numeric', style: { letterSpacing: '0.25em', textAlign: 'center' } }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon sx={{ color: C.muted, fontSize: 16 }} /></InputAdornment> }}
                    />
                  </Box>
                  <Button fullWidth variant="contained" size="medium" disabled={otpLoading || otpCode.length !== 6} onClick={handleVerifyOtp} sx={{ mt: 0.5, height: 38 }}>
                    {otpLoading ? <CircularProgress size={15} color="inherit" /> : 'Verify & Sign In'}
                  </Button>
                  <Button fullWidth variant="text" size="small" disabled={otpLoading} onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); setOtpSuccess(null); }}
                    sx={{ color: C.slate, fontSize: '0.75rem' }}>
                    ← Resend OTP
                  </Button>
                </>
              )}

              <Typography sx={{ fontSize: '0.75rem', color: C.slate, textAlign: 'center', mt: 0.5 }}>
                No account?{' '}
                <Link component="button" type="button" onClick={() => navigate('/register')}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Create one
                </Link>
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 5, pt: 2.5, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {['Privacy', 'Terms'].map((label) => (
                <Link key={label} href="#" sx={{ fontSize: '0.6875rem', color: C.muted, textDecoration: 'none', '&:hover': { color: C.slate } }}>
                  {label}
                </Link>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.6875rem', color: C.muted }}>© 2026 MediCore</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
