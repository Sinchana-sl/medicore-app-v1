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
  CONFIRMED: { label: 'Confirmed', bg: '#F1F0EF', color: '#73726E' },
  COMPLETED: { label: 'Completed', bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED: { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626' },
};

function AppointmentRow({ appt, onCompleted }: { appt: DoctorAppointment; onCompleted: (updated: DoctorAppointment) => void }) {
  const toast = useToast();
  const [completing, setCompleting] = useState(false);
  const s = STATUS_STYLE[appt.status.toUpperCase()] ?? { label: appt.status, bg: '#F1F0EF', color: '#73726E' };
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
      backgroundColor: '#fff',
      p: 3,
      borderRadius: '8px',
      border: '1px solid #E9E9E7',
      borderLeft: appt.status.toUpperCase() === 'CONFIRMED' ? '4px solid #66affe'
        : appt.status.toUpperCase() === 'COMPLETED' ? '4px solid #16a34a'
        : appt.status.toUpperCase() === 'CANCELLED' ? '4px solid #fca5a5'
        : '4px solid #c7d2fe',
      boxShadow: 'none',
      opacity: appt.status.toUpperCase() === 'CANCELLED' ? 0.65 : 1,
      transition: 'box-shadow 0.15s',
      '&:hover': { boxShadow: '0 6px 24px -4px rgba(26,54,93,0.12)' },
    }}>
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        {/* Date/time block */}
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#F7F7F5', borderRadius: '6px', p: 2, minWidth: 100, flexShrink: 0,
        }}>
          <CalendarTodayIcon sx={{ fontSize: '1rem', color: '#9B9A97', mb: 0.5 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#37352F', fontFamily: 'inherit' }}>
            {fmtDate(appt.appointmentDate)}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#73726E', mt: 0.25 }}>
            {appt.startTime}
          </Typography>
        </Box>

        {/* Main info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: '#37352F', fontFamily: 'inherit' }}>
                {appt.patientName || appt.patientEmail}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#73726E', mt: 0.25 }}>
                {appt.reason || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={appt.consultationType.replace('_', ' ')}
                size="small"
                sx={{ backgroundColor: '#F1F0EF', color: '#73726E', fontWeight: 600, fontSize: '0.6875rem', borderRadius: 6, height: 24 }}
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
                sx={{ backgroundColor: '#37352F', borderRadius: '6px', fontSize: '0.8125rem', px: 2.5, py: 0.75, '&:hover': { backgroundColor: '#0F766E' } }}
              >
                Start Consultation
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleComplete}
                disabled={completing}
                sx={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: '6px', fontSize: '0.8125rem', px: 2.5, py: 0.75, '&:hover': { backgroundColor: '#f0fdf4', borderColor: '#16a34a' } }}
              >
                {completing ? <CircularProgress size={14} sx={{ color: '#16a34a' }} /> : 'Mark Complete'}
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
          { label: 'Confirmed', value: counts.CONFIRMED, bg: '#f0fdf4', color: '#15803d', icon: <CalendarTodayIcon   sx={{ fontSize: '1.25rem' }} /> },
          { label: 'Completed', value: counts.COMPLETED, bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircleIcon     sx={{ fontSize: '1.25rem' }} /> },
          { label: 'Cancelled', value: counts.CANCELLED, bg: '#fef2f2', color: '#dc2626', icon: <CalendarTodayIcon   sx={{ fontSize: '1.25rem' }} /> },
        ].map(({ label, value, bg, color, icon }) => (
          <Grid key={label} item xs={6} md={3}>
            <Box sx={{ backgroundColor: '#fff', p: 2.5, borderRadius: '8px', border: '1px solid #E9E9E7', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#37352F', fontFamily: 'inherit', lineHeight: 1.1 }}>{value}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#9B9A97', fontWeight: 500 }}>{label}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ backgroundColor: '#fff', p: 2.5, borderRadius: '8px', border: '1px solid #E9E9E7', mb: 3, boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search patient name, email or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9B9A97', fontSize: '1.1rem' }} /></InputAdornment> }}
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
      <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E9E9E7', mb: 3, boxShadow: 'none', overflow: 'hidden' }}>
        <Tabs
          value={statusFilter}
          onChange={(_, v) => setStatusFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', minHeight: 48, fontFamily: 'inherit' },
            '& .Mui-selected': { color: '#0D9488' },
            '& .MuiTabs-indicator': { backgroundColor: '#37352F' },
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
        <Box sx={{ backgroundColor: '#fff', p: 6, borderRadius: '8px', border: '1px solid #E9E9E7', textAlign: 'center', boxShadow: 'none' }}>
          <CalendarTodayIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography sx={{ color: '#73726E', fontWeight: 600, mb: 0.5 }}>No appointments found</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#9B9A97' }}>
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
          <Typography sx={{ fontSize: '0.8125rem', color: '#9B9A97', textAlign: 'center', py: 1 }}>
            Showing {filtered.length} of {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </DoctorPageLayout>
  );
}
