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
      { label: 'Dashboard',    icon: <GridViewIcon sx={{ fontSize: 16 }} />, path: '/dashboard' },
      { label: 'Appointments', icon: <CalendarIcon sx={{ fontSize: 16 }} />, path: '/appointments' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { label: 'AI Assistant', icon: <SparkleIcon sx={{ fontSize: 16 }} />, path: null, id: 'chat' },
      { label: 'Messages',     icon: <ChatIcon    sx={{ fontSize: 16 }} />, path: '/chat' },
      { label: 'Reports',      icon: <FolderIcon  sx={{ fontSize: 16 }} />, path: '/reports' },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 16 }} />, path: '/settings' },
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

export default function SideNavBar({ onChatClick, chatActive = false }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 220, flexShrink: 0, position: 'fixed',
        top: 0, left: 0, height: '100vh',
        backgroundColor: C.paper, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
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
              {group.items.map(({ label, icon, path, id }) => {
                const active = id === 'chat' ? chatActive : (path ? pathname === path : false);
                return (
                  <NavItem
                    key={label}
                    label={label}
                    icon={icon}
                    active={active}
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
    </Box>
  );
}
