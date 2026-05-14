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
    <Box sx={{ position: 'relative', pl: 4, borderLeft: '2px solid #E9E9E7' }}>
      {events.map(({ date, title, description, isActive }, i) => (
        <Box key={i} sx={{ position: 'relative', mb: i < events.length - 1 ? 6 : 0 }}>
          <Box
            sx={{
              position: 'absolute', left: -33, top: 4,
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: isActive ? '#0D9488' : '#C8C8C5',
              boxShadow: isActive ? '0 0 0 4px #F0FDFA' : '0 0 0 4px #F7F7F5',
            }}
          />
          <Typography
            fontSize="0.7rem" fontWeight={700} color={isActive ? '#0D9488' : '#9B9A97'}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}
          >
            {date}
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem" color="#002045">{title}</Typography>
          <Typography fontSize="0.875rem" color="#73726E" mt={0.5}>{description}</Typography>
        </Box>
      ))}
    </Box>
  );
}
