import { useState } from 'react';
import { Avatar, Box, Divider, Menu, MenuItem, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { logout, getRole } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { C } from '../styles/theme';

interface Props {
  displayName?: string;
  email?: string;
  onProfileClick?: () => void;
}

function initials(name: string) {
  const p = name.trim().split(' ').filter(Boolean);
  if (!p.length) return '?';
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function ProfileAvatarMenu({ displayName = '', email = '', onProfileClick }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const isDoctor = getRole() === 'DOCTOR_ROLE';
  const settingsPath = isDoctor ? '/doctor/profile' : '/settings';
  const profilePath  = isDoctor ? '/doctor/profile' : '/settings';

  const close = () => setAnchor(null);

  return (
    <>
      <Box
        component="button"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          border: 'none', background: 'none', cursor: 'pointer',
          borderRadius: 8, px: 0.75, py: 0.5,
          '&:hover': { backgroundColor: C.borderSub },
          transition: 'background 0.1s',
        }}
      >
        <Avatar
          sx={{
            width: 26, height: 26,
            backgroundColor: C.blue,
            fontSize: '0.625rem', fontWeight: 600, borderRadius: '6px',
          }}
        >
          {displayName ? initials(displayName) : <PersonIcon sx={{ fontSize: 14 }} />}
        </Avatar>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.ink, display: { xs: 'none', sm: 'block' } }}>
          {displayName || 'Account'}
        </Typography>
      </Box>

      <Menu
        anchorEl={anchor} open={Boolean(anchor)} onClose={close}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 210 } } }}
      >
        <Box sx={{ px: 1.5, py: 1.25 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.ink }}>{displayName || 'User'}</Typography>
          {email && <Typography sx={{ fontSize: '0.75rem', color: C.muted, mt: 0.125 }} noWrap>{email}</Typography>}
        </Box>

        <Divider />

        <MenuItem onClick={() => { close(); if (onProfileClick) onProfileClick(); else navigate(profilePath); }} sx={{ gap: 1.25 }}>
          <PersonIcon sx={{ fontSize: 15, color: C.slate }} /> My Profile
        </MenuItem>
        <MenuItem onClick={() => { close(); navigate(settingsPath); }} sx={{ gap: 1.25 }}>
          <SettingsIcon sx={{ fontSize: 15, color: C.slate }} /> Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => { close(); logout(); }} sx={{ gap: 1.25, color: `${C.red} !important`, '&:hover': { backgroundColor: C.redBg } }}>
          <LogoutIcon sx={{ fontSize: 15, color: C.red }} /> Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
