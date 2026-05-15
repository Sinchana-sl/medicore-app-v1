import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Button, Grid, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Skeleton, Chip, InputAdornment,
  Avatar, Divider, IconButton, Paper, List, ListItemButton,
  Switch, FormControlLabel, ToggleButton, ToggleButtonGroup,
  LinearProgress, Tooltip, Select,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import OpacityIcon from '@mui/icons-material/Opacity';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon2 from '@mui/icons-material/AccountCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CalculateIcon from '@mui/icons-material/Calculate';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { C } from '../styles/theme';
import TopNavBar from '../components/TopNavBar';
import ChatBot from '../components/ChatBot';
import PaymentModal from '../components/PaymentModal';
import BookAppointmentDialog from '../components/BookAppointmentDialog';
import { useToast } from '../contexts/ToastContext';
import SideNavBar from '../components/SideNavBar';
import AppointmentCard from '../components/AppointmentCard';
import { getPatientProfile, updatePatientProfile, type PatientProfile } from '../services/patientService';
import {
  getAppointments, cancelAppointment, type Appointment,
} from '../services/appointmentService';
import {
  getMedicalRecords, type MedicalRecord,
} from '../services/medicalRecordService';
import { useAppointmentReminders } from '../hooks/useAppointmentReminders';

// ---------- helpers ----------

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const CONSULTATION_TYPES = ['IN_PERSON', 'VIDEO', 'PHONE'];

// ---------- Stat Card ----------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  accentBg: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, sub, accent, accentBg, loading }: StatCardProps) {
  return (
    <Box
      sx={{
        backgroundColor: C.paper,
        borderRadius: '8px',
        border: `1px solid ${C.border}`,
        boxShadow: 'none',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'background-color 0.1s ease',
        '&:hover': { backgroundColor: C.surface },
      }}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '8px', flexShrink: 0,
          backgroundColor: accentBg, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={28} />
        ) : (
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'inherit', color: C.ink, lineHeight: 1.2, mt: 0.25 }}>
            {value}
          </Typography>
        )}
        {sub && !loading && (
          <Typography sx={{ fontSize: '0.72rem', color: C.muted, mt: 0.25 }}>{sub}</Typography>
        )}
      </Box>
    </Box>
  );
}

// ---------- Vital Chip ----------

interface VitalProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'empty';
  accentBg: string;
  accentColor: string;
}

const statusChip = {
  normal: { bg: C.greenBg, color: '#15803d', label: 'Normal' },
  warning: { bg: C.amberBg, color: '#b45309', label: 'Review' },
  empty: { bg: '#f1f5f9', color: C.muted, label: 'Not logged' },
};

function VitalRow({ icon, label, value, unit, status, accentBg, accentColor }: VitalProps) {
  const chip = statusChip[status];
  return (
    <Box
      sx={{
        p: 1.75, borderRadius: 2.5, border: '1px solid #f1f5f9',
        backgroundColor: C.surface,
        '&:hover': { backgroundColor: C.blueLight, borderColor: C.blueMid },
        transition: 'all 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: accentBg, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, lineHeight: 1.2 }}>{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {status === 'empty' ? (
          <Typography sx={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>—</Typography>
        ) : (
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: C.ink, fontFamily: 'inherit', lineHeight: 1 }}>
            {value} <Box component="span" sx={{ fontSize: '0.6875rem', color: C.muted, fontWeight: 500 }}>{unit}</Box>
          </Typography>
        )}
        <Chip
          label={chip.label}
          size="small"
          sx={{ backgroundColor: chip.bg, color: chip.color, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', height: 20 }}
        />
      </Box>
    </Box>
  );
}

// ---------- Vitals Widget ----------

interface VitalsState {
  bloodPressure: string;
  heartRate: string;
  weight: string;
  bloodSugar: string;
}

interface VitalsDialogProps {
  open: boolean;
  onClose: () => void;
  initial: VitalsState;
  onSave: (v: VitalsState) => void;
}

function LogVitalsDialog({ open, onClose, initial, onSave }: VitalsDialogProps) {
  const [form, setForm] = useState<VitalsState>(initial);

  function handleChange(field: keyof VitalsState, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleSave() {
    onSave(form);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: C.ink }}>
        Log My Vitals
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Blood Pressure (e.g. 120/80)" value={form.bloodPressure} onChange={(e) => handleChange('bloodPressure', e.target.value)} fullWidth size="small" />
        <TextField label="Heart Rate (bpm)" type="number" value={form.heartRate} onChange={(e) => handleChange('heartRate', e.target.value)} fullWidth size="small" />
        <TextField label="Weight (kg)" type="number" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} fullWidth size="small" />
        <TextField label="Blood Sugar (mg/dL)" type="number" value={form.bloodSugar} onChange={(e) => handleChange('bloodSugar', e.target.value)} fullWidth size="small" />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: C.slate }}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ backgroundColor: C.blue, borderRadius: '8px', fontWeight: 700, boxShadow: 'none', '&:hover': { backgroundColor: C.blueDark } }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------- Book Appointment Dialog helpers (moved to BookAppointmentDialog.tsx) ----------

