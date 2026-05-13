import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import DoctorTopNavBar from './DoctorTopNavBar';
import DoctorSideNavBar from './DoctorSideNavBar';
import { useDoctorContext } from '../contexts/DoctorContext';

interface DoctorPageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  fab?: ReactNode;
}

export default function DoctorPageLayout({ children, title, subtitle, fab }: DoctorPageLayoutProps) {
  const { profile } = useDoctorContext();
  const navigate = useNavigate();
  const doctorName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
    : '';

  return (
    <Box sx={{ backgroundColor: '#faf9fd', minHeight: '100vh' }}>
      <DoctorTopNavBar displayName={doctorName} email={profile?.email} onProfileClick={() => navigate('/doctor/profile')} />
      <Box display="flex">
        <DoctorSideNavBar />
        <Box component="main" sx={{ ml: { md: '240px' }, flex: 1, p: { xs: 3, md: 4 }, maxWidth: '100%' }}>
          {title && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif', mb: 0.5 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ fontSize: '0.9375rem', color: '#64748b' }}>{subtitle}</Typography>
              )}
            </Box>
          )}
          {children}
        </Box>
      </Box>
      {fab}
    </Box>
  );
}
