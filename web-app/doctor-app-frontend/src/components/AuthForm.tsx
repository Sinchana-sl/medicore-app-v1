import { useState, type FormEvent } from 'react';
import {
  Box, Button, Checkbox, FormControlLabel, IconButton,
  InputAdornment, Link, TextField, Typography, Alert,
  Divider, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../styles/theme';

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
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textPrimary, mb: 0.75 }}>
            Email address
          </Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textPrimary }}>
              Password
            </Typography>
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/forgot-password')}
              underline="none"
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: COLORS.primary,
                background: 'none', border: 'none', cursor: 'pointer',
                '&:hover': { color: COLORS.primaryDark },
                transition: 'color 0.15s',
              }}
            >
              Forgot password?
            </Link>
          </Box>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small" sx={{ color: COLORS.textMuted }}>
                    {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            size="small"
            sx={{ color: COLORS.borderDark, '&.Mui-checked': { color: COLORS.primary } }}
          />
        }
        label={
          <Typography sx={{ fontSize: '0.8125rem', color: COLORS.textSecondary, fontWeight: 500 }}>
            Keep me signed in for 30 days
          </Typography>
        }
        sx={{ mt: 1.5, mb: 0.5 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 1.5, height: 52 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={18} color="inherit" />
            Signing in…
          </Box>
        ) : (
          'Sign in to MediCore'
        )}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, px: 1, fontWeight: 500 }}>
          or continue with
        </Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        sx={{
          height: 48,
          borderColor: COLORS.border,
          color: COLORS.textPrimary,
          gap: 1.5,
          '&:hover': { backgroundColor: COLORS.surface, borderColor: COLORS.borderDark },
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

      <Typography sx={{ fontSize: '0.875rem', color: COLORS.textSecondary, textAlign: 'center', mt: 3 }}>
        Don&apos;t have an account?{' '}
        <Link
          component="button"
          type="button"
          onClick={() => navigate('/register')}
          underline="none"
          sx={{
            fontWeight: 700,
            color: COLORS.primary,
            background: 'none', border: 'none', cursor: 'pointer',
            '&:hover': { color: COLORS.primaryDark },
            transition: 'color 0.15s',
          }}
        >
          Create account
        </Link>
      </Typography>
    </Box>
  );
}