// ---------- Main Dashboard ----------

const EMPTY_VITALS: VitalsState = { bloodPressure: '', heartRate: '', weight: '', bloodSugar: '' };

// ─── Health Tips ──────────────────────────────────────────────────────────────
const HEALTH_TIPS = [
  { tip: 'Drink at least 8 glasses of water daily to stay hydrated and support kidney function.', emoji: '💧' },
  { tip: 'Aim for 7–9 hours of quality sleep. Poor sleep increases the risk of heart disease and diabetes.', emoji: '😴' },
  { tip: 'A 30-minute walk daily reduces the risk of cardiovascular disease by up to 35%.', emoji: '🚶' },
  { tip: 'Eat 5 servings of fruits and vegetables a day for essential vitamins and antioxidants.', emoji: '🥦' },
  { tip: 'Limit processed sugar intake. High sugar diets are linked to obesity, diabetes, and inflammation.', emoji: '🍬' },
  { tip: 'Wash your hands for at least 20 seconds to prevent the spread of infections.', emoji: '🧼' },
  { tip: 'Take screen breaks every 20 minutes — look at something 20 feet away for 20 seconds (20-20-20 rule).', emoji: '👁️' },
  { tip: 'Deep breathing exercises for 5 minutes reduce cortisol (stress hormone) levels significantly.', emoji: '🧘' },
  { tip: 'Regular blood pressure checks can detect hypertension early — the "silent killer".', emoji: '🩺' },
  { tip: 'Eating breakfast improves concentration, memory and overall calorie management during the day.', emoji: '🍳' },
  { tip: 'Standing up and stretching for 2 minutes every hour counteracts the effects of prolonged sitting.', emoji: '🧍' },
  { tip: 'Sunscreen with SPF 30+ should be applied daily — UV damage is the leading cause of skin cancer.', emoji: '☀️' },
  { tip: 'Reduce sodium intake to under 2,300 mg/day to maintain healthy blood pressure.', emoji: '🧂' },
  { tip: 'Regular dental check-ups can reveal early signs of diabetes, heart disease, and osteoporosis.', emoji: '🦷' },
  { tip: 'Laughter truly is medicine — it releases endorphins and reduces stress hormones.', emoji: '😄' },
];

// ─── Symptom → Specialist mapping ─────────────────────────────────────────────
const SYMPTOMS_LIST = [
  'Chest pain', 'Shortness of breath', 'Headache', 'Fever', 'Fatigue',
  'Joint pain', 'Skin rash', 'Stomach pain', 'Back pain', 'Blurred vision',
  'Dizziness', 'Cough', 'Swelling', 'Numbness', 'Anxiety / Depression',
  'Hair loss', 'Frequent urination', 'Irregular heartbeat', 'Sore throat', 'Nausea',
];

