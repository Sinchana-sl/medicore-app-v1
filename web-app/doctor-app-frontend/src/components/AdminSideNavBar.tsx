import { useState } from 'react';
import { Box, Typography, Drawer, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/GridViewRounded';
import PeopleIcon from '@mui/icons-material/PeopleOutlineRounded';
import DoctorIcon from '@mui/icons-material/LocalHospitalOutlined';
import ClinicIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineRounded';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../styles/theme';
import BrandLogo from './BrandLogo';

interface NavItem { label: string; icon: React.ReactNode; path: string; }
interface NavGroup { section?: string; items: NavItem[]; }

const GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard',    icon: <DashboardIcon sx={{ fontSize: 15 }} />, path: '/admin' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Users',        icon: <PeopleIcon   sx={{ fontSize: 15 }} />, path: '/admin/users' },
      { label: 'Doctors',      icon: <DoctorIcon   sx={{ fontSize: 15 }} />, path: '/admin/doctors' },
      { label: 'Clinics',      icon: <ClinicIcon   sx={{ fontSize: 15 }} />, path: '/admin/clinics' },
      { label: 'Appointments', icon: <CalendarIcon sx={{ fontSize: 15 }} />, path: '/admin/appointments' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Revenue',      icon: <PaymentsIcon sx={{ fontSize: 15 }} />, path: '/admin/revenue' },
    ],
  },
];

function NavItem({ label, icon, active, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
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
        '&:hover': { backgroundColor: C.sidebarHover, color: C.sidebarActiveText },
        flexShrink: 0,
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', color: 'inherit' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: active ? 500 : 400, color: 'inherit', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function AdminSideNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

  const navContent = (onItemClick?: () => void) => (
    <>
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

      <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
        <Box sx={{
          px: 1, py: 0.5, borderRadius: '4px',
          backgroundColor: '#8b5cf618',
          display: 'inline-flex', alignItems: 'center', gap: 0.5,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5, display: 'flex', flexDirection: 'column' }}>
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
              {group.items.map(({ label, icon, path }) => (
                <NavItem
                  key={label} label={label} icon={icon} active={isActive(path)}
                  onClick={() => { onItemClick?.(); navigate(path); }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

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
