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
import { C } from '../styles/theme';

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
      backgroundColor: C.paper, p: 3, borderRadius: '14px', border: `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      '&:hover': { boxShadow: '0 6px 24px rgba(13,148,136,0.1)', transform: 'translateY(-1px)' },
    }}>
      <Box>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.25 }}>
          {showArrow && <ArrowUpwardIcon sx={{ fontSize: '0.75rem', color: subColor }} />}
          <Typography sx={{ fontSize: '0.75rem', color: subColor }}>{sub}</Typography>
        </Box>
      </Box>
      <Box sx={{ width: 48, height: 48, backgroundColor: iconBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, flexShrink: 0 }}>
        {icon}
      </Box>
    </Box>
  );
}

function StatusChip({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, { label: string; bg: string; color: string }> = {
    waiting:   { label: 'In Waiting Room', bg: C.blueLight,  color: C.blue },
    scheduled: { label: 'Scheduled',       bg: C.borderSub,  color: C.slate },
    priority:  { label: 'High Priority',   bg: C.amberBg,    color: C.amber },
    completed: { label: 'Completed',       bg: C.greenBg,    color: C.green },
    cancelled: { label: 'Cancelled',       bg: C.redBg,      color: C.red },
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
      backgroundColor: C.paper, p: 3, borderRadius: '14px',
      border: `1px solid ${C.border}`,
      borderLeft: ds === 'scheduled' ? `4px solid ${C.blue}` : ds === 'completed' ? `4px solid ${C.green}` : `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
      opacity: ds === 'cancelled' ? 0.6 : 1,
      transition: 'box-shadow 0.2s ease',
      '&:hover': ds !== 'cancelled' ? { boxShadow: '0 4px 16px rgba(13,148,136,0.1)' } : {},
    }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blueLight, borderRadius: '10px', p: 2, minWidth: 90 }}>
          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{appt.startTime}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.blue }}>
            {appt.consultationType === 'ONLINE' ? 'Online' : 'In-Person'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: C.ink }}>
                {appt.patientName || appt.patientEmail}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: C.slate, mt: 0.25 }}>
                {appt.reason || appt.consultationType}
              </Typography>
            </Box>
            <StatusChip status={ds} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {canStart ? (
              <Button variant="contained"
                sx={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, borderRadius: '8px', fontSize: '0.8125rem', px: 3, py: 1, boxShadow: 'none', fontWeight: 700, '&:hover': { background: `linear-gradient(135deg, ${C.blueDark}, ${C.blue})`, boxShadow: `0 4px 12px rgba(13,148,136,0.35)`, transform: 'translateY(-1px)' } }}>
                Start Consultation
              </Button>
            ) : (
              <Button disabled sx={{ backgroundColor: `${C.borderSub} !important`, color: `${C.muted} !important`, borderRadius: '8px', fontSize: '0.8125rem', px: 3, py: 1 }}>
                Start Consultation
              </Button>
            )}
            {ds !== 'completed' && ds !== 'cancelled' && (
              <Button
                variant="outlined"
                onClick={handleComplete}
                disabled={completing}
                sx={{ borderColor: C.green, color: C.green, borderRadius: '8px', fontSize: '0.8125rem', px: 3, py: 1, fontWeight: 600, '&:hover': { backgroundColor: C.greenBg, borderColor: C.green } }}
              >
                {completing ? <CircularProgress size={16} sx={{ color: C.green }} /> : 'Mark Complete'}
              </Button>
            )}
            <Button variant="outlined" sx={{ borderColor: C.border, color: C.slate, borderRadius: '8px', fontSize: '0.8125rem', px: 3, py: 1, fontWeight: 600, '&:hover': { backgroundColor: C.borderSub, borderColor: C.border } }}>
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
    <Box sx={{ backgroundColor: C.paper, p: 3, borderRadius: '14px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink }}>{monthName} {year}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month - 1, 1))} sx={{ color: C.slate, '&:hover': { color: C.blue } }}><ChevronLeftIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month + 1, 1))} sx={{ color: C.slate, '&:hover': { color: C.blue } }}><ChevronRightIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
      <Grid container columns={7} sx={{ textAlign: 'center', mb: 1 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <Grid key={i} item xs={1}><Typography sx={{ fontSize: '0.6875rem', color: C.muted, fontWeight: 600 }}>{d}</Typography></Grid>
        ))}
      </Grid>
      {weeks.map((week, wi) => (
        <Grid container columns={7} key={wi} sx={{ textAlign: 'center', mb: 0.5 }}>
          {week.map((day, di) => (
            <Grid key={di} item xs={1}>
              {day === null ? <Box sx={{ p: '6px' }} /> : isToday(day) ? (
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', fontSize: '0.75rem', fontWeight: 700 }}>{day}</Box>
              ) : (
                <Box component="button" sx={{ width: 28, height: 28, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', '&:hover': { backgroundColor: C.blueLight, color: C.blue } }}>{day}</Box>
              )}
            </Grid>
          ))}
        </Grid>
      ))}
      <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${C.borderSub}`, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }} />
        <Typography sx={{ fontSize: '0.75rem', color: C.slate }}>Today</Typography>
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
        <Fab sx={{ position: 'fixed', bottom: 32, right: 32, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: '#fff', width: 64, height: 64, boxShadow: `0 4px 16px rgba(13,148,136,0.4)`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px rgba(13,148,136,0.5)` }, transition: 'transform 0.2s ease, box-shadow 0.2s ease', zIndex: 50 }}>
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
              <StatCard label="Total Patients Today" value={String(total).padStart(2,'0')} sub={total > 0 ? `${completed} completed so far` : 'No appointments yet'} subColor={C.green} icon={<GroupIcon />} iconBg={C.blueLight} showArrow={total > 0} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard label="Pending Appointments" value={String(pending).padStart(2,'0')} sub={nextAppt ? `Next: ${nextAppt.startTime}` : 'No pending'} subColor={C.blue} icon={<PendingActionsIcon />} iconBg={C.blueMid} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard label="Completed" value={String(completed).padStart(2,'0')} sub={total > 0 ? `${Math.round((completed/total)*100)}% of today's schedule` : 'None yet'} subColor={C.muted} icon={<CheckCircleIcon />} iconBg={C.greenBg} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: C.ink }}>Today's Schedule</Typography>
                <Button onClick={() => navigate('/doctor/appointments')} sx={{ color: C.blue, fontWeight: 600, fontSize: '0.875rem', borderRadius: '8px', '&:hover': { backgroundColor: C.blueLight } }}>View All</Button>
              </Box>
              {appointments.length === 0 ? (
                <Box sx={{ backgroundColor: C.paper, p: 4, borderRadius: '14px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
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
