import { AppBar, Toolbar, Box, InputBase, IconButton, Badge, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import NotifIcon from '@mui/icons-material/NotificationsNoneRounded';
import { styled, alpha } from '@mui/material/styles';
import ProfileAvatarMenu from './ProfileAvatarMenu';
import { C } from '../styles/theme';

const Search = styled(Box)(() => ({
  display: 'flex', alignItems: 'center', gap: 6,
  backgroundColor: C.surface,
  borderRadius: 7,
  padding: '5px 10px',
  border: `1px solid ${C.border}`,
  width: 260,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&:focus-within': {
    borderColor: C.blue,
    boxShadow: `0 0 0 3px ${alpha(C.blue, 0.1)}`,
    backgroundColor: C.paper,
  },
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
      position="fixed"
      elevation={0}
      sx={{
        left: 220, width: 'calc(100% - 220px)',
        backgroundColor: C.paper,
        borderBottom: `1px solid ${C.border}`,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: '52px !important', px: 2.5, gap: 1.5, justifyContent: 'space-between' }}>
        <Search>
          <SearchIcon sx={{ fontSize: 15, color: C.muted, flexShrink: 0 }} />
          <InputBase
            placeholder="Search patients, records…"
            sx={{ fontSize: '0.8125rem', color: C.ink, flex: 1, '& input::placeholder': { color: C.muted } }}
          />
          <Box sx={{ fontSize: '0.625rem', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 1, px: 0.5, py: 0.25, lineHeight: 1, flexShrink: 0 }}>⌘K</Box>
        </Search>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Notifications" arrow>
            <IconButton size="medium" sx={{ color: C.slate }}>
              <Badge badgeContent={notificationCount || undefined} color="error">
                <NotifIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ width: 1, height: 18, backgroundColor: C.border, mx: 0.25 }} />
          <ProfileAvatarMenu displayName={displayName} email={email} onProfileClick={onProfileClick} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