function recommendSpecialist(symptoms: string[]): { specialist: string; urgency: 'urgent' | 'soon' | 'routine'; advice: string } {
  const s = symptoms.join(' ').toLowerCase();
  if (s.includes('chest pain') || s.includes('irregular heartbeat') || s.includes('shortness of breath'))
    return { specialist: 'Cardiologist', urgency: 'urgent', advice: 'Seek immediate medical attention if symptoms are severe or sudden.' };
  if (s.includes('blurred vision') || s.includes('frequent urination') || s.includes('fatigue'))
    return { specialist: 'Endocrinologist', urgency: 'soon', advice: 'These may indicate diabetes or a thyroid issue. Schedule an appointment soon.' };
  if (s.includes('headache') || s.includes('dizziness') || s.includes('numbness'))
    return { specialist: 'Neurologist', urgency: 'soon', advice: 'Persistent neurological symptoms should be evaluated promptly.' };
  if (s.includes('skin rash') || s.includes('hair loss'))
    return { specialist: 'Dermatologist', urgency: 'routine', advice: 'Book a routine appointment for a skin examination.' };
  if (s.includes('joint pain') || s.includes('back pain') || s.includes('swelling'))
    return { specialist: 'Orthopedic', urgency: 'routine', advice: 'Physiotherapy and an orthopedic review are recommended.' };
  if (s.includes('anxiety') || s.includes('depression'))
    return { specialist: 'Psychiatrist', urgency: 'soon', advice: 'Mental health is as important as physical health. Don\'t delay seeking support.' };
  if (s.includes('stomach pain') || s.includes('nausea'))
    return { specialist: 'Gastroenterologist', urgency: 'routine', advice: 'Track your diet and book a gastro consultation.' };
  if (s.includes('cough') || s.includes('sore throat') || s.includes('fever'))
    return { specialist: 'General Physician', urgency: 'soon', advice: 'Start with a general physician who may refer you if needed.' };
  return { specialist: 'General Physician', urgency: 'routine', advice: 'A general health check-up with your GP is a good starting point.' };
}

