import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { C } from '../styles/theme';

type Role = 'patient' | 'doctor';

interface RoleSelectorProps {
  selected: Role;
  onChange: (role: Role) => void;
}

const roles: { id: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'patient', label: 'Patient', desc: 'Book & manage appointments', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
  { id: 'doctor', label: 'Doctor', desc: 'Manage your clinic', icon: <MedicalInformationIcon sx={{ fontSize: 18 }} /> },
];

export default function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
      {roles.map(({ id, label, desc, icon }) => {
        const active = selected === id;
        return (
          <Box
            key={id}
            component="button"
            onClick={() => onChange(id)}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 0.5, p: 1.25,
              border: `1.5px solid ${active ? C.blue : C.border}`,
              borderRadius: 2,
              backgroundColor: active ? C.blueLight : C.paper,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
              '&:hover': { borderColor: active ? C.blue : C.subtle, backgroundColor: active ? C.blueLight : C.surface },
            }}
          >
            <Box sx={{ color: active ? C.blue : C.slate }}>{icon}</Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: active ? C.blue : C.ink, fontFamily: 'Inter, sans-serif' }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: active ? C.blue : C.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
              {desc}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
