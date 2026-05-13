import { Box, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridViewRounded';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import SparkleIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FolderIcon from '@mui/icons-material/FolderOpenOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../styles/theme';
import BrandLogo from './BrandLogo';

interface NavGroup {
  section?: string;
  items: { label: string; icon: React.ReactNode; path: string | null; id?: string }[];
}

const GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard',    icon: <GridViewIcon sx={{ fontSize: 15 }} />, path: '/dashboard' },
      { label: 'Appointments', icon: <CalendarIcon sx={{ fontSize: 15 }} />, path: '/appointments' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { label: 'AI Assistant', icon: <SparkleIcon sx={{ fontSize: 15 }} />, path: null, id: 'chat' },
      { label: 'Messages',     icon: <ChatIcon    sx={{ fontSize: 15 }} />, path: '/chat' },
      { label: 'Reports',      icon: <FolderIcon  sx={{ fontSize: 15 }} />, path: '/reports' },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 15 }} />, path: '/settings' },
    ],
  },
];

interface Props {
  onChatClick?: () => void;
  chatActive?: boolean;
}

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

export default function SideNavBar({ onChatClick, chatActive = false }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
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
      {/* Logo */}
      <Box sx={{
        height: 52, display: 'flex', alignItems: 'center', px: 2,
        borderBottom: `1px solid ${C.sidebarBorder}`, flexShrink: 0,
      }}>
        <BrandLogo />
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
              {group.items.map(({ label, icon, path, id }) => {
                const active = id === 'chat'
                  ? chatActive
                  : (path ? (pathname === path || (pathname.startsWith(path) && path !== '/dashboard')) : false);
                return (
                  <NavItem
                    key={label} label={label} icon={icon} active={active}
                    onClick={() => {
                      if (id === 'chat') { if (onChatClick) onChatClick(); else navigate('/dashboard', { state: { openChat: true } }); }
                      else if (path) navigate(path);
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 1, py: 1.25, borderTop: `1px solid ${C.sidebarBorder}`, flexShrink: 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75,
          borderRadius: '4px', cursor: 'default',
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.6875rem', color: C.muted, fontWeight: 400 }}>
            All systems operational
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