export default function PatientDashboard() {
  const toast = useToast();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  useAppointmentReminders(appointments);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [vitals, setVitals] = useState<VitalsState>(EMPTY_VITALS);
  const [paymentAppt, setPaymentAppt] = useState<Appointment | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if ((location.state as { openChat?: boolean } | null)?.openChat) {
      setChatOpen(true);
      window.history.replaceState({}, '');
    }
  }, []);

  // ── Health widgets state ──────────────────────────────────────────────────
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');

  const todayStr = new Date().toDateString();
  const [waterGlasses, setWaterGlasses] = useState<boolean[]>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mc_water') || '{}');
      if (s.date === new Date().toDateString()) return s.glasses;
    } catch {}
    return Array(8).fill(false);
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomResult, setSymptomResult] = useState<ReturnType<typeof recommendSpecialist> | null>(null);

  const todayTip = HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length];

  const bmi = useMemo(() => {
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (!h || !w || h <= 0) return null;
    const val = w / (h * h);
    const cat = val < 18.5 ? { label: 'Underweight', color: C.blue }
              : val < 25   ? { label: 'Normal',      color: '#16a34a' }
              : val < 30   ? { label: 'Overweight',  color: '#d97706' }
              :               { label: 'Obese',       color: '#dc2626' };
    return { val: val.toFixed(1), ...cat };
  }, [bmiHeight, bmiWeight]);

  function toggleGlass(i: number) {
    const next = waterGlasses.map((g, idx) => idx === i ? !g : g);
    setWaterGlasses(next);
    localStorage.setItem('mc_water', JSON.stringify({ date: todayStr, glasses: next }));
  }


  useEffect(() => {
    async function loadData() {
      try {
        const [prof, appts, recs] = await Promise.all([
          getPatientProfile(),
          getAppointments(),
          getMedicalRecords(),
        ]);
        setProfile(prof);
        setAppointments(appts);
        setRecords(recs);
      } catch {
        setFetchError('Failed to load dashboard data. Please refresh.');
        toast('Failed to load dashboard data. Please refresh.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleCancel(id: string) {
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast('Appointment cancelled successfully', 'success');
    } catch {
      toast('Failed to cancel appointment. Please try again.', 'error');
    }
  }

  const activeAppointments = appointments.filter((a) => a.status !== 'CANCELLED');
  const nextAppointment = activeAppointments[0] ?? null;

  const displayName = profile
    ? (profile.firstName || profile.lastName)
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile.email.split('@')[0]
    : '…';

  const todayCount = activeAppointments.filter(
    (a) => a.appointmentDate === new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  ).length;

  // Vitals derived state
  function parseVitalStatus(val: string, low: number, high: number): 'normal' | 'warning' | 'empty' {
    if (!val) return 'empty';
    const n = parseFloat(val);
    if (isNaN(n)) return 'empty';
    return n >= low && n <= high ? 'normal' : 'warning';
  }

  const bpStatus: 'normal' | 'warning' | 'empty' = !vitals.bloodPressure ? 'empty'
    : (() => {
        const [sys] = vitals.bloodPressure.split('/').map(Number);
        return sys && sys >= 90 && sys <= 130 ? 'normal' : 'warning';
      })();

  const vitalRows: VitalProps[] = [
    {
      icon: <OpacityIcon sx={{ fontSize: 18 }} />,
      label: 'Blood Pressure',
      value: vitals.bloodPressure,
      unit: 'mmHg',
      status: bpStatus,
      accentBg: C.redBg,
      accentColor: '#dc2626',
    },
 
    {
      icon: <FavoriteIcon sx={{ fontSize: 18 }} />,
      label: 'Heart Rate',
      value: vitals.heartRate,
      unit: 'bpm',
      status: parseVitalStatus(vitals.heartRate, 60, 100),
      accentBg: '#fff1f2',
      accentColor: '#e11d48',
    },
    {
      icon: <FitnessCenterIcon sx={{ fontSize: 18 }} />,
      label: 'Weight',
      value: vitals.weight,
      unit: 'kg',
      status: vitals.weight ? 'normal' : 'empty',
      accentBg: C.greenBg,
      accentColor: '#16a34a',
    },
    {
      icon: <BloodtypeIcon sx={{ fontSize: 18 }} />,
      label: 'Blood Sugar',
      value: vitals.bloodSugar,
      unit: 'mg/dL',
      status: parseVitalStatus(vitals.bloodSugar, 70, 140),
      accentBg: '#F0FDFA',
      accentColor: '#2563eb',
    },
  ];

  // Shared card style
  const card = {
    backgroundColor: C.paper,
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    boxShadow: 'none',
  };

  function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: `1px solid ${C.border}` }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        {action}
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: C.paper, minHeight: '100vh' }}>
      <TopNavBar
        displayName={displayName}
        email={profile?.email}
        onProfileClick={() => navigate('/settings')}
      />
      <Box sx={{ display: 'flex', pt: '52px' }}>
        <SideNavBar onChatClick={() => setChatOpen(o => !o)} chatActive={chatOpen} />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.paper }}>
          {/* Full chat view */}
          {chatOpen ? (
            <Box sx={{ flex: 1, height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', backgroundColor: C.surface }}>
              <ChatBot
                open={true}
                onClose={() => setChatOpen(false)}
                onAppointmentBooked={(appt) => {
                  setAppointments((prev) => [...prev, appt]);
                  if (appt.status === 'PAYMENT_PENDING' && appt.amountPaise && appt.amountPaise > 0) {
                    setPaymentAppt(appt);
                  } else {
                    toast('Appointment booked successfully!', 'success');
                  }
                }}
              />
            </Box>
          ) : (
          <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, minWidth: 0 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

            {fetchError && <Alert severity="error">{fetchError}</Alert>}

            {/* Welcome banner */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueBright} 100%)`,
                borderRadius: '14px',
                p: { xs: 2.5, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                boxShadow: '0 4px 20px rgba(13,148,136,0.25)',
              }}
            >
              <Box>
                {loading ? <Skeleton width={280} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : (
                  <Typography sx={{ fontSize: { xs: '1.375rem', md: '1.75rem' }, fontWeight: 800, color: '#fff', fontFamily: 'inherit', lineHeight: 1.2 }}>
                    {getGreeting()}, {displayName} 👋
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                  {loading ? <Skeleton width={220} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /> : todayCount > 0
                    ? `You have ${todayCount} appointment${todayCount > 1 ? 's' : ''} today.`
                    : 'Your health dashboard is up to date.'}
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, flexShrink: 0, opacity: 0.85 }}>
                <Box sx={{ fontSize: '3.5rem', lineHeight: 1 }}>🩺</Box>
              </Box>
            </Box>

            {/* Health Tip of the Day — top strip */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              borderRadius: '14px',
              border: `1px solid ${C.blueMid}`,
              px: 3, py: 1.75,
              background: `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blueMid} 100%)`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <Box sx={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0 }}>{todayTip.emoji}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <TipsAndUpdatesIcon sx={{ fontSize: 14, color: C.blue }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Health Tip of the Day
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.875rem', color: C.ink, fontWeight: 500, lineHeight: 1.5 }}>
                  {todayTip.tip}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.65rem', color: C.muted, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                Tip {(new Date().getDate() % HEALTH_TIPS.length) + 1}/{HEALTH_TIPS.length}
              </Typography>
            </Box>

            {/* Stats Row */}
            <Grid container spacing={2.5}>
              {[
                { icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />, label: 'Upcoming', value: loading ? '—' : activeAppointments.length, sub: 'appointments', accent: C.blue, accentBg: C.blueLight },
                { icon: <FolderOpenIcon sx={{ fontSize: 20 }} />, label: 'Medical Records', value: loading ? '—' : records.length, sub: 'on file', accent: C.purple, accentBg: C.purpleBg },
                { icon: <AccessTimeIcon sx={{ fontSize: 20 }} />, label: 'Next Appointment', value: loading ? '—' : nextAppointment ? nextAppointment.appointmentDate : 'None', sub: nextAppointment ? nextAppointment.startTime : 'Book one now', accent: C.blue, accentBg: C.blueMid },
                { icon: <MonitorHeartIcon sx={{ fontSize: 20 }} />, label: 'Vitals Logged', value: loading ? '—' : `${Object.values(vitals).filter(Boolean).length}/4`, sub: 'metrics tracked', accent: '#e11d48', accentBg: '#fff1f2' },
              ].map((s) => (
                <Grid item xs={12} sm={6} lg={3} key={s.label}>
                  <StatCard {...s} loading={loading} />
                </Grid>
              ))}
            </Grid>

            {/* Row 1: Live Queue + Upcoming Appointments + Vitals */}
            <Grid container spacing={3} alignItems="stretch">

              {/* Live Queue — compact */}
              <Grid item xs={12} lg={3}>
                <Box
                  sx={{
                    background: 'linear-gradient(150deg, #021F1C 0%, #032B27 50%, #054F49 100%)',
                    color: '#fff', borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 8px 24px -4px rgba(2,31,28,0.45)',
                    position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Subtle decorative glow */}
                  <Box sx={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, background: 'radial-gradient(circle, rgba(102,175,254,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                  {/* Header */}
                  <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ position: 'relative', width: 8, height: 8 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#4ade80', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', '@keyframes ping': { '75%,100%': { transform: 'scale(2.2)', opacity: 0 } } }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', position: 'relative' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#86a0cd' }}>Live Queue</Typography>
                    </Box>
                    <Box sx={{ px: 1, py: 0.25, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active</Typography>
                    </Box>
                  </Box>

                  {/* Body */}
                  <Box sx={{ p: 2.5, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                      <>
                        <Skeleton variant="text" width={50} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1 }} />
                        <Skeleton variant="text" width={130} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mt: 0.5 }} />
                      </>
                    ) : nextAppointment ? (
                      <>
                        {/* Position + Wait — compact row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.5625rem', color: '#86a0cd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Position</Typography>
                            <Typography sx={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'inherit', lineHeight: 1.1, color: '#fff' }}>#1</Typography>
                          </Box>
                          <Box sx={{ pl: 2, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography sx={{ fontSize: '0.5625rem', color: '#86a0cd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Wait</Typography>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'inherit', color: '#66affe' }}>~15 min</Typography>
                          </Box>
                        </Box>

                        {/* Queue track */}
                        <Box mb={2}>
                          <Box sx={{ display: 'flex', gap: 0.75 }}>
                            {[0, 1, 2, 3, 4].map((i) => (
                              <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 99, backgroundColor: i === 0 ? '#22c55e' : i === 1 ? 'rgba(102,175,254,0.3)' : 'rgba(255,255,255,0.08)' }} />
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: '0.625rem', color: '#5a7899', mt: 0.75 }}>You're next · 4 patients behind</Typography>
                        </Box>

                        {/* Doctor info */}
                        <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 1.5, border: '1px solid rgba(255,255,255,0.08)', mb: 2, flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography sx={{ fontSize: '0.5625rem', color: '#5a7899', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, mb: 0.25 }}>Doctor</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit' }}>{nextAppointment.doctorName}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#86a0cd' }}>{nextAppointment.doctorSpecialty ?? 'Consultation'}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{ fontSize: '0.5625rem', color: '#5a7899', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, mb: 0.25 }}>Time</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit' }}>{nextAppointment.startTime}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#86a0cd' }}>{nextAppointment.appointmentDate}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Button
                          onClick={() => handleCancel(nextAppointment.id)}
                          fullWidth size="small"
                          sx={{
                            backgroundColor: 'rgba(255,100,100,0.1)', color: '#fca5a5',
                            borderRadius: 2, fontWeight: 600, fontSize: '0.75rem', py: 0.875,
                            border: '1px solid rgba(255,100,100,0.18)',
                            '&:hover': { backgroundColor: 'rgba(255,100,100,0.2)' },
                          }}
                        >
                          Leave Queue
                        </Button>
                      </>
                    ) : (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 1 }}>
                        <Typography sx={{ fontSize: '2rem', mb: 1 }}>🗓</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', mb: 0.5 }}>No active queue</Typography>
                        <Typography fontSize="0.75rem" sx={{ color: '#5a7899', lineHeight: 1.5 }}>Book an appointment to join the live queue.</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Upcoming Appointments */}
              <Grid item xs={12} lg={6}>
                <Box sx={{ ...card, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <SectionHeader
                    title="Upcoming Appointments"
                    action={
                      <Button onClick={() => setBookOpen(true)} size="small"
                        sx={{ color: C.blue, fontWeight: 600, fontSize: '0.8125rem', backgroundColor: C.blueLight, borderRadius: '8px', px: 1.5, '&:hover': { backgroundColor: C.blueMid } }}
                      >
                        + Book New
                      </Button>
                    }
                  />
                  <Box sx={{ p: 3, flex: 1 }}>
                    {loading ? (
                      <Grid container spacing={2.5}>
                        {[0, 1, 2].map((i) => <Grid item xs={12} md={4} key={i}><Skeleton variant="rounded" height={160} sx={{ borderRadius: 2.5 }} /></Grid>)}
                      </Grid>
                    ) : activeAppointments.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4, color: C.muted }}>
                        <CalendarTodayIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                        <Typography sx={{ fontSize: '0.875rem' }}>No upcoming appointments. Use "+ Book New" to schedule one.</Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2.5}>
                        {activeAppointments.map((appt) => (
                          <Grid item xs={12} md={4} key={appt.id}>
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
                              onCancel={() => handleCancel(appt.id)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Health Vitals — 2×2 grid */}
              <Grid item xs={12} lg={3}>
                <Box sx={{ ...card, height: '100%' }}>
                  <SectionHeader
                    title="My Vitals"
                    action={
                      <Button onClick={() => setVitalsOpen(true)} size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        sx={{ color: C.blue, fontWeight: 600, fontSize: '0.8125rem', backgroundColor: C.blueLight, borderRadius: '8px', px: 1.5, '&:hover': { backgroundColor: C.blueMid } }}
                      >
                        Log
                      </Button>
                    }
                  />
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.muted, mb: 2 }}>
                      Last logged: {Object.values(vitals).some(Boolean) ? 'Today' : 'Never'}
                    </Typography>
                    <Grid container spacing={1.5}>
                      {vitalRows.map((v) => (
                        <Grid item xs={6} key={v.label}>
                          <VitalRow {...v} />
                        </Grid>
                      ))}
                    </Grid>
                    {!Object.values(vitals).some(Boolean) && (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #F0FDFA, #f5f3ff)', border: '1px dashed #c7d2fe', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
                          Track vitals regularly to spot health trends early.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* ══ Row 3: BMI · Water ══ */}
            <Grid container spacing={3}>

              {/* BMI Calculator */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...card, height: '100%' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalculateIcon sx={{ fontSize: 18, color: C.blue }} />
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit' }}>BMI Calculator</Typography>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField size="small" label="Height (cm)" type="number" value={bmiHeight}
                        onChange={e => setBmiHeight(e.target.value)} fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField size="small" label="Weight (kg)" type="number" value={bmiWeight}
                        onChange={e => setBmiWeight(e.target.value)} fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Box>
                    {bmi ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ fontSize: '0.78rem', color: C.slate, fontWeight: 600 }}>Your BMI</Typography>
                          <Chip label={bmi.label} size="small"
                            sx={{ backgroundColor: bmi.color + '18', color: bmi.color, fontWeight: 700, fontSize: '0.7rem' }} />
                        </Box>
                        <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: bmi.color, fontFamily: 'inherit', lineHeight: 1 }}>
                          {bmi.val}
                        </Typography>
                        <Box sx={{ mt: 1.5, position: 'relative', height: 8, borderRadius: 99, overflow: 'hidden', background: `linear-gradient(90deg, ${C.blue} 0%, #16a34a 30%, #d97706 65%, #dc2626 100%)` }}>
                          <Box sx={{ position: 'absolute', top: -2, left: `${Math.min(Math.max(((parseFloat(bmi.val) - 10) / 30) * 100, 0), 96)}%`, width: 12, height: 12, borderRadius: '50%', backgroundColor: C.ink, border: '2px solid #fff', boxShadow: '0 0 0 2px #0f172a' }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          {['<18.5', '18.5–25', '25–30', '>30'].map(r => (
                            <Typography key={r} sx={{ fontSize: '0.6rem', color: C.muted }}>{r}</Typography>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2, color: C.muted }}>
                        <Typography sx={{ fontSize: '0.8rem' }}>Enter height and weight above</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Water Intake Tracker */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...card, height: '100%' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterDropIcon sx={{ fontSize: 18, color: C.blue }} />
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit' }}>Water Intake</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate, fontWeight: 600 }}>
                      {waterGlasses.filter(Boolean).length} / 8 glasses
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(waterGlasses.filter(Boolean).length / 8) * 100}
                      sx={{ height: 6, borderRadius: 99, mb: 2, backgroundColor: C.blueMid, '& .MuiLinearProgress-bar': { backgroundColor: C.blue, borderRadius: 99 } }}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                      {waterGlasses.map((filled, i) => (
                        <Tooltip key={i} title={`Glass ${i + 1}`}>
                          <Box onClick={() => toggleGlass(i)} sx={{
                            width: 40, height: 48, cursor: 'pointer', borderRadius: 2,
                            border: `2px solid ${filled ? C.blue : '#e2e8f0'}`,
                            backgroundColor: filled ? C.blueMid : '#f8fafc',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', pb: 0.5,
                            transition: 'all 0.15s', '&:hover': { borderColor: C.blue },
                          }}>
                            <WaterDropIcon sx={{ fontSize: 18, color: filled ? C.blue : '#cbd5e1' }} />
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: C.slate, mt: 1.5, textAlign: 'center' }}>
                      {waterGlasses.filter(Boolean).length >= 8
                        ? '🎉 Daily goal reached! Great job.'
                        : `${8 - waterGlasses.filter(Boolean).length} more glass${8 - waterGlasses.filter(Boolean).length !== 1 ? 'es' : ''} to reach your daily goal`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

            </Grid>

            {/* ══ Row 4: Symptom Checker ══ */}
            <Grid container spacing={3}>

              {/* Symptom Checker */}
              <Grid item xs={12}>
                <Box sx={{ ...card, height: '100%' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ManageSearchIcon sx={{ fontSize: 18, color: C.blue }} />
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.ink, fontFamily: 'inherit' }}>Symptom Checker</Typography>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100% - 56px)' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: C.slate }}>
                      Select your symptoms and we'll suggest the right specialist.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, flex: 1, alignContent: 'flex-start' }}>
                      {SYMPTOMS_LIST.map(s => {
                        const active = selectedSymptoms.includes(s);
                        return (
                          <Chip key={s} label={s} size="small" clickable onClick={() => {
                            setSelectedSymptoms(prev => active ? prev.filter(x => x !== s) : [...prev, s]);
                            setSymptomResult(null);
                          }}
                          sx={{
                            fontSize: '0.68rem', fontWeight: 600,
                            backgroundColor: active ? C.blue : C.borderSub,
                            color: active ? '#fff' : C.slate,
                            '&:hover': { backgroundColor: active ? C.blueDark : C.border },
                          }} />
                        );
                      })}
                    </Box>
                    {symptomResult && (
                      <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: symptomResult.urgency === 'urgent' ? C.redBg : symptomResult.urgency === 'soon' ? C.amberBg : C.greenBg, border: `1px solid ${symptomResult.urgency === 'urgent' ? '#fecaca' : symptomResult.urgency === 'soon' ? '#fde68a' : '#bbf7d0'}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: C.ink }}>👨‍⚕️ {symptomResult.specialist}</Typography>
                          <Chip label={symptomResult.urgency.toUpperCase()} size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, height: 18, backgroundColor: symptomResult.urgency === 'urgent' ? '#fecaca' : symptomResult.urgency === 'soon' ? '#fde68a' : '#bbf7d0', color: symptomResult.urgency === 'urgent' ? '#b91c1c' : symptomResult.urgency === 'soon' ? '#b45309' : '#15803d' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: C.slate, lineHeight: 1.6 }}>{symptomResult.advice}</Typography>
                        <Button size="small" onClick={() => { setBookOpen(true); setSymptomResult(null); }}
                          sx={{ mt: 1.5, backgroundColor: C.blue, color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem', boxShadow: 'none', '&:hover': { backgroundColor: C.blueDark } }}>
                          Book with {symptomResult.specialist}
                        </Button>
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      disabled={selectedSymptoms.length === 0}
                      onClick={() => setSymptomResult(recommendSpecialist(selectedSymptoms))}
                      sx={{ background: `linear-gradient(90deg, ${C.blue}, ${C.blueBright})`, borderRadius: '10px', fontWeight: 700, boxShadow: 'none', '&.Mui-disabled': { backgroundColor: C.border, color: C.muted } }}
                    >
                      Check Symptoms ({selectedSymptoms.length})
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>

          </Box>
          </Box>/* dashboard content */
          )}{/* end chatOpen ternary */}
        </Box>{/* main */}
      </Box>

      <BookAppointmentDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={(appt) => {
          setAppointments((prev) => [...prev, appt]);
          if (appt.status === 'PAYMENT_PENDING' && appt.amountPaise && appt.amountPaise > 0) {
            setPaymentAppt(appt);
          } else {
            toast('Appointment booked successfully!', 'success');
          }
        }}
      />
      <LogVitalsDialog
        open={vitalsOpen}
        onClose={() => setVitalsOpen(false)}
        initial={vitals}
        onSave={(v) => {
          setVitals(v);
          toast('Vitals updated', 'success');
        }}
      />
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSaved={(updated) => {
          setProfile(updated);
          toast('Profile updated successfully', 'success');
        }}
      />
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
            setAppointments((prev) =>
              prev.map((a) => a.id === paymentAppt.id ? { ...a, status: 'CONFIRMED', paymentStatus: 'PAID' } : a)
            );
            setPaymentAppt(null);
            toast('Payment successful! Appointment confirmed.', 'success');
          }}
          onClose={() => {
            setPaymentAppt(null);
            toast('Appointment booked. Complete payment to confirm.', 'info');
          }}
        />
      )}
    </Box>
  );
}

// ---------- Profile Dialog ----------

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: PatientProfile | null;
  onSaved: (p: PatientProfile) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileDialog({ open, onClose, profile, onSaved }: ProfileDialogProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleOpen() {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setEditing(false);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const updated = await updatePatientProfile({ firstName, lastName });
      onSaved(updated);
      setEditing(false);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.email.split('@')[0]
    : '';

  const roleLabel = profile?.role === 'PATIENT_ROLE' ? 'Patient' : profile?.role ?? '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 700, color: C.ink, fontSize: '1.125rem', px: 3, pt: 3.5, pb: 1 }}>
        My Profile
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: '16px !important', pb: 2 }}>
        {/* Avatar + name header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ width: 72, height: 72, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, fontSize: '1.5rem', fontWeight: 700 }}>
            {displayName ? getInitials(displayName) : '?'}
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.ink, fontFamily: 'inherit' }}>
              {displayName || '—'}
            </Typography>
            <Chip label={roleLabel} size="small" sx={{ mt: 0.5, backgroundColor: C.blueLight, color: C.blue, fontWeight: 600, fontSize: '0.7rem' }} />
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {editing ? (
          <Stack spacing={2.5}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <EmailIcon sx={{ fontSize: 18, color: C.slate, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: C.ink, fontWeight: 500 }}>{profile?.email ?? '—'}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <BadgeIcon sx={{ fontSize: 18, color: C.slate, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: C.ink, fontWeight: 500 }}>{displayName || '—'}</Typography>
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1 }}>
        {editing ? (
          <>
            <Button onClick={() => setEditing(false)} disabled={saving} sx={{ color: C.slate }}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              sx={{ backgroundColor: C.blue, borderRadius: '8px', fontWeight: 700, px: 3, boxShadow: 'none', '&:hover': { backgroundColor: C.blueDark } }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} sx={{ color: C.slate }}>Close</Button>
            <Button
              onClick={() => setEditing(true)}
              variant="contained"
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              sx={{ backgroundColor: C.blue, borderRadius: '8px', fontWeight: 700, px: 3, boxShadow: 'none', '&:hover': { backgroundColor: C.blueDark } }}
            >
              Edit Profile
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
