import { Box, Typography } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { C } from '../styles/theme';

type Role = 'patient' | 'doctor';

interface RoleSelectorProps {
  selected: Role;
  onChange: (role: Role) => void;
}

const roles: { id: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'patient', label: 'Patient', desc: 'Book & manage appointments', icon: <PersonOutlinedIcon sx={{ fontSize: 18 }} /> },
  { id: 'doctor', label: 'Doctor', desc: 'Manage your clinic & patients', icon: <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} /> },
];

export default function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
      {roles.map(({ id, label, desc, icon }) => {
        const active = selected === id;
        return (
          <Box
            key={id}
            component="button"
            onClick={() => onChange(id)}
            sx={{
              display: 'flex', alignItems: 'center',
              gap: 1.25, p: 1.25,
              border: `2px solid ${active ? C.blue : C.border}`,
              borderRadius: '10px',
              backgroundColor: active ? C.blueLight : '#fff',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
              position: 'relative',
              boxShadow: active ? `0 0 0 3px ${C.blue}10` : 'none',
              '&:hover': {
                borderColor: active ? C.blue : C.subtle,
                backgroundColor: active ? C.blueLight : C.surface,
              },
            }}
          >
            {active && (
              <Box sx={{ position: 'absolute', top: 7, right: 7 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: C.blue }} />
              </Box>
            )}
            <Box sx={{
              width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
              backgroundColor: active ? `${C.blue}18` : C.surface,
              border: `1px solid ${active ? `${C.blue}25` : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: active ? C.blue : C.slate,
            }}>
              {icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? C.blue : C.ink, lineHeight: 1 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: active ? C.blue : C.muted, lineHeight: 1.3, mt: 0.25 }}>
                {desc}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
