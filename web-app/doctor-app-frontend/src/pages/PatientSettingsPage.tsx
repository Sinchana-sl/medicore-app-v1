import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, TextField, MenuItem,
  Button, Switch, Avatar, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldIcon from '@mui/icons-material/Shield';
import SmsIcon from '@mui/icons-material/Sms';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import OpacityIcon from '@mui/icons-material/Opacity';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DevicesIcon from '@mui/icons-material/Devices';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinearProgress from '@mui/material/LinearProgress';
import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';
import { useToast } from '../contexts/ToastContext';
import { useAppTheme, type ThemeMode } from '../contexts/AppThemeContext';
import { getPatientProfile, updatePatientProfile, type PatientProfile } from '../services/patientService';
import { sendPasswordResetOtp, resetPassword, logout } from '../services/authService';
import api from '../services/api';

// ─── Section constants ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',       label: 'Profile',        icon: <PersonIcon /> },
  { id: 'security',      label: 'Security',        icon: <LockIcon /> },
  { id: 'notifications', label: 'Notifications',   icon: <NotificationsIcon /> },
  { id: 'appearance',    label: 'Appearance',       icon: <PaletteIcon /> },
  { id: 'account',       label: 'Account',          icon: <ShieldIcon /> },
];

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi',
];

// ─── Shared card style ────────────────────────────────────────────────────────

