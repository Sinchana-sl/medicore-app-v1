import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import ProfileAvatarMenu from './ProfileAvatarMenu';
import { C } from '../styles/theme';

interface AdminTopNavBarProps {
  title?: string;
  displayName?: string;
  email?: string;
}

export default function AdminTopNavBar({ title = 'Admin Panel', displayName = 'Admin', email = '' }: AdminTopNavBarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: { xs: 0, md: 240 }, width: { xs: '100%', md: 'calc(100% - 240px)' },
        backgroundColor: C.paper,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: 'none',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: '52px !important', px: { xs: 7, md: 3 }, justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: C.ink }}>{title}</Typography>
        <ProfileAvatarMenu displayName={displayName} email={email} />
      </Toolbar>
    </AppBar>
  );
}
