import { Box, Button, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';

type Role = 'patient' | 'doctor';

interface RoleSelectorProps {
  selected: Role;
  onChange: (role: Role) => void;
}

const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
  { id: 'patient', label: 'Patient', icon: <PersonIcon /> },
  { id: 'doctor', label: 'Doctor', icon: <MedicalInformationIcon /> },
];

export default function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', mb: 3, width: '100%' }}>
      {roles.map(({ id, label, icon }) => {
        const isActive = selected === id;
        return (
          <Button
            key={id}
            onClick={() => onChange(id)}
            variant="outlined"
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              py: 1.5,
              px: 2,
              width: '100%',
              minWidth: 0,
              borderRadius: 2,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: isActive ? '#1a365d' : '#cbd5e0',
              backgroundColor: isActive ? 'rgba(26,54,93,0.06)' : 'transparent',
              color: isActive ? '#1a365d' : '#43474e',
              fontFamily: 'Inter, sans-serif',
              '&:hover': {
                borderWidth: '2px',
                borderColor: 'rgba(26,54,93,0.5)',
                backgroundColor: 'rgba(26,54,93,0.03)',
              },
            }}
          >
            {icon}
            <Typography
              component="span"
              sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'none' }}
            >
              {label}
            </Typography>
          </Button>
        );
      })}
    </Box>
  );
}
