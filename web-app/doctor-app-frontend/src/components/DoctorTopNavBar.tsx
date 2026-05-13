import { AppBar, Toolbar, Box, InputBase, IconButton, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { styled } from '@mui/material/styles';
import ProfileAvatarMenu from './ProfileAvatarMenu';

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  borderRadius: 24,
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  maxWidth: 400,
  flex: 1,
  [theme.breakpoints.down('md')]: { display: 'none' },
}));

interface DoctorTopNavBarProps {
  displayName?: string;
  email?: string;
  onProfileClick?: () => void;
}

export default function DoctorTopNavBar({ displayName = '', email = '', onProfileClick }: DoctorTopNavBarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
          <Box sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>
            MediConnect
          </Box>
          <SearchBox>
            <SearchIcon sx={{ color: '#94a3b8', mr: 1, fontSize: '1.25rem' }} />
            <InputBase
              placeholder="Search patients, records..."
              sx={{ flex: 1, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}
            />
          </SearchBox>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <IconButton sx={{ color: '#64748b' }}>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <ProfileAvatarMenu displayName={displayName} email={email} onProfileClick={onProfileClick} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
