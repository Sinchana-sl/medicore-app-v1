import { useState, type FormEvent } from 'react';
import {
  Box, Button, Checkbox, FormControlLabel, IconButton,
  InputAdornment, Link, TextField, Typography, Alert,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => void;
  loading?: boolean;
  error?: string | null;
}

export default function AuthForm({ onSubmit, loading = false, error }: AuthFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, rememberMe });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth label="Work Email Address" type="email"
        placeholder="name@company.com" value={email}
        onChange={(e) => setEmail(e.target.value)} required
        sx={{ mt: 0, mb: 2 }}
      />

      <TextField
        fullWidth label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••" value={password}
        onChange={(e) => setPassword(e.target.value)} required
        sx={{ mt: 0, mb: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          sx: { display: 'flex', justifyContent: 'space-between', width: '100%' },
        }}
      />

      <Box display="flex" justifyContent="flex-end" mt={-1} mb={1}>
        <Link
          component="button" type="button" onClick={() => navigate('/forgot-password')}
          underline="hover" variant="caption" color="secondary" fontWeight={600}
          sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Forgot password?
        </Link>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
            size="small" color="primary"
          />
        }
        label={<Typography variant="caption" color="text.secondary">Keep me logged in for 30 days</Typography>}
      />

      <Button
        type="submit" fullWidth variant="contained" disabled={loading}
        sx={{ mt: 2, height: 52, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' } }}
      >
        {loading ? 'Signing in…' : 'Sign in to Workspace'}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">Or continue with</Typography>
      </Divider>

      <Button
        fullWidth variant="outlined"
        sx={{ height: 52, borderColor: 'grey.300', color: 'text.primary', gap: 1.5 }}
        startIcon={
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
      >
        Google
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
        Don't have an account?{' '}
        <Link
          component="button" type="button" onClick={() => navigate('/register')}
          color="secondary" fontWeight={600} underline="hover"
          sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Create an account
        </Link>
      </Typography>
    </Box>
  );
}
