import { useState, type FormEvent } from 'react';
import {
  Box, Button, TextField, Typography, Link, Alert,
  IconButton, InputAdornment, MenuItem, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import BrandingPanel from '../components/BrandingPanel';
import RoleSelector from '../components/RoleSelector';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { C } from '../styles/theme';

type Role = 'patient' | 'doctor';

const specializations = [
  'Cardiology', 'Dermatology', 'General Practice', 'Neurology',
  'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState<Role>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName  = nameParts.slice(1).join(' ') || undefined;

    const extras = role === 'doctor'
      ? { firstName, lastName, licenseNumber: licenseNumber || undefined, specialization: specialization || undefined }
      : { firstName, lastName };

    const result = await register(email, password, role, extras);
    if (result) {
      toast('Account created! Welcome to MediCore.', 'success');
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
    } else {
      const msg = authError ?? 'Registration failed. Please try again.';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <BrandingPanel />

      <Box
        component="section"
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          backgroundColor: C.paper,
          px: { xs: 3, sm: 5, md: 5, lg: 8 },
          py: { xs: 5, md: 6 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: 420, mx: 'auto', width: '100%' }}>

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.3, mb: 0.5 }}>
              Create your account
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>
              Join MediCore — free to get started.
            </Typography>
          </Box>

          <RoleSelector selected={role} onChange={(r) => { setRole(r); setError(null); }} />

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Full Name</Typography>
              <TextField fullWidth placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Email</Typography>
              <TextField fullWidth type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Password</Typography>
              <TextField
                fullWidth type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} size="small" sx={{ color: C.muted }}>
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {role === 'patient' && (
              <>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Date of Birth</Typography>
                  <TextField fullWidth placeholder="DD/MM/YYYY" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Phone Number</Typography>
                  <TextField fullWidth type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </Box>
              </>
            )}

            {role === 'doctor' && (
              <>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>License Number</Typography>
                  <TextField fullWidth placeholder="ML-123456" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Specialization</Typography>
                  <TextField fullWidth select value={specialization} onChange={(e) => setSpecialization(e.target.value)} required>
                    {specializations.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Hospital / Clinic</Typography>
                  <TextField fullWidth placeholder="City General Hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
                </Box>
              </>
            )}

            <Button type="submit" fullWidth variant="contained" size="medium" disabled={loading} sx={{ mt: 0.5 }}>
              {loading ? <CircularProgress size={15} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography sx={{ fontSize: '0.75rem', color: C.muted, textAlign: 'center', mt: 2 }}>
            Already have an account?{' '}
            <Link component="button" type="button" onClick={() => navigate('/login')}
              sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Sign in
            </Link>
          </Typography>

          <Box sx={{ mt: 5, pt: 2.5, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
