import { Box, Typography, Button, Chip, Avatar } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface AppointmentCardProps {
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  imageUrl: string;
  canJoin: boolean;
  status: string;
  consultationType?: string;
  paymentStatus?: string;
  amountPaise?: number;
  onPayNow?: () => void;
  onCancel?: () => void;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  VIDEO:     { label: 'Video',      icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />,  bg: '#fdf4ff', color: '#7e22ce' },
  AUDIO:     { label: 'Audio',      icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 11 }} />, bg: '#f0fdf4', color: '#15803d' },
  IN_PERSON: { label: 'In-Person',  icon: <PersonOutlinedIcon sx={{ fontSize: 11 }} />,    bg: '#eff6ff', color: '#1d4ed8' },
};

const STATUS_META: Record<string, { label: string; bg: string; color: string; dot: string; icon: React.ReactNode }> = {
  CONFIRMED:       { label: 'Confirmed',       bg: '#f0fdf4', color: '#15803d', dot: '#16a34a', icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} /> },
  PAYMENT_PENDING: { label: 'Awaiting Payment', bg: '#fffbeb', color: '#b45309', dot: '#d97706', icon: <WarningAmberIcon sx={{ fontSize: 13 }} /> },
  CANCELLED:       { label: 'Cancelled',        bg: '#fef2f2', color: '#b91c1c', dot: '#dc2626', icon: <EventBusyIcon sx={{ fontSize: 13 }} /> },
};

function getInitials(name: string) {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(' ').filter(Boolean);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

function getAvatarColor(name: string) {
  const colors = ['#0061a5', '#0891b2', '#7c3aed', '#0d9488', '#e11d48', '#b45309', '#1d4ed8'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

export default function AppointmentCard({
  doctorName, specialty, clinic, date, time, imageUrl, canJoin, status,
  consultationType = 'IN_PERSON', paymentStatus, amountPaise, onPayNow, onCancel,
}: AppointmentCardProps) {
  const isPendingPayment = status === 'PAYMENT_PENDING' && amountPaise && amountPaise > 0;
  const isCancelled = status === 'CANCELLED';
  const typeMeta = TYPE_META[consultationType] ?? TYPE_META.IN_PERSON;
  const statusMeta = STATUS_META[status] ?? { label: status, bg: '#f1f5f9', color: '#475569', dot: '#94a3b8', icon: null };
  const avatarBg = getAvatarColor(doctorName);

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: 3,
        border: `1px solid ${isCancelled ? '#fee2e2' : '#e8eef8'}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: isCancelled ? 0.75 : 1,
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': !isCancelled ? { borderColor: '#93c5fd', boxShadow: '0 6px 20px rgba(0,97,165,0.1)' } : {},
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: 3, background: isCancelled ? '#fca5a5' : 'linear-gradient(90deg, #0061a5, #0891b2)' }} />

      {/* Status + consultation type row */}
      <Box sx={{ px: 2.5, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Chip
          icon={statusMeta.icon as React.ReactElement}
          label={statusMeta.label}
          size="small"
          sx={{
            height: 22, fontSize: '0.65rem', fontWeight: 700,
            backgroundColor: statusMeta.bg, color: statusMeta.color,
            border: `1px solid ${statusMeta.color}33`,
            '& .MuiChip-icon': { color: 'inherit', fontSize: 13, ml: 0.5 },
          }}
        />
        <Chip
          icon={typeMeta.icon as React.ReactElement}
          label={typeMeta.label}
          size="small"
          sx={{
            height: 20, fontSize: '0.6rem', fontWeight: 700,
            backgroundColor: typeMeta.bg, color: typeMeta.color,
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Box>

      {/* Doctor info */}
      <Box sx={{ px: 2.5, pt: 1.75, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Avatar
          src={imageUrl}
          alt={doctorName}
          sx={{
            width: 46, height: 46, borderRadius: 2, flexShrink: 0,
            backgroundColor: avatarBg, fontSize: '0.875rem', fontWeight: 700,
          }}
        >
          {getInitials(doctorName)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', fontFamily: 'Manrope, sans-serif', lineHeight: 1.3 }}>
            {doctorName}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#0061a5', fontWeight: 600, mt: 0.25 }}>
            {specialty}
          </Typography>
          {clinic && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.375 }}>
              <LocationOnIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {clinic}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2.5, my: 1.75, height: '1px', backgroundColor: '#f1f5f9' }} />

      {/* Date & Time */}
      <Box sx={{ px: 2.5, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarMonthIcon sx={{ fontSize: 15, color: '#0061a5' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{date}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ScheduleIcon sx={{ fontSize: 15, color: '#0891b2' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{time}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment pending banner */}
      {isPendingPayment && (
        <Box sx={{ mx: 2.5, mt: 1.5, px: 1.5, py: 1, borderRadius: 2, backgroundColor: '#fffbeb', border: '1px dashed #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>Payment required</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#b45309' }}>Appointment reserved for 30 min</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#d97706', fontFamily: 'Manrope, sans-serif' }}>
            ₹{(amountPaise / 100).toLocaleString('en-IN')}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ px: 2.5, pt: 1.75, pb: 2.5, mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isPendingPayment && (
          <Button
            variant="contained"
            onClick={onPayNow}
            size="small"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
              borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', py: 0.875,
              boxShadow: 'none', color: '#fff',
              '&:hover': { background: 'linear-gradient(90deg, #d97706, #ea580c)', boxShadow: '0 3px 8px rgba(245,158,11,0.35)' },
            }}
          >
            Pay ₹{(amountPaise! / 100).toLocaleString('en-IN')} to Confirm
          </Button>
        )}

        {status === 'CONFIRMED' && (
          <Button
            variant="contained"
            disabled={!canJoin}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#0061a5', borderRadius: 2, fontWeight: 700,
              fontSize: '0.78rem', py: 0.875, boxShadow: 'none',
              '&:hover': { backgroundColor: '#004f8a', boxShadow: '0 3px 8px rgba(0,97,165,0.3)' },
              '&.Mui-disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            {canJoin ? 'Join Call' : 'Upcoming'}
          </Button>
        )}

        {!isCancelled && (
          <Button
            size="small"
            onClick={onCancel}
            fullWidth
            sx={{
              color: '#94a3b8', borderRadius: 2, border: '1px solid #e2e8f0',
              fontSize: '0.72rem', fontWeight: 600, py: 0.75,
              '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
            }}
          >
            Cancel Appointment
          </Button>
        )}
      </Box>
    </Box>
  );
}
