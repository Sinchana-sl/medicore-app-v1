import { Box, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridViewRounded';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineRounded';
import AvailIcon from '@mui/icons-material/EventAvailableOutlined';
import HospitalIcon from '@mui/icons-material/LocalHospitalOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ClockIcon from '@mui/icons-material/AccessTimeOutlined';
import SlotIcon from '@mui/icons-material/ViewWeekOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../styles/theme';
import BrandLogo from './BrandLogo';

interface NavGroup {
  section?: string;
  items: { label: string; icon: React.ReactNode; path: string }[];
}

const GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard',    icon: <GridViewIcon sx={{ fontSize: 16 }} />, path: '/doctor-dashboard' },
      { label: 'Appointments', icon: <CalendarIcon sx={{ fontSize: 16 }} />, path: '/doctor/appointments' },
    ],
  },
  {
    section: 'Practice',
    items: [
      { label: 'Schedule',     icon: <ClockIcon    sx={{ fontSize: 16 }} />, path: '/doctor/schedule' },
      { label: 'Availability', icon: <AvailIcon    sx={{ fontSize: 16 }} />, path: '/doctor/availability' },
      { label: 'Slots',        icon: <SlotIcon     sx={{ fontSize: 16 }} />, path: '/doctor/slots' },
      { label: 'Clinics',      icon: <HospitalIcon sx={{ fontSize: 16 }} />, path: '/doctor/clinics' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Messages', icon: <ChatIcon   sx={{ fontSize: 16 }} />, path: '/doctor/chat' },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Profile', icon: <PersonIcon sx={{ fontSize: 16 }} />, path: '/doctor/profile' },
    ],
  },
];

function NavItem({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        width: '100%', height: 32, px: 1.25,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        borderRadius: '6px',
        backgroundColor: active ? C.blueLight : 'transparent',
        color: active ? C.blue : C.slate,
        transition: 'background 0.1s, color 0.1s',
        '&:hover': { backgroundColor: active ? C.blueLight : C.borderSub, color: active ? C.blue : C.ink },
        flexShrink: 0,
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', color: 'inherit' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: 'inherit', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function DoctorSideNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 220, flexShrink: 0, position: 'fixed',
        top: 0, left: 0, height: '100vh',
        backgroundColor: C.paper, borderRight: `1px solid ${C.border}`,
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        zIndex: 1200,
      }}
    >
      {/* Logo */}
      <Box sx={{ height: 52, display: 'flex', alignItems: 'center', px: 2, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <BrandLogo />
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {GROUPS.map((group, gi) => (
          <Box key={gi} sx={{ mb: 0.5 }}>
            {group.section && (
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, px: 1.25, py: 0.875, display: 'block' }}>
                {group.section}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {group.items.map(({ label, icon, path }) => {
                const active = pathname === path || (pathname.startsWith(path) && path !== '/doctor-dashboard');
                return (
                  <NavItem key={label} label={label} icon={icon} active={active} onClick={() => navigate(path)} />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Box
          component="button"
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            width: '100%', height: 32, px: 1.25,
            border: 'none', cursor: 'pointer',
            borderRadius: '6px', backgroundColor: 'transparent',
            color: C.muted,
            '&:hover': { backgroundColor: C.borderSub, color: C.slate },
            transition: 'all 0.1s',
          }}
        >
          <HelpIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Help & Support</Typography>
        </Box>
      </Box>
    </Box>
  );
}
