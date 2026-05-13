import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import DoctorTopNavBar from './DoctorTopNavBar';
import DoctorSideNavBar from './DoctorSideNavBar';
import { useDoctorContext } from '../contexts/DoctorContext';
import { C } from '../styles/theme';

interface DoctorPageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  fab?: ReactNode;
  action?: ReactNode;
}

export default function DoctorPageLayout({ children, title, subtitle, fab, action }: DoctorPageLayoutProps) {
  const { profile } = useDoctorContext();
  const navigate = useNavigate();
  const doctorName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
    : '';

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh', display: 'flex' }}>
      <DoctorSideNavBar />

      <Box sx={{ flex: 1, ml: { md: '220px' }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <DoctorTopNavBar
          displayName={doctorName}
          email={profile?.email}
          onProfileClick={() => navigate('/doctor/profile')}
        />

        <Box component="main" sx={{ flex: 1, mt: '52px', p: { xs: 2.5, md: 3 } }}>
          {title && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h1" sx={{ color: C.ink, mb: subtitle ? 0.25 : 0 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {action && <Box>{action}</Box>}
            </Box>
          )}
          {children}
        </Box>
      </Box>

      {fab}
    </Box>
  );
}
