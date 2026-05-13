import { useState } from 'react';
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface ProfileAvatarMenuProps {
  displayName?: string;
  email?: string;
  onProfileClick?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileAvatarMenu({ displayName = '', email = '', onProfileClick }: ProfileAvatarMenuProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  function handleProfileClick() {
    setAnchor(null);
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate('/settings');
    }
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar
          sx={{
            width: 36, height: 36,
            backgroundColor: '#0061a5',
            fontSize: '0.8125rem',
            fontWeight: 700,
            fontFamily: 'Manrope, sans-serif',
            cursor: 'pointer',
            border: '2px solid #e2e8f0',
            '&:hover': { borderColor: '#0061a5' },
            transition: 'border-color 0.15s',
          }}
        >
          {displayName ? getInitials(displayName) : <PersonIcon sx={{ fontSize: 18 }} />}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1, minWidth: 220, borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
            {displayName || 'User'}
          </Typography>
          {email && (
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }} noWrap>
              {email}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem
          onClick={handleProfileClick}
          sx={{ py: 1.25, px: 2, gap: 1.5, fontSize: '0.875rem', color: '#334155' }}
        >
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <PersonIcon sx={{ fontSize: 18, color: '#64748b' }} />
          </ListItemIcon>
          My Profile
        </MenuItem>

        <MenuItem
          onClick={() => { setAnchor(null); navigate('/settings'); }}
          sx={{ py: 1.25, px: 2, gap: 1.5, fontSize: '0.875rem', color: '#334155' }}
        >
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <SettingsIcon sx={{ fontSize: 18, color: '#64748b' }} />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => { setAnchor(null); logout(); }}
          sx={{ py: 1.25, px: 2, gap: 1.5, fontSize: '0.875rem', color: '#dc2626' }}
        >
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <LogoutIcon sx={{ fontSize: 18, color: '#dc2626' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
