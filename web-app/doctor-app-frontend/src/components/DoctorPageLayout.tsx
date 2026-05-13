import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import DoctorTopNavBar from './DoctorTopNavBar';
import DoctorSideNavBar from './DoctorSideNavBar';
import { useDoctorContext } from '../contexts/DoctorContext';
import { COLORS } from '../styles/theme';

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
    <Box sx={{ backgroundColor: COLORS.surface, minHeight: '100vh' }}>
      <DoctorTopNavBar
        displayName={doctorName}
        email={profile?.email}
        onProfileClick={() => navigate('/doctor/profile')}
      />

      <Box display="flex">
        <DoctorSideNavBar />

        <Box
          component="main"
          sx={{
            ml: { md: '248px' },
            flex: 1,
            p: { xs: 3, md: 4 },
            maxWidth: '100%',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {title && (
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                    fontWeight: 800,
                    color: COLORS.navy,
                    mb: subtitle ? 0.5 : 0,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    sx={{ fontSize: '0.9375rem', color: COLORS.textSecondary, fontWeight: 400, lineHeight: 1.5 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
            </Box>
          )}

          {children}
        </Box>
      </Box>

      {fab}
    </Box>
  );
}
