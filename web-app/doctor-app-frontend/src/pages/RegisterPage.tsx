import { useState, type FormEvent } from 'react';
import {
  Box, Button, TextField, Typography, Link, Alert,
  IconButton, InputAdornment, MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import BrandingPanel from '../components/BrandingPanel';
import BrandLogo from '../components/BrandLogo';
import RoleSelector from '../components/RoleSelector';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

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

  // Patient-specific
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor-specific
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
      toast('Account created successfully! Welcome to MediCore.', 'success');
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

          <Box mb={2}>
            <Typography variant="h2" sx={{ fontSize: '2rem', color: '#002045', mb: 1 }}>
              Create an account
            </Typography>
            <Typography color="text.secondary">
              Fill in your details to get started with MediConnect.
            </Typography>
          </Box>

          <Box mt={3}>
            <RoleSelector selected={role} onChange={(r) => { setRole(r); setError(null); }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Common fields */}
            <TextField
              fullWidth label="Full Name" placeholder="John Doe"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              required sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Email Address" type="email" placeholder="name@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Patient-specific fields */}
            {role === 'patient' && (
              <>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth label="Phone Number" type="tel" placeholder="+1 234 567 8900"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  required sx={{ mb: 3 }}
                />
              </>
            )}

            {/* Doctor-specific fields */}
            {role === 'doctor' && (
              <>
                <TextField
                  fullWidth label="Medical License Number" placeholder="e.g. ML-123456"
                  value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                  required sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth select label="Specialization"
                  value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                  required sx={{ mb: 2 }}
                >
                  {specializations.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth label="Hospital / Clinic Name" placeholder="e.g. City General Hospital"
                  value={hospital} onChange={(e) => setHospital(e.target.value)}
                  required sx={{ mb: 3 }}
                />
              </>
            )}

            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Already have an account?{' '}
            <Link
              component="button" onClick={() => navigate('/login')}
              color="secondary" fontWeight={600} underline="hover"
              sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign in
            </Link>
          </Typography>

          {/* Footer */}
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
