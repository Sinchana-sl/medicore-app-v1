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
    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2, mt: 0.5 }}>
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
              <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)', textAlign: 'center' }}>
                <Avatar sx={{ width: 96, height: 96, backgroundColor: '#0061a5', fontSize: '2rem', fontWeight: 700, mx: 'auto', mb: 2, border: '3px solid #e2e8f0' }}>
                  {displayName ? getInitials(displayName) : <PersonIcon sx={{ fontSize: 48 }} />}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#002045', fontFamily: 'Manrope, sans-serif' }}>{displayName || '—'}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 2 }}>{profile?.email}</Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} color="success" />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: isAvailable ? '#16a34a' : '#94a3b8' }}>
                      {isAvailable ? 'Accepting patients' : 'Not available'}
                    </Typography>
                  }
                  labelPlacement="start"
                  sx={{ ml: 0, justifyContent: 'space-between', width: '100%' }}
                />
              </Box>
            </Grid>

            {/* Right column – form fields */}
            <Grid item xs={12} md={8} lg={9}>
              <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)' }}>
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
                    sx={{ px: 4, py: 1.5, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' }, borderRadius: 2, fontWeight: 600 }}>
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
