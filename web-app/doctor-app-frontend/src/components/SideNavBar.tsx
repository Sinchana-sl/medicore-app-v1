import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ForumIcon from '@mui/icons-material/Forum';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  onChatClick?: () => void;
  chatActive?: boolean;
}

// path: null  → handled by onClick logic (not a route)
const navItems = [
  { label: 'Dashboard',    icon: <DashboardIcon />,     path: '/dashboard' },
  { label: 'Appointments', icon: <CalendarTodayIcon />, path: '/appointments' },
  { label: 'Chat',         icon: <ChatBubbleIcon />,    path: null },          // AI ChatBot
  { label: 'Messages',     icon: <ForumIcon />,         path: '/chat' },       // Real-time doctor chat
  { label: 'Reports',      icon: <AssessmentIcon />,    path: '/reports' },
  { label: 'Settings',     icon: <SettingsIcon />,      path: '/settings' },
];

export default function SideNavBar({ onChatClick, chatActive = false }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        position: 'fixed',
        top: 64,
        left: 0,
        height: 'calc(100vh - 64px)',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        pt: 2,
        pb: 3,
        px: 1.5,
        zIndex: 40,
      }}
    >
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map(({ label, icon, path }) => {
          const isActive = path ? pathname === path : (label === 'Chat' && chatActive);
          return (
            <ListItemButton
              key={label}
              onClick={() => {
                if (label === 'Chat') {
                  if (onChatClick) {
                    onChatClick();
                  } else {
                    navigate('/dashboard', { state: { openChat: true } });
                  }
                } else if (path) {
                  navigate(path);
                }
              }}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1.5,
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1e3a8a' : '#64748b',
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                '&:hover': { backgroundColor: isActive ? '#eff6ff' : '#f8fafc' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
