import { C } from '../../styles/theme';
import { useEffect, useState, type FormEvent } from 'react';
import {
  Box, Button, TextField, Typography, Switch, FormControlLabel,
  CircularProgress, Alert, Grid, Avatar, Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { updateDoctorProfile } from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2, mt: 0.5 }}>
      {children}
    </Typography>
  );
}

export default function DoctorProfilePage() {
  const toast = useToast();
  const { profile, profileLoading, refreshProfile } = useDoctorContext();

  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber]   = useState('');
  const [bio, setBio]                       = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isAvailable, setIsAvailable]       = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setSpecialization(profile.specialization ?? '');
    setLicenseNumber(profile.licenseNumber ?? '');
    setBio(profile.bio ?? '');
    setYearsExperience(profile.yearsExperience != null ? String(profile.yearsExperience) : '');
    setConsultationFee(profile.consultationFee != null ? String(profile.consultationFee) : '');
    setProfileImageUrl(profile.profileImageUrl ?? '');
    setIsAvailable(profile.isAvailable ?? true);
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDoctorProfile({
        firstName,
        lastName,
        specialization,
        licenseNumber,
        bio,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        consultationFee: consultationFee ? Number(consultationFee) : undefined,
        profileImageUrl,
        isAvailable,
      });
      refreshProfile();
      toast('Profile updated successfully', 'success');
    } catch {
      const msg = 'Failed to update profile. Please try again.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profile?.email || '';

  return (
    <DoctorPageLayout title="My Profile" subtitle="Manage your professional information and settings">
      {profileLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Grid container spacing={3}>
            {/* Left column – avatar + availability */}
            <Grid item xs={12} md={4} lg={3}>
              <Box sx={{ backgroundColor: C.paper, p: 3, borderRadius: '8px', border: `1px solid ${C.border}`, boxShadow: 'none', textAlign: 'center' }}>
                <Avatar sx={{ width: 96, height: 96, backgroundColor: '#0D9488', fontSize: '2rem', fontWeight: 700, mx: 'auto', mb: 2, border: '3px solid #e2e8f0' }}>
                  {displayName ? getInitials(displayName) : <PersonIcon sx={{ fontSize: 48 }} />}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: C.ink, fontFamily: 'inherit' }}>{displayName || '—'}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: C.slate, mb: 2 }}>{profile?.email}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  onClick={() => setIsAvailable(v => !v)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, py: 1.25, borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: isAvailable ? C.greenBg : C.borderSub,
                    border: `1px solid ${isAvailable ? C.green + '30' : C.border}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: isAvailable ? C.green : C.slate, lineHeight: 1.2 }}>
                      {isAvailable ? 'Accepting patients' : 'Not available'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.muted, mt: 0.25 }}>
                      {isAvailable ? 'Visible to new patients' : 'Hidden from bookings'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={isAvailable}
                    onChange={(e) => { e.stopPropagation(); setIsAvailable(e.target.checked); }}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ ml: 1, flexShrink: 0 }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right column – form fields */}
            <Grid item xs={12} md={8} lg={9}>
              <Box sx={{ backgroundColor: C.paper, p: 3, borderRadius: '8px', border: `1px solid ${C.border}`, boxShadow: 'none' }}>
                <SectionLabel>Personal Information</SectionLabel>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />
                <SectionLabel>Professional Details</SectionLabel>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Specialization" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Medical License Number" placeholder="e.g. ML-123456" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Years of Experience" type="number" inputProps={{ min: 0 }} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Consultation Fee (₹)" type="number" inputProps={{ min: 0, step: '0.01' }} value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={3} label="Bio / About" placeholder="Tell patients about yourself, your experience, and your approach..." value={bio} onChange={(e) => setBio(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Profile Image URL" placeholder="https://..." value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={saving}
                    sx={{ px: 4, py: 1.5, backgroundColor: C.blue, '&:hover': { backgroundColor: C.blueDark }, borderRadius: '6px', fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save Profile'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </DoctorPageLayout>
  );
}
