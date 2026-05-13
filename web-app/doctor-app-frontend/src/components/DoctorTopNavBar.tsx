import { AppBar, Toolbar, Box, InputBase, IconButton, Badge, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { styled } from '@mui/material/styles';
import ProfileAvatarMenu from './ProfileAvatarMenu';
import BrandLogo from './BrandLogo';
import { COLORS } from '../styles/theme';

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: COLORS.surface,
  borderRadius: 10,
  padding: '8px 14px',
  border: `1px solid ${COLORS.border}`,
  maxWidth: 360,
  flex: 1,
  gap: 8,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&:focus-within': {
    borderColor: COLORS.primary,
    boxShadow: `0 0 0 3px rgba(37,99,235,0.1)`,
    backgroundColor: '#fff',
  },
  [theme.breakpoints.down('md')]: { display: 'none' },
}));

interface DoctorTopNavBarProps {
  displayName?: string;
  email?: string;
  onProfileClick?: () => void;
  notificationCount?: number;
}

export default function DoctorTopNavBar({ displayName = '', email = '', onProfileClick, notificationCount = 3 }: DoctorTopNavBarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${COLORS.border}`,
        boxShadow: '0 1px 0 rgba(15,23,42,0.06)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: 64, gap: 2 }}>
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minWidth: 0 }}>
          <Box sx={{ flexShrink: 0 }}>
            <BrandLogo iconSize="small" />
          </Box>
          <SearchBox>
            <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 18, flexShrink: 0 }} />
            <InputBase
              placeholder="Search patients, appointments, records…"
              sx={{
                flex: 1, fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                color: COLORS.textPrimary,
                '& input::placeholder': { color: COLORS.textMuted },
              }}
            />
          </SearchBox>
        </Box>

        {/* Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Notifications" arrow>
            <IconButton
              sx={{
                width: 38, height: 38, borderRadius: 2,
                color: COLORS.textSecondary,
                '&:hover': { backgroundColor: COLORS.surface, color: COLORS.primary },
                transition: 'all 0.15s',
              }}
            >
              <Badge
                badgeContent={notificationCount || undefined}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 17, height: 17 } }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 24, backgroundColor: COLORS.border, mx: 0.5 }} />

          <ProfileAvatarMenu displayName={displayName} email={email} onProfileClick={onProfileClick} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
