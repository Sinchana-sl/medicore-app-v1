import { Box, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../styles/theme';
import { alpha } from '@mui/material/styles';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    icon: <DashboardRoundedIcon sx={{ fontSize: 20 }} />,      path: '/doctor-dashboard', section: 'Overview' },
  { label: 'Appointments', icon: <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />,  path: '/doctor/appointments' },
  { label: 'Schedule',     icon: <AccessTimeRoundedIcon sx={{ fontSize: 20 }} />,     path: '/doctor/schedule',   section: 'Practice' },
  { label: 'Availability', icon: <EventAvailableRoundedIcon sx={{ fontSize: 20 }} />, path: '/doctor/availability' },
  { label: 'Slots',        icon: <GridViewRoundedIcon sx={{ fontSize: 20 }} />,       path: '/doctor/slots' },
  { label: 'Clinics',      icon: <LocalHospitalRoundedIcon sx={{ fontSize: 20 }} />,  path: '/doctor/clinics' },
  { label: 'Messages',     icon: <ForumRoundedIcon sx={{ fontSize: 20 }} />,          path: '/doctor/chat',       section: 'Communication' },
  { label: 'Profile',      icon: <PersonRoundedIcon sx={{ fontSize: 20 }} />,         path: '/doctor/profile',    section: 'Account' },
];

export default function DoctorSideNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const renderSection = (label: string) => (
    <Typography
      key={`section-${label}`}
      sx={{
        fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: COLORS.textMuted,
        px: 2, pt: 2.5, pb: 0.75,
      }}
    >
      {label}
    </Typography>
  );

  let lastSection = '';

  return (
    <Box
      component="nav"
      sx={{
        width: 248, flexShrink: 0, position: 'fixed',
        top: 64, left: 0, height: 'calc(100vh - 64px)',
        backgroundColor: '#fff', borderRight: `1px solid ${COLORS.border}`,
        pt: 1.5, pb: 3, px: 1.5,
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        zIndex: 40, overflowY: 'auto',
      }}
    >
      <Box sx={{ flex: 1 }}>
        {navItems.map(({ label, icon, path, section }) => {
          const isActive = pathname === path || (pathname.startsWith(path) && path !== '/doctor-dashboard');
          const showSection = section && section !== lastSection;
          if (section) lastSection = section;

          return (
            <Box key={label}>
              {showSection && renderSection(section!)}
              <Box
                component="button"
                onClick={() => navigate(path)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  width: '100%', px: 1.5, py: 1.125,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderRadius: 2.5, position: 'relative',
                  backgroundColor: isActive ? alpha(COLORS.primary, 0.08) : 'transparent',
                  color: isActive ? COLORS.primary : COLORS.textSecondary,
                  transition: 'all 0.15s',
                  mb: 0.25,
                  '&:hover': {
                    backgroundColor: isActive ? alpha(COLORS.primary, 0.1) : COLORS.surface,
                    color: isActive ? COLORS.primaryDark : COLORS.textPrimary,
                  },
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    backgroundColor: COLORS.primary,
                    marginLeft: -6,
                  } : {},
                }}
              >
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 2, flexShrink: 0, color: 'inherit',
                    backgroundColor: isActive ? alpha(COLORS.primary, 0.12) : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Inter, sans-serif',
                    color: 'inherit', lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer card */}
      <Box
        sx={{
          mt: 2, p: 2, borderRadius: 3,
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1E3A5F 100%)`,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HelpOutlineRoundedIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }} />
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Clinical Portal v2.4
          </Typography>
        </Box>
        <Box
          component="button"
          sx={{
            width: '100%', py: 1, px: 1.5,
            borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.8125rem', fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.15s',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.14)' },
          }}
        >
          Contact Support
        </Box>
      </Box>
    </Box>
  );
}
