import { useState, type FormEvent } from 'react';
import {
  Box, Button, TextField, Typography, Link, Alert,
  IconButton, InputAdornment, MenuItem, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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

const fieldSx = { '& .MuiOutlinedInput-root': { height: 48, backgroundColor: '#fff' } };
const labelSx = { fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 1 };

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
    <Box component="main" sx={{ height: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
      <BrandingPanel />

      <Box component="section" sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAF9', overflow: 'hidden' }}>

        {/* Top bar — same as login */}
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          px: { xs: 3, sm: 5 }, py: 2.5,
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: '#fff',
          flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: '0.8125rem', color: C.muted }}>
            Already have an account?{' '}
            <Link component="button" onClick={() => navigate('/login')}
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Sign in →
            </Link>
          </Typography>
        </Box>

        {/* Form — centered, no overflow */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 5, md: 6 }, py: 4, overflow: 'hidden' }}>
          <Box sx={{ width: '100%', maxWidth: 440 }}>

            {/* Heading — same size as login */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 1 }}>
                Create account
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: C.slate, lineHeight: 1.6 }}>
                Join MediCore — free to get started.
              </Typography>
            </Box>

            {/* Role selector */}
            <RoleSelector selected={role} onChange={(r) => { setRole(r); setError(null); }} />

            {/* Form fields — same gap & input height as login */}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

              {/* Name + Email — 2 columns */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={labelSx}>Full Name</Typography>
                  <TextField fullWidth placeholder="John Doe" size="medium" value={fullName} onChange={(e) => setFullName(e.target.value)} required sx={fieldSx} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Email</Typography>
                  <TextField fullWidth type="email" placeholder="you@example.com" size="medium" value={email} onChange={(e) => setEmail(e.target.value)} required sx={fieldSx} />
                </Box>
              </Box>

              {/* Password — full width */}
              <Box>
                <Typography sx={labelSx}>Password</Typography>
                <TextField
                  fullWidth type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" size="medium"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  sx={fieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((p) => !p)} size="small" sx={{ color: C.muted }}>
                          {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Patient: DOB + Phone — 2 columns */}
              {role === 'patient' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={labelSx}>Date of Birth</Typography>
                    <TextField fullWidth placeholder="DD/MM/YYYY" size="medium" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required sx={fieldSx} />
                  </Box>
                  <Box>
                    <Typography sx={labelSx}>Phone</Typography>
                    <TextField fullWidth type="tel" placeholder="+91 98765 43210" size="medium" value={phone} onChange={(e) => setPhone(e.target.value)} required sx={fieldSx} />
                  </Box>
                </Box>
              )}

              {/* Doctor: License + Specialization — 2 columns, Hospital full width */}
              {role === 'doctor' && (
                <>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography sx={labelSx}>License No.</Typography>
                      <TextField fullWidth placeholder="ML-123456" size="medium" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required sx={fieldSx} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}>Specialization</Typography>
                      <TextField fullWidth select size="medium" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff' } }}>
                        {specializations.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={labelSx}>Hospital / Clinic</Typography>
                    <TextField fullWidth placeholder="City General Hospital" size="medium" value={hospital} onChange={(e) => setHospital(e.target.value)} required sx={fieldSx} />
                  </Box>
                </>
              )}

              {/* Submit — same style as login */}
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
                {loading ? <CircularProgress size={18} color="inherit" /> : `Create ${role === 'doctor' ? 'Doctor' : 'Patient'} Account`}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 13, color: C.muted }} />
                  <Typography sx={{ fontSize: '0.6875rem', color: C.muted }}>HIPAA compliant</Typography>
                </Box>
                {['Privacy', 'Terms'].map((label) => (
                  <Link key={label} href="#" sx={{ fontSize: '0.6875rem', color: C.muted, textDecoration: 'none', '&:hover': { color: C.slate } }}>
                    {label}
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
