import { useState, type FormEvent } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Link, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { C } from '../styles/theme';

interface AuthFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => void;
  loading?: boolean;
  error?: string | null;
}

export default function AuthForm({ onSubmit, loading = false, error }: AuthFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit({ email, password, rememberMe: remember }); };

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 0.5 }}>Email</Typography>
        <TextField fullWidth type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate }}>Password</Typography>
          <Link component="button" type="button" onClick={() => navigate('/forgot-password')}
            sx={{ fontSize: '0.75rem', color: C.blue, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Forgot password?
          </Link>
        </Box>
        <TextField fullWidth type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
          InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShow(p => !p)} size="small" sx={{ color: C.muted }}>{show ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}</IconButton></InputAdornment>) }} />
      </Box>

      <FormControlLabel
        control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" sx={{ color: C.border, '&.Mui-checked': { color: C.blue }, p: 0.5 }} />}
        label={<Typography sx={{ fontSize: '0.75rem', color: C.slate }}>Stay signed in for 30 days</Typography>}
        sx={{ m: 0 }}
      />

      <Button type="submit" fullWidth variant="contained" size="medium" disabled={loading} sx={{ mt: 0.5 }}>
        {loading ? <CircularProgress size={15} color="inherit" /> : 'Sign in'}
      </Button>

      <Box sx={{ position: 'relative', textAlign: 'center', my: 0.5 }}>
        <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: C.border }} />
        <Typography sx={{ position: 'relative', display: 'inline-block', backgroundColor: C.paper, px: 1.5, fontSize: '0.6875rem', color: C.muted }}>or</Typography>
      </Box>

      <Button fullWidth variant="outlined" size="medium"
        sx={{ gap: 1.25, borderColor: C.border, color: C.inkMid, '&:hover': { borderColor: C.subtle, backgroundColor: C.surface } }}
        startIcon={
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        }>
        Continue with Google
      </Button>

      <Typography sx={{ fontSize: '0.75rem', color: C.muted, textAlign: 'center', mt: 0.25 }}>
        No account?{' '}
        <Link component="button" type="button" onClick={() => navigate('/register')}
          sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Create one
        </Link>
      </Typography>
    </Box>
  );
}
