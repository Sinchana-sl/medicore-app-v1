import { C } from '../styles/theme';
import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, CircularProgress, Alert,
  Tabs, Tab, TextField, InputAdornment, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem as MuiMenuItem,
} from '@mui/material';
import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';
import AppointmentCard from '../components/AppointmentCard';
import PaymentModal from '../components/PaymentModal';
import BookAppointmentDialog from '../components/BookAppointmentDialog';
import { useToast } from '../contexts/ToastContext';
import { getAppointments, cancelAppointment, type Appointment } from '../services/appointmentService';
import { getPatientProfile, type PatientProfile } from '../services/patientService';
import { useAppointmentReminders } from '../hooks/useAppointmentReminders';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const TAB_ALL        = 0;
const TAB_UPCOMING   = 1;
const TAB_CONFIRMED  = 2;
const TAB_PENDING    = 3;
const TAB_PAST       = 4;
const TAB_CANCELLED  = 5;

function isUpcoming(appt: Appointment) {
  const d = new Date(appt.appointmentDate);
  return d >= new Date() && appt.status !== 'CANCELLED';
}
function isPast(appt: Appointment) {
  const d = new Date(appt.appointmentDate);
  return d < new Date() && appt.status !== 'CANCELLED';
}

export default function PatientAppointmentsPage() {
  const toast = useToast();

  const [profile, setProfile]       = useState<PatientProfile | null>(null);
  const [appointments, setAppts]     = useState<Appointment[]>([]);
  useAppointmentReminders(appointments);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState('');
  const [tab, setTab]                = useState(TAB_ALL);
  const [search, setSearch]          = useState('');
  const [bookOpen, setBookOpen]      = useState(false);
  const [paymentAppt, setPaymentAppt] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling]  = useState(false);
  const [sortAnchor, setSortAnchor]  = useState<null | HTMLElement>(null);
  const [sortOrder, setSortOrder]    = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    Promise.all([getPatientProfile(), getAppointments()])
      .then(([prof, appts]) => { setProfile(prof); setAppts(appts); })
      .catch(() => setError('Failed to load appointments. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const updated = await cancelAppointment(cancelTarget.id);
      setAppts(prev => prev.map(a => a.id === cancelTarget.id ? updated : a));
      toast('Appointment cancelled', 'success');
      setCancelTarget(null);
    } catch {
      toast('Failed to cancel. Please try again.', 'error');
    } finally {
      setCancelling(false);
    }
  }

  const displayName = profile
    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.email.split('@')[0]
    : '…';

  // ── filtering ──────────────────────────────────────────────────────────────

  const filtered = appointments
    .filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || a.doctorName.toLowerCase().includes(q)
        || (a.doctorSpecialty ?? '').toLowerCase().includes(q)
        || (a.clinicName ?? '').toLowerCase().includes(q)
        || a.appointmentDate.toLowerCase().includes(q);

      const matchTab =
        tab === TAB_ALL       ? true :
        tab === TAB_UPCOMING  ? isUpcoming(a) :
        tab === TAB_CONFIRMED ? a.status === 'CONFIRMED' :
        tab === TAB_PENDING   ? a.status === 'PAYMENT_PENDING' :
        tab === TAB_PAST      ? isPast(a) :
        tab === TAB_CANCELLED ? a.status === 'CANCELLED' :
        true;

      return matchSearch && matchTab;
    })
    .sort((a, b) => {
      const da = new Date(a.appointmentDate).getTime();
      const db = new Date(b.appointmentDate).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });

  // ── tab counts ─────────────────────────────────────────────────────────────

  const counts = {
    all:       appointments.length,
    upcoming:  appointments.filter(isUpcoming).length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    pending:   appointments.filter(a => a.status === 'PAYMENT_PENDING').length,
    past:      appointments.filter(isPast).length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  const tabDefs = [
    { label: 'All',             count: counts.all,       color: C.blue },
    { label: 'Upcoming',        count: counts.upcoming,  color: C.blue },
    { label: 'Confirmed',       count: counts.confirmed, color: C.green },
    { label: 'Pending Payment', count: counts.pending,   color: C.amber },
    { label: 'Past',            count: counts.past,      color: C.slate },
    { label: 'Cancelled',       count: counts.cancelled, color: C.slate },
  ];

  // ── card style ─────────────────────────────────────────────────────────────

  const statCard = (icon: React.ReactNode, label: string, value: number | string, bg: string, color: string) => (
    <Box sx={{ backgroundColor: C.paper, borderRadius: '8px', border: `1px solid ${C.border}`, p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '6px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: C.ink, fontFamily: 'inherit', lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: C.slate, mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: C.paper, minHeight: '100vh' }}>
      <TopNavBar displayName={displayName} email={profile?.email} />

      <Box sx={{ display: 'flex' }}>
        <SideNavBar />

        <Box component="main" sx={{ ml: '240px', flex: 1, mt: '52px', p: { xs: 3, md: 4 } }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>

            {/* ── Page header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.ink, fontFamily: 'inherit', letterSpacing: '-0.02em' }}>
                  My Appointments
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: C.slate, mt: 0.25 }}>
                  View and manage all your appointments
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setBookOpen(true)}
                sx={{
                  backgroundColor: '#0D9488',
                  borderRadius: '8px', fontWeight: 700, px: 2.5, py: 1.1,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                Book Appointment
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* ── Stats row ── */}
            {!loading && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { icon: <CalendarTodayIcon />,        label: 'Total',           value: counts.all,       bg: C.blueLight, color: C.blue },
                  { icon: <EventAvailableIcon />,       label: 'Confirmed',       value: counts.confirmed,  bg: C.greenBg,   color: C.green },
                  { icon: <PendingActionsIcon />,       label: 'Pending Payment', value: counts.pending,    bg: C.amberBg,   color: C.amber },
                  { icon: <EventBusyIcon />,            label: 'Cancelled',       value: counts.cancelled,  bg: C.borderSub, color: C.muted },
                ].map(s => (
                  <Grid item xs={6} sm={3} key={s.label}>
                    {statCard(s.icon, s.label, s.value, s.bg, s.color)}
                  </Grid>
                ))}
              </Grid>
            )}

            {/* ── Filter bar ── */}
            <Box sx={{ backgroundColor: C.paper, borderRadius: '8px', border: `1px solid ${C.border}`, mb: 3, overflow: 'hidden' }}>
              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2, borderBottom: `1px solid ${C.border}`,
                  '& .MuiTab-root': { minHeight: 48, fontSize: '0.8rem', fontWeight: 700, textTransform: 'none', fontFamily: 'inherit' },
                  '& .Mui-selected': { color: '#0D9488' },
                  '& .MuiTabs-indicator': { backgroundColor: '#0D9488' },
                }}
              >
                {tabDefs.map((t, i) => (
                  <Tab
                    key={t.label}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {t.label}
                        {t.count > 0 && (
                          <Chip
                            label={t.count}
                            size="small"
                            sx={{
                              height: 18, fontSize: '0.65rem', fontWeight: 700,
                              backgroundColor: tab === i ? '#F0FDFA' : '#F1F0EF',
                              color: tab === i ? '#0D9488' : '#73726E',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                ))}
              </Tabs>

              {/* Search + sort */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search by doctor, specialty, clinic…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: C.muted }} /></InputAdornment> }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
                <Button
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={e => setSortAnchor(e.currentTarget)}
                  sx={{ borderRadius: '6px', border: `1px solid ${C.border}`, color: C.slate, fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', px: 1.5 }}
                >
                  {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </Button>
                <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
                  <MuiMenuItem onClick={() => { setSortOrder('desc'); setSortAnchor(null); }}>Newest First</MuiMenuItem>
                  <MuiMenuItem onClick={() => { setSortOrder('asc');  setSortAnchor(null); }}>Oldest First</MuiMenuItem>
                </Menu>
              </Box>
            </Box>

            {/* ── Content ── */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#0D9488' }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 12, backgroundColor: C.paper, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>
                  {tab === TAB_CANCELLED ? '🚫' : tab === TAB_PENDING ? '💳' : '📅'}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.ink, fontFamily: 'inherit' }}>
                  {search ? 'No appointments match your search' : 'No appointments here yet'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: C.slate, mt: 0.5 }}>
                  {search ? 'Try a different search term' : 'Book a new appointment to get started'}
                </Typography>
                {!search && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setBookOpen(true)}
                    sx={{ mt: 2.5, background: 'linear-gradient(135deg,#0D9488,#0D9488)', borderRadius: '8px', fontWeight: 700, boxShadow: 'none' }}
                  >
                    Book Appointment
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {filtered.map(appt => (
                  <Grid item xs={12} sm={6} lg={4} key={appt.id}>
                    <AppointmentCard
                      doctorName={appt.doctorName}
                      specialty={appt.doctorSpecialty ?? ''}
                      clinic={appt.clinicName ?? ''}
                      date={appt.appointmentDate}
                      time={appt.startTime}
                      imageUrl={appt.doctorImageUrl ?? ''}
                      canJoin={appt.canJoin}
                      status={appt.status}
                      consultationType={appt.consultationType}
                      paymentStatus={appt.paymentStatus}
                      amountPaise={appt.amountPaise}
                      onPayNow={() => setPaymentAppt(appt)}
                      onCancel={() => setCancelTarget(appt)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Cancel confirmation dialog ── */}
      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'inherit', pb: 1 }}>
          Cancel Appointment?
        </DialogTitle>
        <DialogContent>
          {cancelTarget && (
            <Box>
              <Typography sx={{ fontSize: '0.875rem', color: C.slate, mb: 2 }}>
                Are you sure you want to cancel your appointment with
              </Typography>
              <Box sx={{ backgroundColor: C.surface, borderRadius: '6px', p: 2, border: `1px solid ${C.border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{cancelTarget.doctorName}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 600 }}>{cancelTarget.doctorSpecialty}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: C.slate, mt: 0.5 }}>
                  {cancelTarget.appointmentDate} · {cancelTarget.startTime}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#ef4444', mt: 2, fontWeight: 600 }}>
                ⚠ This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelTarget(null)} variant="outlined"
            sx={{ borderRadius: '6px', fontWeight: 600, borderColor: C.border, color: C.slate }}>
            Keep Appointment
          </Button>
          <Button onClick={handleCancel} variant="contained" disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ borderRadius: '6px', fontWeight: 700, backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Book Appointment dialog ── */}
      <BookAppointmentDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={(appt) => {
          setAppts(prev => [appt, ...prev]);
          setBookOpen(false);
          toast('Appointment booked!', 'success');
        }}
      />

      {/* ── Payment modal ── */}
      {paymentAppt && (
        <PaymentModal
          open={true}
          appointmentId={paymentAppt.id}
          doctorName={paymentAppt.doctorName}
          specialty={paymentAppt.doctorSpecialty ?? ''}
          date={paymentAppt.appointmentDate}
          time={paymentAppt.startTime}
          amountPaise={paymentAppt.amountPaise!}
          patientPhone={paymentAppt.patientPhone}
          onSuccess={() => {
            setAppts(prev => prev.map(a => a.id === paymentAppt.id ? { ...a, status: 'CONFIRMED', paymentStatus: 'PAID' } : a));
            setPaymentAppt(null);
            toast('Payment successful! Appointment confirmed.', 'success');
          }}
          onClose={() => {
            setPaymentAppt(null);
            toast('Complete payment to confirm your appointment.', 'info');
          }}
        />
      )}
    </Box>
  );
}
