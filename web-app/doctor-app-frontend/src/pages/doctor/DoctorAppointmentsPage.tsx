import { C } from '../../styles/theme';
import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  TextField, MenuItem, Grid, InputAdornment, Tabs, Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import { getDoctorAllAppointments, completeAppointment, type DoctorAppointment } from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

/** Formats ISO "2026-05-12" → "May 12, 2026" */
function fmtDate(iso: string): string {
  if (!iso) return iso;
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',       label: 'All' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pending',   bg: '#F0FDFA', color: '#0D9488' },
  CONFIRMED: { label: 'Confirmed', bg: '#F1F0EF', color: C.slate },
  COMPLETED: { label: 'Completed', bg: C.greenBg, color: C.green },
  CANCELLED: { label: 'Cancelled', bg: C.redBg, color: '#dc2626' },
};

function AppointmentRow({ appt, onCompleted }: { appt: DoctorAppointment; onCompleted: (updated: DoctorAppointment) => void }) {
  const toast = useToast();
  const [completing, setCompleting] = useState(false);
  const s = STATUS_STYLE[appt.status.toUpperCase()] ?? { label: appt.status, bg: '#F1F0EF', color: C.slate };
  const isActive = !['COMPLETED', 'CANCELLED'].includes(appt.status.toUpperCase());

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await completeAppointment(appt.id);
      onCompleted(updated);
      toast('Appointment marked as complete', 'success');
    } catch {
      toast('Failed to update appointment', 'error');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: C.paper,
      p: 3,
      borderRadius: '8px',
      border: `1px solid ${C.border}`,
      borderLeft: appt.status.toUpperCase() === 'CONFIRMED' ? `4px solid ${C.blue}`
        : appt.status.toUpperCase() === 'COMPLETED' ? `4px solid ${C.green}`
        : appt.status.toUpperCase() === 'CANCELLED' ? `4px solid ${C.subtle}`
        : `4px solid ${C.border}`,
      boxShadow: 'none',
      opacity: appt.status.toUpperCase() === 'CANCELLED' ? 0.65 : 1,
      transition: 'box-shadow 0.15s',
      '&:hover': { boxShadow: '0 6px 24px -4px rgba(26,54,93,0.12)' },
    }}>
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        {/* Date/time block */}
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: C.surface, borderRadius: '6px', p: 2, minWidth: 100, flexShrink: 0,
        }}>
          <CalendarTodayIcon sx={{ fontSize: '1rem', color: C.muted, mb: 0.5 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.ink, fontFamily: 'inherit' }}>
            {fmtDate(appt.appointmentDate)}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: C.slate, mt: 0.25 }}>
            {appt.startTime}
          </Typography>
        </Box>

        {/* Main info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit' }}>
                {appt.patientName || appt.patientEmail}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: C.slate, mt: 0.25 }}>
                {appt.reason || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={appt.consultationType.replace('_', ' ')}
                size="small"
                sx={{ backgroundColor: C.borderSub, color: C.slate, fontWeight: 600, fontSize: '0.6875rem', borderRadius: 6, height: 24 }}
              />
              <Chip
                label={s.label}
                size="small"
                sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.6875rem', borderRadius: 6, height: 24 }}
              />
            </Box>
          </Box>

          {isActive && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: C.blue, borderRadius: '6px', fontSize: '0.8125rem', px: 2.5, py: 0.75, '&:hover': { backgroundColor: C.blueDark } }}
              >
                Start Consultation
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleComplete}
                disabled={completing}
                sx={{ borderColor: C.green, color: C.green, borderRadius: '6px', fontSize: '0.8125rem', px: 2.5, py: 0.75, '&:hover': { backgroundColor: C.greenBg, borderColor: C.green } }}
              >
                {completing ? <CircularProgress size={14} sx={{ color: C.green }} /> : 'Mark Complete'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function DoctorAppointmentsPage() {
  const toast = useToast();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    getDoctorAllAppointments()
      .then(setAppointments)
      .catch(() => toast('Failed to load appointments', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      if (statusFilter !== 'ALL' && a.status.toUpperCase() !== statusFilter) return false;
      if (fromDate && a.appointmentDate < fromDate) return false;
      if (toDate   && a.appointmentDate > toDate)   return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.patientName?.toLowerCase().includes(q) &&
          !a.patientEmail?.toLowerCase().includes(q) &&
          !a.reason?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => {
      const dateCmp = b.appointmentDate.localeCompare(a.appointmentDate);
      return dateCmp !== 0 ? dateCmp : b.startTime.localeCompare(a.startTime);
    });
  }, [appointments, statusFilter, search, fromDate, toDate]);

  const counts = useMemo(() => ({
    PENDING:   appointments.filter(a => a.status.toUpperCase() === 'PENDING').length,
    CONFIRMED: appointments.filter(a => a.status.toUpperCase() === 'CONFIRMED').length,
    COMPLETED: appointments.filter(a => a.status.toUpperCase() === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status.toUpperCase() === 'CANCELLED').length,
  }), [appointments]);

  return (
    <DoctorPageLayout title="Appointments" subtitle="Manage and review all patient appointments">
      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Pending',   value: counts.PENDING,   bg: '#F0FDFA', color: '#0D9488', icon: <PendingActionsIcon sx={{ fontSize: '1.25rem' }} /> },
          { label: 'Confirmed', value: counts.CONFIRMED, bg: C.greenBg, color: '#15803d', icon: <CalendarTodayIcon   sx={{ fontSize: '1.25rem' }} /> },
          { label: 'Completed', value: counts.COMPLETED, bg: C.greenBg, color: C.green, icon: <CheckCircleIcon     sx={{ fontSize: '1.25rem' }} /> },
          { label: 'Cancelled', value: counts.CANCELLED, bg: C.redBg, color: '#dc2626', icon: <CalendarTodayIcon   sx={{ fontSize: '1.25rem' }} /> },
        ].map(({ label, value, bg, color, icon }) => (
          <Grid key={label} item xs={6} md={3}>
            <Box sx={{ backgroundColor: C.paper, p: 2.5, borderRadius: '8px', border: `1px solid ${C.border}`, boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit', lineHeight: 1.1 }}>{value}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500 }}>{label}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ backgroundColor: C.paper, p: 2.5, borderRadius: '8px', border: `1px solid ${C.border}`, mb: 3, boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search patient name, email or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: C.muted, fontSize: '1.1rem' }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth size="small" label="From Date" type="date"
              value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth size="small" label="To Date" type="date"
              value={toDate} onChange={(e) => setToDate(e.target.value)}
              inputProps={{ min: fromDate }}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth size="small" select label="Sort"
              defaultValue="date-desc"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="date-desc">Newest First</MenuItem>
              <MenuItem value="date-asc">Oldest First</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Status tabs */}
      <Box sx={{ backgroundColor: C.paper, borderRadius: '8px', border: `1px solid ${C.border}`, mb: 3, boxShadow: 'none', overflow: 'hidden' }}>
        <Tabs
          value={statusFilter}
          onChange={(_, v) => setStatusFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', minHeight: 48, fontFamily: 'inherit' },
            '& .Mui-selected': { color: '#0D9488' },
            '& .MuiTabs-indicator': { backgroundColor: C.blue },
          }}
        >
          {STATUS_TABS.map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              label={value === 'ALL' ? `All (${appointments.length})` : `${label} (${counts[value as keyof typeof counts] ?? 0})`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Appointment list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ backgroundColor: C.paper, p: 6, borderRadius: '8px', border: `1px solid ${C.border}`, textAlign: 'center', boxShadow: 'none' }}>
          <CalendarTodayIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography sx={{ color: C.slate, fontWeight: 600, mb: 0.5 }}>No appointments found</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: C.muted }}>
            {search || fromDate || toDate || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'No appointments have been booked yet.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(a => (
            <AppointmentRow
              key={a.id}
              appt={a}
              onCompleted={(updated) => setAppointments(prev => prev.map(x => x.id === updated.id ? updated : x))}
            />
          ))}
          <Typography sx={{ fontSize: '0.8125rem', color: C.muted, textAlign: 'center', py: 1 }}>
            Showing {filtered.length} of {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </DoctorPageLayout>
  );
}
