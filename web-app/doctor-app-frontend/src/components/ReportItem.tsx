import { Box, Typography, Chip, IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicationIcon from '@mui/icons-material/Medication';
import DownloadIcon from '@mui/icons-material/Download';

type ReportStatus = 'Ready' | 'Pending';

interface ReportItemProps {
  title: string;
  subtitle: string;
  type: 'pdf' | 'doc' | 'prescription';
  status: ReportStatus;
}

const iconMap = {
  pdf:          { icon: <PictureAsPdfIcon sx={{ fontSize: 18 }} />, bg: '#fef2f2', color: '#dc2626' },
  doc:          { icon: <DescriptionIcon sx={{ fontSize: 18 }} />,  bg: '#F0FDFA', color: '#2563eb' },
  prescription: { icon: <MedicationIcon sx={{ fontSize: 18 }} />,  bg: '#faf5ff', color: '#9333ea' },
};

const statusStyles: Record<ReportStatus, { bg: string; color: string }> = {
  Ready:   { bg: '#f0fdf4', color: '#15803d' },
  Pending: { bg: '#fffbeb', color: '#b45309' },
};

export default function ReportItem({ title, subtitle, type, status }: ReportItemProps) {
  const { icon, bg, color } = iconMap[type];
  const { bg: chipBg, color: chipColor } = statusStyles[status];

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        p: 1.75, borderRadius: 2.5,
        border: '1px solid #F1F0EF',
        backgroundColor: '#fafbfd',
        gap: 1.5,
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': { backgroundColor: '#f0f7ff', borderColor: '#dbeafe' },
      }}
    >
      {/* Left: icon + text */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 38, height: 38, flexShrink: 0,
            backgroundColor: bg, color,
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9B9A97', mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Right: status + download */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Chip
          label={status}
          size="small"
          sx={{ backgroundColor: chipBg, color: chipColor, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', height: 22 }}
        />
        <IconButton
          size="small"
          disabled={status === 'Pending'}
          sx={{ color: status === 'Pending' ? '#C8C8C5' : '#9B9A97', '&:hover': { color: '#0D9488', backgroundColor: '#F0FDFA' } }}
        >
          <DownloadIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
