import { AppBar, Toolbar, Box, InputBase, IconButton, Badge, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import NotifIcon from '@mui/icons-material/NotificationsNoneRounded';
import { styled } from '@mui/material/styles';
import ProfileAvatarMenu from './ProfileAvatarMenu';
import { C } from '../styles/theme';

const SearchBox = styled(Box)(() => ({
  display: 'flex', alignItems: 'center', gap: 8,
  backgroundColor: C.surface,
  borderRadius: 6,
  padding: '5px 10px',
  border: `1px solid ${C.border}`,
  width: 260,
  cursor: 'text',
  transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
  '&:focus-within': {
    borderColor: C.blue,
    boxShadow: `0 0 0 2px rgba(13,148,136,0.12)`,
    backgroundColor: C.paper,
  },
}));

interface TopNavBarProps {
  displayName?: string;
  email?: string;
  onProfileClick?: () => void;
  notificationCount?: number;
}

export default function TopNavBar({ displayName = '', email = '', onProfileClick, notificationCount = 0 }: TopNavBarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: 240, width: 'calc(100% - 240px)',
        backgroundColor: C.paper,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: 'none',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: '52px !important', px: 3, gap: 2, justifyContent: 'space-between' }}>
        <SearchBox>
          <SearchIcon sx={{ fontSize: 14, color: C.muted, flexShrink: 0 }} />
          <InputBase
            placeholder="Search…"
            sx={{ fontSize: '0.8125rem', color: C.ink, flex: 1, '& input::placeholder': { color: C.muted } }}
          />
          <Box sx={{
            display: 'flex', alignItems: 'center', flexShrink: 0,
            px: 0.625, py: 0.25, borderRadius: '3px',
            border: `1px solid ${C.border}`, backgroundColor: C.surface,
          }}>
            <Box component="span" sx={{ fontSize: '0.625rem', color: C.muted, lineHeight: 1, fontWeight: 500 }}>⌘K</Box>
          </Box>
        </SearchBox>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Tooltip title="Notifications" arrow>
            <IconButton size="small" sx={{ color: C.slate }}>
              <Badge badgeContent={notificationCount || undefined} color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.5rem', minWidth: 14, height: 14 } }}>
                <NotifIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ width: 1, height: 18, backgroundColor: C.border, mx: 0.75 }} />
          <ProfileAvatarMenu displayName={displayName} email={email} onProfileClick={onProfileClick} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
