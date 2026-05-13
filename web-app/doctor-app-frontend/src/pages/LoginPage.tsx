import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Link,
  Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import BrandingPanel from '../components/BrandingPanel';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { sendOtp, verifyOtp } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error } = useAuth();

  const [tab, setTab] = useState<LoginTab>('password');

  // OTP state
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
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <BrandingPanel />

      <Box
        component="section"
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          backgroundColor: 'background.paper',
          px: { xs: 2, md: 4, lg: 12 },
          py: 4,
        }}
      >
        <Box sx={{ maxWidth: 448, mx: 'auto', width: '100%' }}>
          {/* Mobile branding */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
            <BrandLogo color="#1a365d" />
          </Box>

          <Box mb={3}>
            <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 1 }}>
              Welcome back
            </Typography>
            <Typography color="text.secondary">
              Please enter your details to access your Clinical Portal.
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Password" value="password" />
            <Tab label="Login with OTP" value="otp" />
          </Tabs>

          {tab === 'password' && (
            <AuthForm onSubmit={handlePasswordLogin} loading={loading} error={error} />
          )}

          {tab === 'otp' && (
            <Box>
              {otpError && <Alert severity="error" sx={{ mb: 2 }}>{otpError}</Alert>}
              {otpSuccess && <Alert severity="success" sx={{ mb: 2 }}>{otpSuccess}</Alert>}

              <TextField
                fullWidth
                label="Work Email Address"
                type="email"
                placeholder="name@company.com"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                disabled={otpStep === 'code'}
                sx={{ mb: 2 }}
              />

              {otpStep === 'email' && (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={otpLoading || !otpEmail}
                  onClick={handleSendOtp}
                  sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
                >
                  {otpLoading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
                </Button>
              )}

              {otpStep === 'code' && (
                <>
                  <TextField
                    fullWidth
                    label="Enter 6-digit OTP"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={otpLoading || otpCode.length !== 6}
                    onClick={handleVerifyOtp}
                    sx={{ height: 52, mb: 1.5, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
                  >
                    {otpLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Sign In'}
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    size="small"
                    disabled={otpLoading}
                    onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); setOtpSuccess(null); }}
                  >
                    Resend OTP
                  </Button>
                </>
              )}

              <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
                Don&apos;t have an account?{' '}
                <Link
                  component="button"
                  onClick={() => navigate('/register')}
                  underline="hover"
                  sx={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          )}

          {/* Footer */}
          <Box
            sx={{
              mt: 6, pt: 2, borderTop: '1px solid', borderColor: 'grey.100',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              {['Privacy Policy', 'Terms of Service'].map((label) => (
                <Link key={label} href="#" underline="hover" sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
                  {label}
                </Link>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>© 2024 MediConnect</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
