import { useState, type FormEvent } from 'react';
import { Box, Button, TextField, Typography, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BrandingPanel from '../components/BrandingPanel';
import BrandLogo from '../components/BrandLogo';
import { sendPasswordResetOtp, resetPassword } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetOtp(email);
      setStep('otp');
      toast(`Verification code sent to ${email}`, 'info');
    } catch (err: unknown) {
      const msg = extractError(err, 'Failed to send code. Please try again.');
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setStep('reset');
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep('done');
      toast('Password reset successfully!', 'success');
    } catch (err: unknown) {
      const msg = extractError(err, 'Failed to reset password. Please try again.');
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const extractError = (err: unknown, fallback: string): string => {
    const e = err as { response?: { data?: { detail?: string; message?: string } } };
    return e?.response?.data?.detail ?? e?.response?.data?.message ?? fallback;
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
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
            <BrandLogo color="#1a365d" />
          </Box>

          {/* Step: Email */}
          {step === 'email' && (
            <>
              <Box mb={4}>
                <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 1 }}>
                  Forgot password?
                </Typography>
                <Typography color="text.secondary">
                  Enter your registered email and we'll send you a verification code.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleEmailSubmit} noValidate>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  fullWidth label="Email Address" type="email" placeholder="name@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required sx={{ mb: 3, mt: 2 }}
                />
                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
                >
                  {loading ? 'Sending…' : 'Send Verification Code'}
                </Button>
              </Box>
            </>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <>
              <Box mb={4}>
                <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 1 }}>
                  Enter verification code
                </Typography>
                <Typography color="text.secondary">
                  We sent a code to <strong>{email}</strong>. Please check your inbox.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleOtpSubmit} noValidate>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  fullWidth label="Verification Code" placeholder="e.g. 123456"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                  required sx={{ mb: 3 }}
                  inputProps={{ maxLength: 6 }}
                />
                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
                >
                  {loading ? 'Verifying…' : 'Verify Code'}
                </Button>
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  Didn't receive a code?{' '}
                  <Link
                    component="button" onClick={() => { setStep('email'); setOtp(''); }}
                    color="secondary" fontWeight={600} underline="hover"
                    sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Resend
                  </Link>
                </Typography>
              </Box>
            </>
          )}

          {/* Step: Reset Password */}
          {step === 'reset' && (
            <>
              <Box mb={4}>
                <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 1 }}>
                  Set new password
                </Typography>
                <Typography color="text.secondary">
                  Your new password must be at least 8 characters.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleResetSubmit} noValidate>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  fullWidth label="New Password" type="password" placeholder="Min. 8 characters"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  required sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth label="Confirm Password" type="password" placeholder="Re-enter password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  required sx={{ mb: 3 }}
                />
                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
                >
                  {loading ? 'Updating…' : 'Reset Password'}
                </Button>
              </Box>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <Box textAlign="center">
              <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 2 }}>
                Password reset!
              </Typography>
              <Typography color="text.secondary" mb={4}>
                Your password has been updated successfully. You can now sign in.
              </Typography>
              <Button
                fullWidth variant="contained"
                onClick={() => navigate('/login')}
                sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
              >
                Back to Sign In
              </Button>
            </Box>
          )}

          {step !== 'done' && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
              <Link
                component="button" onClick={() => navigate('/login')}
                color="secondary" fontWeight={600} underline="hover"
                sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ← Back to Sign In
              </Link>
            </Typography>
          )}

          <Box
            sx={{
              mt: 6, pt: 2, borderTop: '1px solid', borderColor: 'grey.100',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Box display="flex" gap={2}>
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
