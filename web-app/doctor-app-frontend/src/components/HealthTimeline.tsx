import { Box, Typography } from '@mui/material';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  isActive?: boolean;
}

interface HealthTimelineProps {
  events: TimelineEvent[];
}

export default function HealthTimeline({ events }: HealthTimelineProps) {
  return (
    <Box sx={{ position: 'relative', pl: 4, borderLeft: '2px solid #e2e8f0' }}>
      {events.map(({ date, title, description, isActive }, i) => (
        <Box key={i} sx={{ position: 'relative', mb: i < events.length - 1 ? 6 : 0 }}>
          <Box
            sx={{
              position: 'absolute', left: -33, top: 4,
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: isActive ? '#0061a5' : '#cbd5e1',
              boxShadow: isActive ? '0 0 0 4px #eff6ff' : '0 0 0 4px #f8fafc',
            }}
          />
          <Typography
            fontSize="0.7rem" fontWeight={700} color={isActive ? '#0061a5' : '#94a3b8'}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}
          >
            {date}
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem" color="#002045">{title}</Typography>
          <Typography fontSize="0.875rem" color="#64748b" mt={0.5}>{description}</Typography>
        </Box>
      ))}
    </Box>
  );
}