function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Box sx={{
      width: '100%', backgroundColor: '#fff', borderRadius: '8px',
      border: '1px solid #E9E9E7', boxShadow: 'none',
      overflow: 'hidden',
    }}>
      <Box sx={{ px: 3, py: 2.25, borderBottom: '1px solid #E9E9E7' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#37352F', fontFamily: 'inherit' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9B9A97', mt: 0.25 }}>{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}

function SettingsRow({ label, description, control }: { label: string; description?: string; control: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.5,
      '&:not(:last-child)': { borderBottom: '1px solid #f8fafc' } }}>
      <Box>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#37352F' }}>{label}</Typography>
        {description && <Typography sx={{ fontSize: '0.75rem', color: '#9B9A97', mt: 0.25 }}>{description}</Typography>}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PatientSettingsPage() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [phone, setPhone]             = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender]           = useState('');
  const [bloodType, setBloodType]     = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [pwStep, setPwStep] = useState<'idle' | 'otp_sent' | 'reset'>('idle');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  // Notifications state (persisted in localStorage)
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mc_notifs') || '{}'); } catch { return {}; }
  });

  // Appearance state
  const { themeMode, setThemeMode } = useAppTheme();
  const [language, setLanguage] = useState(() => localStorage.getItem('mc_lang') || 'English');

  // Delete account dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    getPatientProfile()
      .then(p => {
        setProfile(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setPhone(p.phone ?? '');
        setDateOfBirth(p.dateOfBirth ?? '');
        setGender(p.gender ?? '');
        setBloodType(p.bloodType ?? '');
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function saveNotif(key: string, val: boolean) {
    const next = { ...notifs, [key]: val };
    setNotifs(next);
    localStorage.setItem('mc_notifs', JSON.stringify(next));
  }

  function saveTheme(t: string) {
    setThemeMode(t as ThemeMode);
    toast('Theme updated', 'success');
  }

  function saveLanguage(l: string) {
    setLanguage(l);
    localStorage.setItem('mc_lang', l);
    toast('Language preference saved', 'success');
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updatePatientProfile({
        firstName, lastName,
        phone:       phone       || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender:      gender      || undefined,
        bloodType:   bloodType   || undefined,
      });
      setProfile(updated);
      setPhone(updated.phone ?? '');
      setDateOfBirth(updated.dateOfBirth ?? '');
      setGender(updated.gender ?? '');
      setBloodType(updated.bloodType ?? '');
      setEditingProfile(false);
      toast('Profile updated successfully', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSendOtp() {
    if (!profile?.email) return;
    setPwLoading(true);
    setPwError('');
    try {
      await sendPasswordResetOtp(profile.email);
      setPwStep('otp_sent');
      toast('OTP sent to your email', 'success');
    } catch {
      setPwError('Failed to send OTP. Please try again.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (!otp.trim()) { setPwError('Please enter the OTP.'); return; }
    setPwLoading(true);
    setPwError('');
    try {
      await resetPassword(profile!.email, otp.trim(), newPw);
      setPwStep('idle');
      setOtp(''); setNewPw(''); setConfirmPw('');
      toast('Password changed successfully', 'success');
    } catch {
      setPwError('Invalid OTP or request failed. Please try again.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    try {
      await api.delete('/api/patient/account');
    } catch { /* ignore — backend may not have this yet */ }
    logout();
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.email.split('@')[0]
    : '…';

  function getInitials(name: string) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  // ── Section renderers ───────────────────────────────────────────────────────

  function profileCompleteness() {
    if (!profile) return 0;
    const fields = [profile.firstName, profile.lastName, profile.phone, profile.dateOfBirth, profile.gender, profile.bloodType];
    const filled = fields.filter(f => f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }

  function fmtDob(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function cancelEditProfile() {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setPhone(profile?.phone ?? '');
    setDateOfBirth(profile?.dateOfBirth ?? '');
    setGender(profile?.gender ?? '');
    setBloodType(profile?.bloodType ?? '');
    setEditingProfile(false);
  }

  const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
  const GENDERS     = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const completeness = profileCompleteness();

  function renderProfile() {
    const infoRows = [
      { label: 'First Name',    value: profile?.firstName || '—', icon: <PersonIcon sx={{ fontSize: 20, color: '#0D9488' }} />, bg: '#F0FDFA' },
      { label: 'Last Name',     value: profile?.lastName  || '—', icon: <PersonIcon sx={{ fontSize: 20, color: '#7c3aed' }} />, bg: '#faf5ff' },
      { label: 'Email',         value: profile?.email     || '—', icon: <EmailIcon  sx={{ fontSize: 20, color: '#0D9488' }} />, bg: '#ecfeff', badge: 'Verified' },
      { label: 'Phone',         value: profile?.phone     || '—', icon: <PhoneAndroidIcon sx={{ fontSize: 20, color: '#16a34a' }} />, bg: '#f0fdf4' },
      { label: 'Date of Birth', value: fmtDob(profile?.dateOfBirth ?? null), icon: <CakeIcon sx={{ fontSize: 20, color: '#f59e0b' }} />, bg: '#fffbeb' },
      { label: 'Gender',        value: profile?.gender    || '—', icon: <WcIcon sx={{ fontSize: 20, color: '#ec4899' }} />, bg: '#fdf2f8' },
    ];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

        {/* ── Hero card ── */}
        <Box sx={{
          borderRadius: '8px', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0D9488 0%, #0D9488 100%)',
          boxShadow: 'none',
        }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{
              width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)',
              fontSize: '1.75rem', fontWeight: 800, fontFamily: 'inherit',
              border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0,
            }}>
              {loading ? '?' : getInitials(displayName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.375rem', color: '#fff', fontFamily: 'inherit', lineHeight: 1.2 }}>
                {loading ? '…' : displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(200,230,255,0.9)', mt: 0.375 }}>
                {profile?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip label="Patient" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '0.68rem', border: '1px solid rgba(255,255,255,0.3)' }} />
                {profile?.memberSince && (
                  <Chip label={`Member since ${profile.memberSince}`} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(220,240,255,0.9)', fontWeight: 600, fontSize: '0.68rem', border: '1px solid rgba(255,255,255,0.2)' }} />
                )}
                {profile?.bloodType && (
                  <Chip
                    icon={<BloodtypeIcon sx={{ fontSize: '13px !important', color: '#fca5a5 !important' }} />}
                    label={profile.bloodType}
                    size="small"
                    sx={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontWeight: 700, fontSize: '0.68rem', border: '1px solid rgba(239,68,68,0.3)' }}
                  />
                )}
              </Box>
            </Box>
            {!editingProfile && (
              <IconButton onClick={() => setEditingProfile(true)} size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' } }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {/* Profile completeness bar */}
          <Box sx={{ px: 3, pb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(200,230,255,0.8)' }}>Profile completeness</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: completeness === 100 ? '#86efac' : '#fff' }}>{completeness}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completeness}
              sx={{
                height: 6, borderRadius: 99,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  backgroundColor: completeness === 100 ? '#86efac' : '#fff',
                },
              }}
            />
            {completeness < 100 && (
              <Typography sx={{ fontSize: '0.68rem', color: 'rgba(200,230,255,0.7)', mt: 0.75 }}>
                Complete your profile to get the best experience
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Edit form ── */}
        {editingProfile && (
          <SettingsCard title="Edit Profile" subtitle="Update your personal and health information">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)}
                  fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)}
                  fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Box>
              <TextField
                label="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth size="small"
                placeholder="+91 XXXXX XXXXX"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneAndroidIcon sx={{ fontSize: 18, color: '#9B9A97' }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  fullWidth size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  select label="Gender"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">— Select —</MenuItem>
                  {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Box>
              <TextField
                select label="Blood Type"
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                size="small"
                sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">— Select —</MenuItem>
                {BLOOD_TYPES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>

              <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
                <Button onClick={cancelEditProfile} sx={{ color: '#73726E', fontWeight: 600 }}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile} variant="contained"
                  startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{ backgroundColor: '#0D9488', borderRadius: '6px', fontWeight: 700, boxShadow: 'none',
                    px: 3, '&:hover': { backgroundColor: '#0F766E' } }}>
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </SettingsCard>
        )}

        {/* ── Personal info rows ── */}
        <SettingsCard title="Personal Information" subtitle="Your details as they appear on appointments and medical records">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {infoRows.map(f => (
              <Box key={f.label} sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                borderRadius: '8px', border: '1px solid #E9E9E7',
                background: `linear-gradient(135deg, ${f.bg}80, #fff)`,
              }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: f.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B9A97',
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: f.value === '—' ? '#cbd5e1' : '#37352F', mt: 0.2, fontStyle: f.value === '—' ? 'italic' : 'normal' }}>
                    {f.value}
                  </Typography>
                </Box>
                {f.badge && (
                  <Chip label={f.badge} size="small"
                    icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#16a34a !important' }} />}
                    sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a' }} />
                )}
              </Box>
            ))}
          </Box>
        </SettingsCard>

        {/* ── Health card ── */}
        <SettingsCard title="Health Information" subtitle="Key medical details used by your care team">
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              {
                label: 'Blood Type',
                value: profile?.bloodType || 'Not set',
                icon: <BloodtypeIcon sx={{ fontSize: 24, color: profile?.bloodType ? '#dc2626' : '#9B9A97' }} />,
                bg: profile?.bloodType ? '#fef2f2' : '#F7F7F5',
                border: profile?.bloodType ? '#fecaca' : '#e2e8f0',
                color: profile?.bloodType ? '#dc2626' : '#9B9A97',
              },
              {
                label: 'Date of Birth',
                value: fmtDob(profile?.dateOfBirth ?? null),
                icon: <CalendarMonthIcon sx={{ fontSize: 24, color: profile?.dateOfBirth ? '#f59e0b' : '#9B9A97' }} />,
                bg: profile?.dateOfBirth ? '#fffbeb' : '#F7F7F5',
                border: profile?.dateOfBirth ? '#fde68a' : '#e2e8f0',
                color: profile?.dateOfBirth ? '#b45309' : '#9B9A97',
              },
              {
                label: 'Gender',
                value: profile?.gender || 'Not set',
                icon: <WcIcon sx={{ fontSize: 24, color: profile?.gender ? '#ec4899' : '#9B9A97' }} />,
                bg: profile?.gender ? '#fdf2f8' : '#F7F7F5',
                border: profile?.gender ? '#fbcfe8' : '#e2e8f0',
                color: profile?.gender ? '#be185d' : '#9B9A97',
              },
            ].map(card => (
              <Box key={card.label} sx={{
                flex: '1 1 160px', p: 2.5, borderRadius: '8px',
                border: `2px solid ${card.border}`,
                backgroundColor: card.bg,
                textAlign: 'center',
              }}>
                <Box sx={{ mb: 1 }}>{card.icon}</Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B9A97', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: card.color, fontFamily: 'inherit' }}>
                  {card.value}
                </Typography>
              </Box>
            ))}
          </Box>
          {(!profile?.bloodType || !profile?.dateOfBirth || !profile?.gender) && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '6px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#92400e' }}>
                Complete your health info to help doctors prepare better
              </Typography>
              <Button size="small" onClick={() => setEditingProfile(true)}
                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                sx={{ flexShrink: 0, color: '#b45309', fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px',
                  backgroundColor: '#fef3c7', '&:hover': { backgroundColor: '#fde68a' } }}>
                Fill now
              </Button>
            </Box>
          )}
        </SettingsCard>

        {/* ── Account details ── */}
        <SettingsCard title="Account Details" subtitle="Read-only information about your account">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {[
              { label: 'User ID',      value: profile?.id ? profile.id.slice(0, 8) + '…' : '—', icon: <ShieldIcon sx={{ fontSize: 20, color: '#73726E' }} />, bg: '#F7F7F5' },
              { label: 'Account Type', value: 'Patient',    icon: <PersonIcon sx={{ fontSize: 20, color: '#0D9488' }} />, bg: '#F0FDFA', badge: 'Active' },
              { label: 'Member Since', value: profile?.memberSince || '—', icon: <CalendarMonthIcon sx={{ fontSize: 20, color: '#7c3aed' }} />, bg: '#faf5ff' },
            ].map(row => (
              <Box key={row.label} sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                borderRadius: '8px', border: '1px solid #E9E9E7',
                background: `linear-gradient(135deg, ${row.bg}80, #fff)`,
              }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: row.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B9A97', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#37352F', mt: 0.2 }}>
                    {row.value}
                  </Typography>
                </Box>
                {row.badge && (
                  <Chip label={row.badge} size="small"
                    sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a' }} />
                )}
              </Box>
            ))}
          </Box>
        </SettingsCard>
      </Box>
    );
  }

  function renderSecurity() {
    const pwOptions = [
      {
        icon: <EmailIcon sx={{ fontSize: 20, color: '#0D9488' }} />,
        bg: '#F0FDFA',
        title: 'Email OTP Verification',
        desc: `One-time code sent to ${profile?.email ?? 'your email'}`,
      },
      {
        icon: <VpnKeyIcon sx={{ fontSize: 20, color: '#7c3aed' }} />,
        bg: '#faf5ff',
        title: 'Password Update',
        desc: 'Enter OTP + choose a strong new password',
      },
    ];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
        <SettingsCard title="Change Password" subtitle="Two-step verification via your registered email">
          {pwError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{pwError}</Alert>}

          {pwStep === 'idle' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pwOptions.map((opt, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
                    borderRadius: '8px', border: '1px solid #E9E9E7',
                    background: `linear-gradient(135deg, ${opt.bg}, #fff)`,
                  }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '6px', backgroundColor: opt.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#37352F', lineHeight: 1.3 }}>
                        {opt.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#73726E', mt: 0.25 }}>
                        {opt.desc}
                      </Typography>
                    </Box>
                    <Chip label={`Step ${i + 1}`} size="small"
                      sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#F1F0EF', color: '#73726E' }} />
                  </Box>
                ))}
              </Box>
              <Button onClick={handleSendOtp} disabled={pwLoading || !profile} variant="contained"
                sx={{ backgroundColor: '#0D9488', borderRadius: '6px', fontWeight: 700, boxShadow: 'none',
                  alignSelf: 'flex-start', px: 3, '&:hover': { backgroundColor: '#0F766E' } }}>
                {pwLoading ? <CircularProgress size={18} color="inherit" /> : 'Send OTP to Email'}
              </Button>
            </Box>
          )}

          {pwStep === 'otp_sent' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
                  borderRadius: '8px', border: '2px solid #bbf7d0',
                  background: 'linear-gradient(135deg, #f0fdf4, #fff)',
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '6px', backgroundColor: '#dcfce7', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#15803d', lineHeight: 1.3 }}>
                      OTP Sent!
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#73726E', mt: 0.25 }}>
                      Check your email inbox and enter the code below
                    </Typography>
                  </Box>
                  <Chip label="Step 1 done" size="small"
                    sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a' }} />
                </Box>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
                  borderRadius: '8px', border: '2px solid #CCFBF1',
                  background: 'linear-gradient(135deg, #F0FDFA, #fff)',
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '6px', backgroundColor: '#F0FDFA', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VpnKeyIcon sx={{ fontSize: 24, color: '#0D9488' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#37352F', lineHeight: 1.3 }}>
                      Enter OTP & New Password
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#73726E', mt: 0.25 }}>
                      Fill in the form below
                    </Typography>
                  </Box>
                  <Chip label="Step 2 — now" size="small"
                    sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#F0FDFA', color: '#0D9488' }} />
                </Box>
              </Box>
              <Box sx={{ p: 3, borderRadius: '8px', border: '1px solid #E9E9E7',
                background: 'linear-gradient(135deg, #f8fafc, #fff)',
                display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField size="small" label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)}
                  inputProps={{ maxLength: 6, style: { letterSpacing: '0.3em', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="New Password" type={showPw ? 'text' : 'password'}
                  value={newPw} onChange={e => setNewPw(e.target.value)}
                  slotProps={{ input: { endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(v => !v)} edge="end" size="small">
                        {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )}}}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Confirm New Password" type={showPw ? 'text' : 'password'}
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                {newPw && (
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {[
                      { label: '8+ chars',  ok: newPw.length >= 8 },
                      { label: 'Uppercase', ok: /[A-Z]/.test(newPw) },
                      { label: 'Number',    ok: /\d/.test(newPw) },
                      { label: 'Match',     ok: newPw === confirmPw && confirmPw.length > 0 },
                    ].map(r => (
                      <Chip key={r.label} label={r.label} size="small"
                        icon={r.ok ? <CheckCircleIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                        sx={{ fontSize: '0.65rem', fontWeight: 700, height: 22,
                          backgroundColor: r.ok ? '#f0fdf4' : '#F1F0EF',
                          color: r.ok ? '#16a34a' : '#9B9A97' }} />
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button onClick={() => { setPwStep('idle'); setPwError(''); setOtp(''); setNewPw(''); setConfirmPw(''); }}
                  sx={{ color: '#73726E', fontWeight: 600 }}>Cancel</Button>
                <Button onClick={handleResetPassword} disabled={pwLoading} variant="contained"
                  sx={{ backgroundColor: '#0D9488', borderRadius: '6px', fontWeight: 700, boxShadow: 'none',
                    '&:hover': { backgroundColor: '#0F766E' } }}>
                  {pwLoading ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
                </Button>
              </Box>
            </Box>
          )}
        </SettingsCard>

        <SettingsCard title="Active Sessions" subtitle="Devices currently logged into your account">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
              borderRadius: '8px', border: '2px solid #bbf7d0',
              background: 'linear-gradient(135deg, #f0fdf4, #fff)',
            }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '6px', backgroundColor: '#dcfce7', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DevicesIcon sx={{ color: '#16a34a', fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#37352F', lineHeight: 1.3 }}>
                  Current Browser Session
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#73726E', mt: 0.25 }}>
                  Logged in now · This device
                </Typography>
              </Box>
              <Chip label="Active" size="small"
                sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a' }} />
            </Box>

            <Box onClick={logout} sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
              borderRadius: '8px', border: '2px solid #fecaca', cursor: 'pointer',
              background: 'linear-gradient(135deg, #fef2f2, #fff)',
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#dc2626', background: 'linear-gradient(135deg, #fee2e2, #fff)' },
            }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '6px', backgroundColor: '#fee2e2', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogoutIcon sx={{ color: '#dc2626', fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#dc2626', lineHeight: 1.3 }}>
                  Sign Out All Sessions
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#73726E', mt: 0.25 }}>
                  Revokes all active tokens and logs you out
                </Typography>
              </Box>
              <Chip label="Danger" size="small"
                sx={{ flexShrink: 0, height: 22, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#fef2f2', color: '#dc2626' }} />
            </Box>
          </Box>
        </SettingsCard>
      </Box>
    );
  }

  function renderNotifications() {
    const groups = [
      {
        title: 'Appointment Reminders',
        subtitle: 'Get notified about upcoming appointments',
        rows: [
          { key: 'email_reminders',    label: 'Email reminders',    desc: '24 hours before your appointment', icon: <EmailIcon sx={{ fontSize: 18 }} />, iconBg: '#F0FDFA', iconColor: '#0D9488' },
          { key: 'whatsapp_reminders', label: 'WhatsApp reminders', desc: 'Quick message before your visit',  icon: <SmartphoneIcon sx={{ fontSize: 18 }} />, iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { key: 'sms_reminders',      label: 'SMS reminders',      desc: 'Text reminder 2 hours before',    icon: <SmsIcon sx={{ fontSize: 18 }} />, iconBg: '#F0FDFA', iconColor: '#0D9488' },
        ],
      },
      {
        title: 'Updates & Activity',
        subtitle: 'Stay informed about your health activity',
        rows: [
          { key: 'booking_confirm',  label: 'Booking confirmations', desc: 'When an appointment is confirmed',  icon: <DoneAllIcon sx={{ fontSize: 18 }} />, iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { key: 'cancellation',     label: 'Cancellation alerts',   desc: 'If your appointment is cancelled', icon: <NotificationImportantIcon sx={{ fontSize: 18 }} />, iconBg: '#fffbeb', iconColor: '#f59e0b' },
          { key: 'payment_receipts', label: 'Payment receipts',      desc: 'Email receipt after payment',      icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />, iconBg: '#faf5ff', iconColor: '#7c3aed' },
          { key: 'report_ready',     label: 'Report available',      desc: 'When a new report is shared',      icon: <DescriptionIcon sx={{ fontSize: 18 }} />, iconBg: '#F0FDFA', iconColor: '#0D9488' },
        ],
      },
      {
        title: 'Health & Wellness',
        subtitle: 'Personalised health content',
        rows: [
          { key: 'health_tips',  label: 'Daily health tips',     desc: 'Morning wellness tips via email',  icon: <LightbulbIcon sx={{ fontSize: 18 }} />, iconBg: '#fffbeb', iconColor: '#f59e0b' },
          { key: 'water_remind', label: 'Water intake reminder', desc: 'Hydration nudges during the day', icon: <OpacityIcon sx={{ fontSize: 18 }} />, iconBg: '#F0FDFA', iconColor: '#0D9488' },
          { key: 'med_remind',   label: 'Medication reminders',  desc: 'Reminders for your tracked meds', icon: <MedicalServicesIcon sx={{ fontSize: 18 }} />, iconBg: '#fef2f2', iconColor: '#dc2626' },
        ],
      },
    ];

    const switchSx = {
      width: 44, height: 24, p: 0,
      '& .MuiSwitch-switchBase': {
        p: 0, m: '3px',
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          color: '#fff',
          '& + .MuiSwitch-track': { backgroundColor: '#0D9488', opacity: 1, border: 0 },
        },
      },
      '& .MuiSwitch-thumb': { width: 18, height: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
      '& .MuiSwitch-track': { borderRadius: 12, backgroundColor: '#C8C8C5', opacity: 1 },
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {groups.map(g => (
          <SettingsCard key={g.title} title={g.title} subtitle={g.subtitle}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {g.rows.map((row, i) => {
                const on = notifs[row.key] ?? true;
                return (
                  <Box
                    key={row.key}
                    onClick={() => saveNotif(row.key, !on)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      py: 1.5, px: 0.5, cursor: 'pointer',
                      borderBottom: i < g.rows.length - 1 ? '1px solid #F1F0EF' : 'none',
                      borderRadius: '6px',
                      '&:hover': { backgroundColor: '#FAFAF9' },
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Icon */}
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                      backgroundColor: on ? row.iconBg : '#F1F0EF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: on ? row.iconColor : '#C8C8C5',
                      transition: 'all 0.15s',
                    }}>
                      {row.icon}
                    </Box>

                    {/* Label + description */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: on ? '#37352F' : '#9B9A97', lineHeight: 1.3 }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9B9A97', mt: 0.2, lineHeight: 1.4 }}>
                        {row.desc}
                      </Typography>
                    </Box>

                    {/* Toggle */}
                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: on ? '#0D9488' : '#C8C8C5', minWidth: 20, textAlign: 'right' }}>
                        {on ? 'On' : 'Off'}
                      </Typography>
                      <Switch
                        checked={on}
                        onChange={e => { e.stopPropagation(); saveNotif(row.key, e.target.checked); }}
                        onClick={e => e.stopPropagation()}
                        sx={switchSx}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </SettingsCard>
        ))}
      </Box>
    );
  }

  function renderAppearance() {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <SettingsCard title="Theme" subtitle="Choose how MediCore looks to you">
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { value: 'light', label: 'Light',  icon: <LightModeIcon sx={{ fontSize: 28, color: '#f59e0b' }} />, bg: '#fff', border: '#e2e8f0', preview: 'linear-gradient(135deg,#f8fafc,#fff)' },
              { value: 'dark',  label: 'Dark',   icon: <DarkModeIcon  sx={{ fontSize: 28, color: '#818cf8' }} />, bg: '#1e293b', border: '#334155', preview: 'linear-gradient(135deg,#1e293b,#0f172a)' },
              { value: 'system', label: 'System', icon: <PaletteIcon  sx={{ fontSize: 28, color: '#0D9488' }} />, bg: '#f0f9ff', border: '#bae6fd', preview: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' },
            ].map(opt => {
              const active = themeMode === opt.value;
              return (
                <Box key={opt.value} onClick={() => saveTheme(opt.value)} sx={{
                  flex: 1, p: 2, borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${active ? '#0D9488' : opt.border}`,
                  background: opt.preview,
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#0D9488' },
                }}>
                  {opt.icon}
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: active ? '#0D9488' : '#73726E', mt: 1 }}>{opt.label}</Typography>
                  {active && <Chip label="Active" size="small" sx={{ mt: 0.75, height: 20, fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#F0FDFA', color: '#0D9488' }} />}
                </Box>
              );
            })}
          </Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#9B9A97', mt: 2 }}>
            Note: Theme switching is saved as a preference. Full dark mode will be applied in the next update.
          </Typography>
        </SettingsCard>

        <SettingsCard title="Language" subtitle="Choose your preferred language for AI explanations and tips">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {LANGUAGES.map(l => {
              const active = language === l;
              return (
                <Chip key={l} label={l} clickable onClick={() => saveLanguage(l)}
                  icon={active ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#0D9488 !important' }} /> : undefined}
                  sx={{
                    fontWeight: 700, fontSize: '0.78rem',
                    backgroundColor: active ? '#F0FDFA' : '#F7F7F5',
                    color: active ? '#0D9488' : '#73726E',
                    border: `1px solid ${active ? '#CCFBF1' : '#e2e8f0'}`,
                    '&:hover': { backgroundColor: active ? '#CCFBF1' : '#F1F0EF' },
                  }} />
              );
            })}
          </Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#9B9A97', mt: 2 }}>
            This language is used for AI document explanations in the Chat section.
          </Typography>
        </SettingsCard>

        <SettingsCard title="Accessibility" subtitle="Adjust display preferences">
          <SettingsRow label="Compact mode" description="Reduce spacing for more content on screen"
            control={<Switch size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0D9488' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0D9488' } }} />}
          />
          <SettingsRow label="Larger text" description="Increase font size across the app"
            control={<Switch size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0D9488' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0D9488' } }} />}
          />
        </SettingsCard>
      </Box>
    );
  }

  function renderAccount() {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <SettingsCard title="Sign Out" subtitle="End your current session">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#73726E' }}>
                You will be redirected to the login page. Your data is safely stored and you can log back in at any time.
              </Typography>
            </Box>
            <Button onClick={logout} variant="outlined" startIcon={<LogoutIcon />}
              sx={{ flexShrink: 0, borderColor: '#0D9488', color: '#0D9488', borderRadius: '6px', fontWeight: 700,
                '&:hover': { backgroundColor: '#F0FDFA', borderColor: '#0F766E' } }}>
              Sign Out
            </Button>
          </Box>
        </SettingsCard>

        <SettingsCard title="Data & Privacy" subtitle="Manage your personal data">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: '6px', backgroundColor: '#F7F7F5', border: '1px solid #E9E9E7' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#37352F', mb: 0.5 }}>What we store</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#73726E', lineHeight: 1.65 }}>
                Your name, email, appointment history, and medical records you upload are stored securely. We do not share your data with third parties without consent.
              </Typography>
            </Box>
            <Button variant="outlined" size="small"
              sx={{ alignSelf: 'flex-start', borderColor: '#E9E9E7', color: '#73726E', borderRadius: '6px', fontWeight: 600,
                '&:hover': { borderColor: '#0D9488', color: '#0D9488', backgroundColor: '#f0f7ff' } }}>
              Request My Data Export
            </Button>
          </Box>
        </SettingsCard>

        <SettingsCard title="Delete Account" subtitle="Permanently remove your account and all associated data">
          <Box sx={{ p: 2, borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', mb: 2 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 600, mb: 0.5 }}>⚠️ This action is irreversible</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#ef4444', lineHeight: 1.65 }}>
              Deleting your account will permanently remove all your appointments, medical records, and personal information. This cannot be undone.
            </Typography>
          </Box>
          <Button onClick={() => setDeleteOpen(true)} variant="contained" startIcon={<DeleteForeverIcon />}
            sx={{ backgroundColor: '#dc2626', borderRadius: '6px', fontWeight: 700, boxShadow: 'none',
              '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' } }}>
            Delete My Account
          </Button>
        </SettingsCard>
      </Box>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <TopNavBar
        displayName={displayName}
        email={profile?.email}
        onProfileClick={() => setActiveSection('profile')}
      />
      <Box sx={{ display: 'flex' }}>
        <SideNavBar />
        <Box component="main" sx={{ ml: '240px', flex: 1, mt: '52px', p: { xs: 3, md: 4 }, backgroundColor: '#FFFFFF' }}>
          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

            {/* Page header */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#37352F', fontFamily: 'inherit', lineHeight: 1.2 }}>
                Settings
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#73726E', mt: 0.5 }}>
                Manage your account, security, and preferences
              </Typography>
            </Box>

            {/* Horizontal pill nav */}
            <Box sx={{
              display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3,
              p: 1, borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #E9E9E7',
              boxShadow: 'none',
            }}>
              {SECTIONS.map(s => {
                const active = activeSection === s.id;
                return (
                  <Box key={s.id} onClick={() => setActiveSection(s.id)} sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 2, py: 1, borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: active ? '#0D9488' : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': { backgroundColor: active ? '#0F766E' : '#F1F0EF' },
                  }}>
                    <Box sx={{ display: 'flex', color: active ? '#fff' : '#9B9A97', '& svg': { fontSize: 18 } }}>
                      {s.icon}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit',
                      color: active ? '#fff' : '#73726E',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Section content — full width */}
            <Box sx={{ width: '100%' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#0D9488' }} />
                </Box>
              ) : activeSection === 'profile'       ? renderProfile()
                : activeSection === 'security'      ? renderSecurity()
                : activeSection === 'notifications' ? renderNotifications()
                : activeSection === 'appearance'    ? renderAppearance()
                : renderAccount()
              }
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Delete account confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteConfirm(''); }} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'inherit', color: '#dc2626' }}>
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            This action <strong>cannot be undone</strong>. All your data will be permanently deleted.
          </Alert>
          <Typography sx={{ fontSize: '0.875rem', color: '#73726E' }}>
            Type <strong>DELETE</strong> below to confirm you want to permanently delete your account.
          </Typography>
          <TextField size="small" placeholder="Type DELETE to confirm" value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }} sx={{ color: '#73726E', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'} variant="contained"
            sx={{ backgroundColor: '#dc2626', borderRadius: '6px', fontWeight: 700, boxShadow: 'none',
              '&:hover': { backgroundColor: '#b91c1c' }, '&.Mui-disabled': { backgroundColor: '#fca5a5', color: '#fff' } }}>
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
