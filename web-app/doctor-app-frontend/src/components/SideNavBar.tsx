import { Box, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../styles/theme';
import { alpha } from '@mui/material/styles';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string | null;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    icon: <DashboardRoundedIcon sx={{ fontSize: 20 }} />,      path: '/dashboard',      section: 'Main' },
  { label: 'Appointments', icon: <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />,  path: '/appointments' },
  { label: 'AI Assistant', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />,    path: null },
  { label: 'Messages',     icon: <ForumRoundedIcon sx={{ fontSize: 20 }} />,          path: '/chat',           section: 'Communication' },
  { label: 'Reports',      icon: <FolderOpenRoundedIcon sx={{ fontSize: 20 }} />,     path: '/reports',        section: 'Health' },
  { label: 'Settings',     icon: <TuneRoundedIcon sx={{ fontSize: 20 }} />,           path: '/settings' },
];

interface Props {
  onChatClick?: () => void;
  chatActive?: boolean;
}

export default function SideNavBar({ onChatClick, chatActive = false }: Props) {
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
        width: 248,
        flexShrink: 0,
        position: 'fixed',
        top: 64,
        left: 0,
        height: 'calc(100vh - 64px)',
        backgroundColor: '#fff',
        borderRight: `1px solid ${COLORS.border}`,
        pt: 1.5,
        pb: 3,
        px: 1.5,
        zIndex: 40,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flex: 1 }}>
        {navItems.map(({ label, icon, path, section }) => {
          const isActive = path ? pathname === path : (label === 'AI Assistant' && chatActive);
          const showSection = section && section !== lastSection;
          if (section) lastSection = section;

          return (
            <Box key={label}>
              {showSection && renderSection(section!)}
              <Box
                component="button"
                onClick={() => {
                  if (label === 'AI Assistant') {
                    if (onChatClick) onChatClick();
                    else navigate('/dashboard', { state: { openChat: true } });
                  } else if (path) {
                    navigate(path);
                  }
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  width: '100%', px: 1.5, py: 1.125,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderRadius: 2.5,
                  position: 'relative',
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
                    width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                    color: 'inherit',
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
                    color: 'inherit',
                    lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
