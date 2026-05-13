import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Link,
  Tab, Tabs, TextField, Typography, InputAdornment,
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
import { COLORS } from '../styles/theme';

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

  const handleTabChange = (_: React.SyntheticEvent, value: LoginTab) => {
    setTab(value);
    setOtpStep('email');
    setOtpEmail('');
    setOtpCode('');
    setOtpError(null);
    setOtpSuccess(null);
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, backgroundColor: COLORS.surface }}
    >
      <BrandingPanel />

      {/* Right — form panel */}
      <Box
        component="section"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#fff',
          px: { xs: 3, sm: 5, md: 5, lg: 10 },
          py: { xs: 5, md: 6 },
          position: 'relative',
        }}
      >
        <Box sx={{ maxWidth: 440, mx: 'auto', width: '100%' }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 5 }}>
            <BrandLogo iconSize="medium" />
          </Box>

          {/* Header */}
          <Box mb={4}>
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, color: COLORS.navy, mb: 1, letterSpacing: '-0.025em' }}
            >
              Welcome back
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Sign in to access your clinical portal.
            </Typography>
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.75, p: 0.75,
              backgroundColor: COLORS.surface,
              borderRadius: 2.5,
              mb: 3.5,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {(['password', 'otp'] as const).map((t) => (
              <Box
                key={t}
                component="button"
                onClick={() => handleTabChange({} as React.SyntheticEvent, t)}
                sx={{
                  flex: 1, py: 1.25, px: 2,
                  border: 'none', cursor: 'pointer',
                  borderRadius: 2, transition: 'all 0.18s',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem', fontWeight: 600,
                  backgroundColor: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? COLORS.primary : COLORS.textSecondary,
                  boxShadow: tab === t ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
                }}
              >
                {t === 'password' ? 'Password' : 'Login with OTP'}
              </Box>
            ))}
          </Box>

          {/* Password tab */}
          {tab === 'password' && (
            <AuthForm onSubmit={handlePasswordLogin} loading={loading} error={error} />
          )}

          {/* OTP tab */}
          {tab === 'otp' && (
            <Box>
              {otpError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>{otpError}</Alert>
              )}
              {otpSuccess && (
                <Alert severity="success" sx={{ mb: 2.5 }}>{otpSuccess}</Alert>
              )}

              <Box mb={2}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textPrimary, mb: 0.75 }}>
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="name@company.com"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={otpStep === 'code'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {otpStep === 'email' && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={otpLoading || !otpEmail}
                  onClick={handleSendOtp}
                  sx={{ height: 52 }}
                >
                  {otpLoading
                    ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><CircularProgress size={18} color="inherit" />Sending…</Box>
                    : 'Send OTP'}
                </Button>
              )}

              {otpStep === 'code' && (
                <>
                  <Box mb={2}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textPrimary, mb: 0.75 }}>
                      6-digit code
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputProps={{ maxLength: 6, inputMode: 'numeric', style: { letterSpacing: '0.3em', fontSize: '1.25rem', textAlign: 'center' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TagIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth variant="contained" size="large"
                    disabled={otpLoading || otpCode.length !== 6}
                    onClick={handleVerifyOtp}
                    sx={{ height: 52, mb: 1.5 }}
                  >
                    {otpLoading
                      ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><CircularProgress size={18} color="inherit" />Verifying…</Box>
                      : 'Verify & Sign In'}
                  </Button>

                  <Button
                    fullWidth variant="text" size="small"
                    disabled={otpLoading}
                    onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); setOtpSuccess(null); }}
                    sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}
                  >
                    ← Resend OTP
                  </Button>
                </>
              )}

              <Typography sx={{ fontSize: '0.875rem', color: COLORS.textSecondary, textAlign: 'center', mt: 3 }}>
                Don&apos;t have an account?{' '}
                <Link
                  component="button"
                  onClick={() => navigate('/register')}
                  underline="none"
                  sx={{
                    fontWeight: 700, color: COLORS.primary,
                    background: 'none', border: 'none', cursor: 'pointer',
                    '&:hover': { color: COLORS.primaryDark },
                    transition: 'color 0.15s',
                  }}
                >
                  Create account
                </Link>
              </Typography>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 6, pt: 2.5, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {['Privacy Policy', 'Terms'].map((label) => (
                <Link
                  key={label} href="#" underline="none"
                  sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 500, '&:hover': { color: COLORS.textSecondary }, transition: 'color 0.15s' }}
                >
                  {label}
                </Link>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 500 }}>
              © 2026 MediCore
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
