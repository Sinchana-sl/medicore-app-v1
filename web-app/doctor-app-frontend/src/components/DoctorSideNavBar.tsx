import { Box, List, ListItemButton, ListItemIcon, ListItemText, Button, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GridViewIcon from '@mui/icons-material/GridView';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard',    icon: <DashboardIcon />,        path: '/doctor-dashboard' },
  { label: 'Appointments', icon: <CalendarTodayIcon />,    path: '/doctor/appointments' },
  { label: 'Clinics',      icon: <LocalHospitalIcon />,    path: '/doctor/clinics' },
  { label: 'Availability', icon: <EventAvailableIcon />,   path: '/doctor/availability' },
  { label: 'Slots',        icon: <GridViewIcon />,          path: '/doctor/slots' },
  { label: 'Schedule',     icon: <AccessTimeIcon />,        path: '/doctor/schedule' },
  { label: 'Chat',         icon: <ChatBubbleIcon />,        path: '/doctor/chat' },
  { label: 'Profile',      icon: <PersonIcon />,            path: '/doctor/profile' },
];

export default function DoctorSideNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 240, flexShrink: 0, position: 'fixed',
        top: 64, left: 0, height: 'calc(100vh - 64px)',
        backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0',
        pt: 2, pb: 3, px: 1.5,
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        zIndex: 40,
      }}
    >
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
        {navItems.map(({ label, icon, path }) => {
          const isActive = pathname === path;
          return (
            <ListItemButton
              key={label}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 2, px: 2, py: 1.5,
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1e3a8a' : '#64748b',
                '&:hover': { backgroundColor: isActive ? '#eff6ff' : '#f8fafc' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2, backgroundColor: '#1a365d', borderRadius: 3, mt: 2 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
          Clinical Portal v2.4
        </Typography>
        <Button fullWidth sx={{ backgroundColor: '#2d476f', color: '#ffffff', borderRadius: 2, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif', py: 1, '&:hover': { backgroundColor: '#1e3a8a' } }}>
          Support Center
        </Button>
      </Box>
    </Box>
  );
}
