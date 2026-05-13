import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button, Chip, Fab, IconButton, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DoctorPageLayout from '../components/DoctorPageLayout';
import { getDoctorTodaysAppointments, completeAppointment, type DoctorAppointment } from '../services/doctorService';
import { useDoctorContext } from '../contexts/DoctorContext';
import { useToast } from '../contexts/ToastContext';

// ── Types ──────────────────────────────────────────────────────────────────────

type DisplayStatus = 'waiting' | 'scheduled' | 'priority' | 'completed' | 'cancelled';

function toDisplayStatus(status: string): DisplayStatus {
  switch (status.toUpperCase()) {
    case 'PENDING':   return 'waiting';
    case 'CONFIRMED': return 'scheduled';
    case 'COMPLETED': return 'completed';
    case 'CANCELLED': return 'cancelled';
    default:          return 'scheduled';
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor, icon, iconBg, showArrow }: {
  label: string; value: string; sub: string; subColor: string;
  icon: React.ReactNode; iconBg: string; showArrow?: boolean;
}) {
  return (
    <Box sx={{
      backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9',
      boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Box>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif', lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.25 }}>
          {showArrow && <ArrowUpwardIcon sx={{ fontSize: '0.75rem', color: subColor }} />}
          <Typography sx={{ fontSize: '0.75rem', color: subColor }}>{sub}</Typography>
        </Box>
      </Box>
      <Box sx={{ width: 48, height: 48, backgroundColor: iconBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', flexShrink: 0 }}>
        {icon}
      </Box>
    </Box>
  );
}

function StatusChip({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, { label: string; bg: string; color: string }> = {
    waiting:   { label: 'In Waiting Room', bg: '#eff6ff', color: '#1d4ed8' },
    scheduled: { label: 'Scheduled',       bg: '#f1f5f9', color: '#475569' },
    priority:  { label: 'High Priority',   bg: '#fffbeb', color: '#b45309' },
    completed: { label: 'Completed',       bg: '#f0fdf4', color: '#16a34a' },
    cancelled: { label: 'Cancelled',       bg: '#fef2f2', color: '#dc2626' },
  };
  const { label, bg, color } = map[status];
  return <Chip label={label} size="small" sx={{ backgroundColor: bg, color, fontWeight: 600, fontSize: '0.6875rem', borderRadius: 6, height: 26 }} />;
}

function AppointmentCard({ appt, onCompleted }: { appt: DoctorAppointment; onCompleted: (updated: DoctorAppointment) => void }) {
  const ds = toDisplayStatus(appt.status);
  const canStart = appt.canJoin || ds === 'waiting';
  const [completing, setCompleting] = useState(false);
  const toast = useToast();

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await completeAppointment(appt.id);
      onCompleted(updated);
    } catch {
      toast('Failed to mark appointment as complete', 'error');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: '#fff', p: 3, borderRadius: 3,
      border: '1px solid #f1f5f9',
      borderLeft: ds === 'scheduled' ? '4px solid #66affe' : ds === 'completed' ? '4px solid #16a34a' : '1px solid #f1f5f9',
      boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)',
      opacity: ds === 'cancelled' ? 0.6 : 1,
    }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: 2, p: 2, minWidth: 90 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{appt.startTime}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif' }}>
            {appt.consultationType === 'ONLINE' ? 'Online' : 'In-Person'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif' }}>
                {appt.patientName || appt.patientEmail}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
                {appt.reason || appt.consultationType}
              </Typography>
            </Box>
            <StatusChip status={ds} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {canStart ? (
              <Button variant="contained" sx={{ backgroundColor: '#002045', borderRadius: 2, fontSize: '0.8125rem', px: 3, py: 1, '&:hover': { backgroundColor: '#1e3a8a' } }}>
                Start Consultation
              </Button>
            ) : (
              <Button disabled sx={{ backgroundColor: '#f1f5f9 !important', color: '#94a3b8 !important', borderRadius: 2, fontSize: '0.8125rem', px: 3, py: 1 }}>
                Start Consultation
              </Button>
            )}
            {ds !== 'completed' && ds !== 'cancelled' && (
              <Button
                variant="outlined"
                onClick={handleComplete}
                disabled={completing}
                sx={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: 2, fontSize: '0.8125rem', px: 3, py: 1, '&:hover': { backgroundColor: '#f0fdf4', borderColor: '#16a34a' } }}
              >
                {completing ? <CircularProgress size={16} sx={{ color: '#16a34a' }} /> : 'Mark Complete'}
              </Button>
            )}
            <Button variant="outlined" sx={{ borderColor: '#e2e8f0', color: '#64748b', borderRadius: 2, fontSize: '0.8125rem', px: 3, py: 1 }}>
              Reschedule
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let d = 1 - firstDow;
  while (d <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) { week.push(d >= 1 && d <= daysInMonth ? d : null); d++; }
    weeks.push(week);
  }
  const isToday = (n: number | null) => n !== null && n === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif' }}>{monthName} {year}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeftIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRightIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
      <Grid container columns={7} sx={{ textAlign: 'center', mb: 1 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <Grid key={i} item xs={1}><Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>{d}</Typography></Grid>
        ))}
      </Grid>
      {weeks.map((week, wi) => (
        <Grid container columns={7} key={wi} sx={{ textAlign: 'center', mb: 0.5 }}>
          {week.map((day, di) => (
            <Grid key={di} item xs={1}>
              {day === null ? <Box sx={{ p: '6px' }} /> : isToday(day) ? (
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#002045', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', fontSize: '0.75rem', fontWeight: 700 }}>{day}</Box>
              ) : (
                <Box component="button" sx={{ width: 28, height: 28, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', '&:hover': { backgroundColor: '#eff6ff' } }}>{day}</Box>
              )}
            </Grid>
          ))}
        </Grid>
      ))}
      <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#002045' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Today</Typography>
      </Box>
    </Box>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const { profile } = useDoctorContext();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorTodaysAppointments()
      .then(setAppointments)
      .catch(() => toast('Failed to load appointments', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const total     = appointments.length;
  const pending   = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status.toUpperCase())).length;
  const completed = appointments.filter(a => a.status.toUpperCase() === 'COMPLETED').length;
  const nextAppt  = appointments.filter(a => a.status.toUpperCase() === 'PENDING').sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  const lastName = profile?.lastName || (profile ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') : '');
  const subtitle = profile
    ? `Welcome back${lastName ? `, Dr. ${lastName}` : ''}. You have ${total} appointment${total !== 1 ? 's' : ''} today.`
    : 'Loading…';

  return (
    <DoctorPageLayout
      title="Physician Dashboard"
      subtitle={subtitle}
      fab={
        <Fab sx={{ position: 'fixed', bottom: 32, right: 32, backgroundColor: '#002045', color: '#fff', width: 64, height: 64, '&:hover': { backgroundColor: '#1e3a8a', transform: 'scale(1.1)' }, transition: 'transform 0.15s', zIndex: 50 }}>
          <AddIcon sx={{ fontSize: '1.75rem' }} />
        </Fab>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard label="Total Patients Today" value={String(total).padStart(2,'0')} sub={total > 0 ? `${completed} completed so far` : 'No appointments yet'} subColor="#16a34a" icon={<GroupIcon />} iconBg="#eff6ff" showArrow={total > 0} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard label="Pending Appointments" value={String(pending).padStart(2,'0')} sub={nextAppt ? `Next: ${nextAppt.startTime}` : 'No pending'} subColor="#2563eb" icon={<PendingActionsIcon />} iconBg="#d2e4ff" />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard label="Completed" value={String(completed).padStart(2,'0')} sub={total > 0 ? `${Math.round((completed/total)*100)}% of today's schedule` : 'None yet'} subColor="#94a3b8" icon={<CheckCircleIcon />} iconBg="#f0fdf4" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif' }}>Today's Schedule</Typography>
                <Button onClick={() => navigate('/doctor/appointments')} sx={{ color: '#0061a5', fontWeight: 600, fontSize: '0.875rem' }}>View All</Button>
              </Box>
              {appointments.length === 0 ? (
                <Box sx={{ backgroundColor: '#fff', p: 4, borderRadius: 3, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <Typography color="text.secondary">No appointments scheduled for today.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {appointments.map(a => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      onCompleted={(updated) =>
                        setAppointments(prev => prev.map(x => x.id === updated.id ? updated : x))
                      }
                    />
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} lg={4}>
              <MiniCalendar />
            </Grid>
          </Grid>
        </>
      )}
    </DoctorPageLayout>
  );
}
