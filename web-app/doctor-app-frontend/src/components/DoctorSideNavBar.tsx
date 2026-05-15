import { useState } from 'react';
import { Box, Typography, Drawer, IconButton } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridViewRounded';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineRounded';
import AvailIcon from '@mui/icons-material/EventAvailableOutlined';
import HospitalIcon from '@mui/icons-material/LocalHospitalOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ClockIcon from '@mui/icons-material/AccessTimeOutlined';
import SlotIcon from '@mui/icons-material/ViewWeekOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineRounded';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
      { label: 'Dashboard',    icon: <GridViewIcon sx={{ fontSize: 15 }} />, path: '/doctor-dashboard' },
      { label: 'Appointments', icon: <CalendarIcon sx={{ fontSize: 15 }} />, path: '/doctor/appointments' },
    ],
  },
  {
    section: 'Practice',
    items: [
      { label: 'Schedule',     icon: <ClockIcon    sx={{ fontSize: 15 }} />, path: '/doctor/schedule' },
      { label: 'Availability', icon: <AvailIcon    sx={{ fontSize: 15 }} />, path: '/doctor/availability' },
      { label: 'Slots',        icon: <SlotIcon     sx={{ fontSize: 15 }} />, path: '/doctor/slots' },
      { label: 'Clinics',      icon: <HospitalIcon sx={{ fontSize: 15 }} />, path: '/doctor/clinics' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Messages', icon: <ChatIcon   sx={{ fontSize: 15 }} />, path: '/doctor/chat' },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Profile', icon: <PersonIcon sx={{ fontSize: 15 }} />, path: '/doctor/profile' },
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
        width: '100%', height: 30, px: 1.25,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        borderRadius: '4px',
        backgroundColor: active ? C.sidebarActive : 'transparent',
        color: active ? C.sidebarActiveText : C.sidebarText,
        transition: 'background-color 0.1s ease, color 0.1s ease',
        '&:hover': {
          backgroundColor: C.sidebarHover,
          color: C.sidebarActiveText,
        },
        flexShrink: 0,
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', color: 'inherit' }}>{icon}</Box>
      <Typography sx={{
        fontSize: '0.8125rem', fontWeight: active ? 500 : 400,
        color: 'inherit', lineHeight: 1,
      }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function DoctorSideNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (onItemClick?: () => void) => (
    <>
      {/* Logo */}
      <Box sx={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2,
        borderBottom: `1px solid ${C.sidebarBorder}`, flexShrink: 0,
      }}>
        <BrandLogo />
        {onItemClick && (
          <IconButton size="small" onClick={onItemClick} sx={{ color: C.muted }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.5, display: 'flex', flexDirection: 'column' }}>
        {GROUPS.map((group, gi) => (
          <Box key={gi} sx={{ mb: 0.5 }}>
            {group.section && (
              <Typography sx={{
                fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: C.muted,
                px: 1.25, pt: 1.25, pb: 0.625, display: 'block',
              }}>
                {group.section}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.125 }}>
              {group.items.map(({ label, icon, path }) => {
                const active = pathname === path || (pathname.startsWith(path) && path !== '/doctor-dashboard');
                return (
                  <NavItem
                    key={label} label={label} icon={icon} active={active}
                    onClick={() => { onItemClick?.(); navigate(path); }}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 1, py: 1.25, borderTop: `1px solid ${C.sidebarBorder}`, flexShrink: 0 }}>
        <Box
          component="button"
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            width: '100%', height: 30, px: 1.25,
            border: 'none', cursor: 'pointer', borderRadius: '4px',
            backgroundColor: 'transparent', color: C.muted,
            '&:hover': { backgroundColor: C.sidebarHover, color: C.sidebarActiveText },
          }}
        >
          <HelpIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400 }}>Help & support</Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {/* Hamburger button — mobile only */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed', top: 10, left: 12,
          zIndex: 1300, backgroundColor: C.paper,
          border: `1px solid ${C.border}`,
          borderRadius: '8px', width: 36, height: 36,
          color: C.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          '&:hover': { backgroundColor: C.surface },
        }}
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 240, backgroundColor: C.sidebarBg,
            borderRight: `1px solid ${C.sidebarBorder}`,
            display: 'flex', flexDirection: 'column',
          },
        }}
      >
        {navContent(() => setMobileOpen(false))}
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="nav"
        sx={{
          width: 240, flexShrink: 0, position: 'fixed',
          top: 0, left: 0, height: '100vh',
          backgroundColor: C.sidebarBg,
          borderRight: `1px solid ${C.sidebarBorder}`,
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          zIndex: 1200,
        }}
      >
        {navContent()}
      </Box>
    </>
  );
}
