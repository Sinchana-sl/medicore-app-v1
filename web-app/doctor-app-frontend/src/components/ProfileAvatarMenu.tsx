import { useState } from 'react';
import { Avatar, Box, Divider, IconButton, Menu, MenuItem, Typography, Chip } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../styles/theme';

interface ProfileAvatarMenuProps {
  displayName?: string;
  email?: string;
  role?: string;
  onProfileClick?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRoleLabel(role?: string) {
  if (!role) return null;
  if (role === 'DOCTOR_ROLE') return 'Doctor';
  if (role === 'PATIENT_ROLE') return 'Patient';
  if (role === 'ADMIN_ROLE') return 'Admin';
  return null;
}

export default function ProfileAvatarMenu({ displayName = '', email = '', role, onProfileClick }: ProfileAvatarMenuProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const roleLabel = getRoleLabel(role ?? localStorage.getItem('role') ?? '');

  function handleProfileClick() {
    setAnchor(null);
    if (onProfileClick) onProfileClick();
    else navigate('/settings');
  }

  return (
    <>
      <Box
        component="button"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          border: `1px solid ${COLORS.border}`, borderRadius: 2.5,
          px: 1, py: 0.625, cursor: 'pointer',
          backgroundColor: 'transparent',
          transition: 'all 0.15s',
          '&:hover': { backgroundColor: COLORS.surface, borderColor: COLORS.borderDark },
        }}
      >
        <Avatar
          sx={{
            width: 30, height: 30,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          {displayName ? getInitials(displayName) : <PersonOutlineRoundedIcon sx={{ fontSize: 16 }} />}
        </Avatar>

        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.8125rem', fontWeight: 700,
              color: COLORS.textPrimary, fontFamily: 'Inter, sans-serif',
              lineHeight: 1.2, maxWidth: 120,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {displayName || 'User'}
          </Typography>
          {roleLabel && (
            <Typography sx={{ fontSize: '0.6875rem', color: COLORS.textMuted, fontWeight: 500, lineHeight: 1 }}>
              {roleLabel}
            </Typography>
          )}
        </Box>

        <KeyboardArrowDownRoundedIcon
          sx={{
            fontSize: 16, color: COLORS.textMuted,
            transform: anchor ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1, minWidth: 240, borderRadius: 3,
              boxShadow: '0 10px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)',
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
              p: 0.75,
            },
          },
        }}
      >
        {/* Profile header */}
        <Box sx={{ px: 1.5, py: 1.25, mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40, height: 40,
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                fontSize: '0.875rem', fontWeight: 700,
              }}
            >
              {displayName ? getInitials(displayName) : '?'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: '0.875rem', color: COLORS.textPrimary, fontFamily: 'Manrope, sans-serif', lineHeight: 1.3 }}
              >
                {displayName || 'User'}
              </Typography>
              {email && (
                <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mt: 0.1 }} noWrap>
                  {email}
                </Typography>
              )}
              {roleLabel && (
                <Chip
                  label={roleLabel}
                  size="small"
                  sx={{
                    mt: 0.5, height: 18, fontSize: '0.6875rem',
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primaryDark,
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, mx: -0.75 }} />

        <Box sx={{ mt: 0.5 }}>
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              borderRadius: 2, py: 1.125, px: 1.5, gap: 1.5,
              fontSize: '0.875rem', color: COLORS.textPrimary, fontWeight: 500,
              '&:hover': { backgroundColor: COLORS.surface },
            }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: COLORS.primary }} />
            </Box>
            My Profile
          </MenuItem>

          <MenuItem
            onClick={() => { setAnchor(null); navigate('/settings'); }}
            sx={{
              borderRadius: 2, py: 1.125, px: 1.5, gap: 1.5,
              fontSize: '0.875rem', color: COLORS.textPrimary, fontWeight: 500,
              '&:hover': { backgroundColor: COLORS.surface },
            }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TuneRoundedIcon sx={{ fontSize: 18, color: COLORS.success }} />
            </Box>
            Settings
          </MenuItem>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, my: 0.5, mx: -0.75 }} />

        <MenuItem
          onClick={() => { setAnchor(null); logout(); }}
          sx={{
            borderRadius: 2, py: 1.125, px: 1.5, gap: 1.5,
            fontSize: '0.875rem', color: COLORS.error, fontWeight: 600,
            '&:hover': { backgroundColor: '#FEF2F2' },
          }}
        >
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoutRoundedIcon sx={{ fontSize: 18, color: COLORS.error }} />
          </Box>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
