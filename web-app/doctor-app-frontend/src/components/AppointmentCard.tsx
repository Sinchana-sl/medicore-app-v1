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
import { C } from '../styles/theme';

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
  VIDEO:     { label: 'Video',     icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />,   bg: C.purpleBg, color: C.purple },
  AUDIO:     { label: 'Audio',     icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 11 }} />, bg: C.greenBg,  color: C.green },
  IN_PERSON: { label: 'In-Person', icon: <PersonOutlinedIcon sx={{ fontSize: 11 }} />,     bg: C.blueLight, color: C.blue },
};

const STATUS_META: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  CONFIRMED:       { label: 'Confirmed',        bg: C.greenBg,  color: C.green,  icon: <CheckCircleOutlineIcon sx={{ fontSize: 12 }} /> },
  PAYMENT_PENDING: { label: 'Awaiting Payment', bg: C.amberBg,  color: C.amber,  icon: <WarningAmberIcon sx={{ fontSize: 12 }} /> },
  CANCELLED:       { label: 'Cancelled',        bg: C.redBg,    color: C.red,    icon: <EventBusyIcon sx={{ fontSize: 12 }} /> },
};

function getInitials(name: string) {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(' ').filter(Boolean);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

const AVATAR_COLORS = [C.blue, C.purple, '#E11D48', C.amber, '#0891B2', '#16A34A'];
function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function AppointmentCard({
  doctorName, specialty, clinic, date, time, imageUrl, canJoin, status,
  consultationType = 'IN_PERSON', amountPaise, onPayNow, onCancel,
}: AppointmentCardProps) {
  const isPendingPayment = status === 'PAYMENT_PENDING' && amountPaise && amountPaise > 0;
  const isCancelled = status === 'CANCELLED';
  const typeMeta = TYPE_META[consultationType] ?? TYPE_META.IN_PERSON;
  const statusMeta = STATUS_META[status] ?? { label: status, bg: C.borderSub, color: C.slate, icon: null };

  return (
    <Box
      sx={{
        backgroundColor: C.paper,
        borderRadius: '8px',
        border: `1px solid ${isCancelled ? '#FECACA' : C.border}`,
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: isCancelled ? 0.65 : 1,
        transition: 'background-color 0.1s ease, border-color 0.1s ease',
        '&:hover': !isCancelled ? { backgroundColor: C.surface, borderColor: C.subtle } : {},
      }}
    >
      {/* Status + type badges */}
      <Box sx={{ px: 2, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Chip
          icon={statusMeta.icon as React.ReactElement}
          label={statusMeta.label}
          size="small"
          sx={{
            height: 20, fontSize: '0.5875rem', fontWeight: 600,
            backgroundColor: statusMeta.bg, color: statusMeta.color,
            border: `1px solid ${statusMeta.color}28`,
            '& .MuiChip-icon': { color: 'inherit', fontSize: 12, ml: 0.5 },
          }}
        />
        <Chip
          icon={typeMeta.icon as React.ReactElement}
          label={typeMeta.label}
          size="small"
          sx={{
            height: 20, fontSize: '0.5875rem', fontWeight: 600,
            backgroundColor: typeMeta.bg, color: typeMeta.color,
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Box>

      {/* Doctor info */}
      <Box sx={{ px: 2, pt: 1.5, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        <Avatar
          src={imageUrl}
          alt={doctorName}
          sx={{
            width: 38, height: 38, borderRadius: '6px', flexShrink: 0,
            backgroundColor: getAvatarColor(doctorName),
            fontSize: '0.8125rem', fontWeight: 600,
          }}
        >
          {getInitials(doctorName)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: C.ink, lineHeight: 1.3 }}>
            {doctorName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: C.blue, fontWeight: 500, mt: 0.25 }}>
            {specialty}
          </Typography>
          {clinic && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.25 }}>
              <LocationOnIcon sx={{ fontSize: 10, color: C.muted, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.6875rem', color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {clinic}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2, my: 1.5, height: '1px', backgroundColor: C.border }} />

      {/* Date & time */}
      <Box sx={{ px: 2, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CalendarMonthIcon sx={{ fontSize: 13, color: C.muted }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.ink }}>{date}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ScheduleIcon sx={{ fontSize: 13, color: C.muted }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.ink }}>{time}</Typography>
        </Box>
      </Box>

      {/* Payment banner */}
      {isPendingPayment && (
        <Box sx={{ mx: 2, mt: 1.5, px: 1.25, py: 0.875, borderRadius: '6px', backgroundColor: C.amberBg, border: `1px solid ${C.amber}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', color: '#92400E', fontWeight: 600 }}>Payment required</Typography>
            <Typography sx={{ fontSize: '0.625rem', color: C.amber }}>Reserved for 30 min</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.amber }}>
            ₹{(amountPaise / 100).toLocaleString('en-IN')}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2, mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {isPendingPayment && (
          <Button variant="contained" onClick={onPayNow} size="small" fullWidth
            sx={{ backgroundColor: C.amber, borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', boxShadow: 'none', color: '#fff', '&:hover': { backgroundColor: '#B45309', boxShadow: 'none' } }}>
            Pay ₹{(amountPaise! / 100).toLocaleString('en-IN')} to Confirm
          </Button>
        )}
        {status === 'CONFIRMED' && (
          <Button variant="contained" disabled={!canJoin} size="small" fullWidth
            sx={{ backgroundColor: canJoin ? C.blue : undefined, borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', boxShadow: 'none', '&.Mui-disabled': { backgroundColor: C.borderSub, color: C.muted } }}>
            {canJoin ? 'Join Call' : 'Upcoming'}
          </Button>
        )}
        {!isCancelled && (
          <Button size="small" onClick={onCancel} fullWidth
            sx={{ color: C.muted, borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '0.6875rem', fontWeight: 500,
              '&:hover': { backgroundColor: C.redBg, color: C.red, borderColor: '#FECACA' } }}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}
