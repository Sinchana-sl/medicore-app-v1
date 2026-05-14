import { C } from '../styles/theme';
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment,
  Avatar, Divider, IconButton, Paper, List, ListItemButton, Switch,
  LinearProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { bookAppointment, type Appointment } from '../services/appointmentService';
import { createPaymentOrder, verifyPayment, simulatePayment } from '../services/paymentService';
import {
  unifiedSearch, getPublicDoctorSlots, geocodeLocation,
  type PublicDoctorResult, type PublicSlot, type NearbyClinic, type PublicClinicInfo,
} from '../services/doctorService';

// ── Razorpay ───────────────────────────────────────────────────────────────────

declare global {
  interface Window { Razorpay: new (options: object) => { open(): void } }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const PAYMENT_TIMEOUT_SEC = 600;
function fmtCountdown(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0D9488','#0D9488','#7c3aed','#0d9488','#e11d48','#b45309','#1d4ed8','#064e3b','#9d174d','#166534','#7e22ce','#155e75'];
function avatarColor(name: string) { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff; return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
function doctorInitials(d: PublicDoctorResult) { return `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`.toUpperCase() || '?'; }
export function doctorFullName(d: PublicDoctorResult) { return `Dr. ${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(); }
function fmtSlotTime(t: string) { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ap}`; }
function fmtDist(km: number) { return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`; }

const TODAY = new Date().toISOString().split('T')[0];
function nowHHMM() { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`; }

const CONSULT_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  IN_PERSON: { label: 'In-Person', icon: <PersonIcon sx={{ fontSize: 11 }} />, bg: '#F0FDFA', color: '#1d4ed8' },
  AUDIO:     { label: 'Audio',     icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 11 }} />, bg: C.greenBg, color: '#15803d' },
  VIDEO:     { label: 'Video',     icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />,   bg: '#fdf4ff', color: '#7e22ce' },
};

const SPECIALTIES = ['Cardiology','Dermatology','General Practice','Neurology','Oncology','Orthopedics','Pediatrics','Psychiatry','Radiology','Surgery'];
const TYPE_LABELS: Record<string, string> = { IN_PERSON: 'In-Person Visit', AUDIO: 'Audio Call', VIDEO: 'Video Call' };

// ── Sub-components ─────────────────────────────────────────────────────────────

function DoctorResultCard({ doc, onSelect }: { doc: PublicDoctorResult; onSelect: (d: PublicDoctorResult, clinicId: string) => void }) {
  const color = avatarColor(doc.firstName + doc.lastName);
  return (
    <Box sx={{ backgroundColor: C.paper, borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)', transition: 'box-shadow 0.15s, border-color 0.15s', '&:hover': { borderColor: C.blueMid, boxShadow: '0 6px 24px -4px rgba(0,97,165,0.12)' } }}>
      <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar sx={{ width: 52, height: 52, backgroundColor: color, fontSize: '1rem', fontWeight: 800, flexShrink: 0, fontFamily: 'inherit' }}>{doctorInitials(doc)}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: C.ink, fontFamily: 'inherit' }}>{doctorFullName(doc)}</Typography>
            <Chip label="Accepting Patients" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, backgroundColor: C.greenBg, color: '#16a34a', letterSpacing: '0.02em' }} />
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', color: '#0D9488', fontWeight: 600, mt: 0.25 }}>{doc.specialization ?? 'General'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.75, flexWrap: 'wrap' }}>
            {doc.yearsExperience != null && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><StarIcon sx={{ fontSize: 12, color: '#f59e0b' }} /><Typography sx={{ fontSize: '0.75rem', color: C.slate }}>{doc.yearsExperience} yrs</Typography></Box>}
            {doc.consultationFee != null && <Typography sx={{ fontSize: '0.75rem', color: C.slate }}>from <Box component="span" sx={{ fontWeight: 700, color: C.ink }}>₹{doc.consultationFee}</Box></Typography>}
            {doc.distanceKm != null && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationOnIcon sx={{ fontSize: 12, color: '#0D9488' }} /><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488' }}>{fmtDist(doc.distanceKm)} away</Typography></Box>}
          </Box>
          {doc.bio && <Typography sx={{ fontSize: '0.75rem', color: C.muted, mt: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{doc.bio}</Typography>}
        </Box>
      </Box>
      {doc.clinics && doc.clinics.length > 0 && (
        <>
          <Box sx={{ mx: 2.5, borderTop: `1px solid ${C.borderSub}` }} />
          <Box sx={{ px: 2.5, pt: 1.75, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>Clinics</Typography>
            {doc.clinics.map((clinic) => <ClinicInfoRow key={clinic.id} clinic={clinic} onBook={() => onSelect(doc, clinic.id)} />)}
          </Box>
        </>
      )}
    </Box>
  );
}

function ClinicInfoRow({ clinic, onBook }: { clinic: PublicClinicInfo; onBook?: () => void }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: C.surface, border: `1px solid ${C.borderSub}` }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocalHospitalIcon sx={{ fontSize: 13, color: '#0D9488', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.ink }} noWrap>{clinic.name}</Typography>
            {clinic.isPrimary && <Box sx={{ px: 0.75, py: 0.125, borderRadius: 10, backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}><Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#92400e', letterSpacing: '0.04em' }}>PRIMARY</Typography></Box>}
          </Box>
          {(clinic.address || clinic.city) && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}><LocationOnIcon sx={{ fontSize: 11, color: C.muted, flexShrink: 0 }} /><Typography sx={{ fontSize: '0.75rem', color: C.slate }} noWrap>{[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ')}</Typography></Box>}
          {clinic.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.375 }}><PhoneOutlinedIcon sx={{ fontSize: 11, color: C.muted, flexShrink: 0 }} /><Typography sx={{ fontSize: '0.75rem', color: C.slate }}>{clinic.phone}</Typography></Box>}
          {clinic.consultationTypes && clinic.consultationTypes.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.625, mt: 0.75, flexWrap: 'wrap' }}>
              {clinic.consultationTypes.map((ct) => {
                const meta = CONSULT_META[ct.type] ?? { label: ct.type, icon: null, bg: '#F1F0EF', color: C.slate };
                return (
                  <Box key={ct.type} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, borderRadius: 10, backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}22` }}>
                    {meta.icon}<Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: 'inherit' }}>{meta.label}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: 'inherit', opacity: 0.75 }}>· ₹{ct.fee}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
          {clinic.distanceKm != null && <Box><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', textAlign: 'right' }}>{fmtDist(clinic.distanceKm)}</Typography><Typography sx={{ fontSize: '0.6rem', color: C.muted, textAlign: 'right' }}>away</Typography></Box>}
          {onBook && <Button onClick={onBook} size="small" variant="contained" sx={{ backgroundColor: '#0D9488', borderRadius: 1.5, fontWeight: 700, fontSize: '0.7rem', px: 1.5, py: 0.5, minWidth: 0, boxShadow: 'none', '&:hover': { backgroundColor: '#0F766E', boxShadow: '0 3px 8px rgba(0,97,165,0.3)' } }}>Book</Button>}
        </Box>
      </Box>
    </Box>
  );
}

function NearbyFacilityCard({ facility: c }: { facility: NearbyClinic }) {
  const isHospital = c.type === 'hospital';
  return (
    <Box sx={{ backgroundColor: C.paper, borderRadius: 2.5, border: `1px solid ${C.border}`, p: 2, display: 'flex', gap: 1.75, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, backgroundColor: isHospital ? '#F0FDFA' : C.greenBg, color: isHospital ? '#0D9488' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LocalHospitalIcon sx={{ fontSize: 19 }} /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: C.ink }}>{c.name}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: isHospital ? '#0D9488' : '#15803d', fontWeight: 600, textTransform: 'capitalize', mt: 0.125 }}>{c.type}</Typography>
        {c.address && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}><LocationOnIcon sx={{ fontSize: 12, color: C.muted, flexShrink: 0 }} /><Typography sx={{ fontSize: '0.75rem', color: C.slate }} noWrap>{c.address}</Typography></Box>}
        {c.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375, mt: 0.375 }}><PhoneOutlinedIcon sx={{ fontSize: 11, color: C.muted }} /><Typography sx={{ fontSize: '0.75rem', color: C.slate }}>{c.phone}</Typography></Box>}
      </Box>
      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Box sx={{ px: 1, py: 0.375, borderRadius: 10, backgroundColor: '#F0FDFA' }}><Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0D9488' }}>{fmtDist(c.distanceKm)}</Typography></Box>
      </Box>
    </Box>
  );
}

// ── Main Dialog ─────────────────────────────────────────────────────────────────

export interface BookDialogProps {
  open: boolean;
  onClose: () => void;
  onBooked: (appt: Appointment) => void;
}

type BookStep = 'search' | 'results' | 'confirm' | 'payment';
type PayStage = 'idle' | 'loading' | 'checkout' | 'verifying' | 'success' | 'error';

const BANGALORE_VIEWBOX = '77.38,12.83,77.78,13.14';

export default function BookAppointmentDialog({ open, onClose, onBooked }: BookDialogProps) {
  // ── booking state ─────────────────────────────────────────────────────────
  const [step, setStep]                       = useState<BookStep>('search');
  const [specialty, setSpecialty]             = useState('');
  const [location, setLocation]               = useState('');
  const [locationOptions, setLocationOptions] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [locationCoords, setLocationCoords]   = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locating, setLocating]               = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searching, setSearching]             = useState(false);
  const [results, setResults]                 = useState<PublicDoctorResult[]>([]);
  const [nearbyClinics, setNearbyClinics]     = useState<NearbyClinic[]>([]);
  const [selected, setSelected]               = useState<PublicDoctorResult | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [date, setDate]                       = useState('');
  const [slots, setSlots]                     = useState<PublicSlot[]>([]);
  const [slotsLoading, setSlotsLoading]       = useState(false);
  const [selectedSlot, setSelectedSlot]       = useState<PublicSlot | null>(null);
  const [consultationType, setConsultationType] = useState('IN_PERSON');
  const [reason, setReason]                   = useState('');
  const [isForSelf, setIsForSelf]             = useState(true);
  const [patientName, setPatientName]         = useState('');
  const [patientPhone, setPatientPhone]       = useState('');
  const [patientAge, setPatientAge]           = useState('');
  const [patientGender, setPatientGender]     = useState('');
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [booking, setBooking]                 = useState(false);
  const [error, setError]                     = useState('');

  // ── payment state ─────────────────────────────────────────────────────────
  const [bookedAppt, setBookedAppt]   = useState<Appointment | null>(null);
  const [payStage, setPayStage]       = useState<PayStage>('idle');
  const [payError, setPayError]       = useState('');
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SEC);
  const rzpRef    = useRef<ReturnType<typeof window.Razorpay> | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (step === 'payment') {
      setSecondsLeft(PAYMENT_TIMEOUT_SEC);
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => { if (s <= 1) { stopTimer(); return 0; } return s - 1; });
      }, 1000);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [step, stopTimer]);

  function reset() {
    setStep('search'); setSpecialty(''); setLocation(''); setLocationOptions([]); setLocationCoords(null);
    setResults([]); setNearbyClinics([]); setSelected(null); setSelectedClinicId('');
    setDate(''); setSlots([]); setSelectedSlot(null);
    setConsultationType('IN_PERSON'); setReason('');
    setIsForSelf(true); setPatientName(''); setPatientPhone('');
    setPatientAge(''); setPatientGender(''); setWhatsappUpdates(false);
    setError(''); setBookedAppt(null); setPayStage('idle'); setPayError('');
    stopTimer();
  }

  function handleClose() { reset(); onClose(); }

  // ── location ──────────────────────────────────────────────────────────────

  function handleLocationInput(value: string) {
    setLocation(value); setLocationCoords(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setLocationOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=8&addressdetails=1&viewbox=${BANGALORE_VIEWBOX}&bounded=1`;
        const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data: Array<{ display_name: string; lat: string; lon: string; address: Record<string, string> }> = await resp.json();
        const seen = new Set<string>();
        const suggestions: Array<{ name: string; lat: number; lon: number }> = [];
        for (const item of data) {
          const area = item.address.suburb || item.address.neighbourhood || item.address.quarter || item.address.city_district || item.address.village || item.address.town || item.display_name.split(',')[0].trim();
          if (area && !seen.has(area)) { seen.add(area); suggestions.push({ name: area, lat: parseFloat(item.lat), lon: parseFloat(item.lon) }); }
        }
        setLocationOptions(suggestions);
      } catch { setLocationOptions([]); } finally { setLocationLoading(false); }
    }, 350);
  }

  async function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
      const { latitude, longitude } = pos.coords;
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16`, { headers: { 'Accept-Language': 'en' } });
      const data = await resp.json();
      const city = data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || data.address?.city_district || data.address?.village || data.address?.town || data.address?.city || '';
      if (city) { setLocation(city); setLocationCoords({ lat: latitude, lon: longitude }); }
    } catch { /* user can type manually */ } finally { setLocating(false); }
  }

  // ── search ────────────────────────────────────────────────────────────────

  async function handleSearch() {
    if (!specialty) { setError('Please select a specialization.'); return; }
    setError(''); setSearching(true);
    try {
      let coords = locationCoords;
      if (!coords && location.trim()) coords = await geocodeLocation(location.trim());
      const { registeredDoctors, nearbyFacilities } = await unifiedSearch(specialty, location, coords);
      setResults(registeredDoctors); setNearbyClinics(nearbyFacilities); setStep('results');
    } catch { setError('Failed to search doctors. Please try again.'); } finally { setSearching(false); }
  }

  // ── slots — filter past times when today is selected ─────────────────────

  async function loadSlots(d: string, profileId: string, clinicId: string) {
    if (!d || !profileId) return;
    setSlotsLoading(true); setSlots([]); setSelectedSlot(null);
    try {
      const data = await getPublicDoctorSlots(profileId, d, clinicId || undefined);
      const available = data.filter(s => s.status === 'AVAILABLE');
      const filtered = d === TODAY
        ? available.filter(s => s.startTime > nowHHMM())
        : available;
      setSlots(filtered);
    } catch { setSlots([]); } finally { setSlotsLoading(false); }
  }

  function handleDateChange(d: string) {
    setDate(d); setSelectedSlot(null);
    if (selected) loadSlots(d, selected.profileId, selectedClinicId);
  }

  function handleSelectDoctor(doc: PublicDoctorResult, clinicId: string) {
    const clinic = doc.clinics?.find(c => c.id === clinicId);
    const firstType = clinic?.consultationTypes?.[0]?.type ?? 'IN_PERSON';
    setSelected(doc); setSelectedClinicId(clinicId); setConsultationType(firstType);
    setDate(''); setSlots([]); setSelectedSlot(null); setStep('confirm');
  }

  // ── booking ───────────────────────────────────────────────────────────────

  async function handleConfirmBook() {
    if (!selected || !selectedSlot) {
      setError('Please pick a date and select a time slot.');
      return;
    }
    if (!isForSelf) {
      if (!patientName.trim()) { setError('Patient name is required.'); return; }
      if (!patientPhone.trim()) { setError('Patient phone number is required.'); return; }
      if (!patientAge || isNaN(Number(patientAge))) { setError('Patient age is required.'); return; }
      if (!patientGender) { setError('Please select patient gender.'); return; }
    }
    setBooking(true); setError('');
    try {
      const selectedClinic = selected.clinics?.find(c => c.id === selectedClinicId);
      const ctFee = selectedClinic?.consultationTypes?.find(ct => ct.type === consultationType)?.fee;
      const fee = ctFee ?? selected.consultationFee;
      const amountPaise = fee ? Math.round(Number(fee) * 100) : 0;

      const appt = await bookAppointment({
        doctorName: doctorFullName(selected),
        doctorSpecialty: selected.specialization,
        clinicName: selectedSlot.clinicName,
        appointmentDate: selectedSlot.slotDate,
        startTime: selectedSlot.startTime,
        consultationType, reason, isForSelf,
        patientName: isForSelf ? undefined : patientName.trim(),
        patientPhone: isForSelf ? undefined : patientPhone.trim(),
        patientAge: isForSelf ? undefined : Number(patientAge),
        patientGender: isForSelf ? undefined : patientGender,
        whatsappUpdates,
        doctorProfileId: selected.profileId,
        amountPaise: amountPaise > 0 ? amountPaise : undefined,
        slotId: selectedSlot.id,
      });

      if (amountPaise > 0) {
        // Stay in dialog and move to payment step
        setBookedAppt(appt);
        setStep('payment');
      } else {
        // Free appointment — already confirmed, close immediately
        onBooked(appt);
        handleClose();
      }
    } catch { setError('Failed to book. Please try again.'); } finally { setBooking(false); }
  }

  // ── payment ───────────────────────────────────────────────────────────────

  async function handlePay() {
    if (!bookedAppt) return;
    setPayStage('loading'); setPayError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment script. Check your connection.');
      const order = await createPaymentOrder(bookedAppt.id);
      setPayStage('checkout');
      const options = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: 'MediCore',
        description: `Consultation with ${bookedAppt.doctorName}`,
        order_id: order.orderId,
        prefill: { name: order.patientName, email: order.patientEmail, contact: order.keyId.startsWith('rzp_test_') ? '+919999999999' : (bookedAppt.patientPhone ?? '') },
        theme: { color: '#0D9488' },
        modal: { ondismiss: () => { if (payStage !== 'success') setPayStage('idle'); } },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          stopTimer(); setPayStage('verifying');
          try {
            await verifyPayment({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
            setPayStage('success');
            setTimeout(() => { onBooked({ ...bookedAppt, status: 'CONFIRMED', paymentStatus: 'PAID' }); handleClose(); }, 1800);
          } catch {
            setPayStage('error');
            setPayError('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        },
      };
      rzpRef.current = new window.Razorpay(options);
      rzpRef.current.open();
    } catch (e) {
      setPayStage('error');
      setPayError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    }
  }

  async function handleSimulatePayment() {
    if (!bookedAppt) return;
    setPayStage('verifying'); setPayError(''); stopTimer();
    try {
      await simulatePayment(bookedAppt.id);
      setPayStage('success');
      setTimeout(() => { onBooked({ ...bookedAppt, status: 'CONFIRMED', paymentStatus: 'PAID' }); handleClose(); }, 1800);
    } catch (e) {
      setPayStage('error');
      setPayError(e instanceof Error ? e.message : 'Simulation failed. Please try again.');
    }
  }

  // ── derived ───────────────────────────────────────────────────────────────

  const availableTypes: Array<{ type: string; fee: number | null }> = (() => {
    const clinic = selected?.clinics?.find(c => c.id === selectedClinicId);
    return clinic?.consultationTypes && clinic.consultationTypes.length > 0
      ? clinic.consultationTypes.map(ct => ({ type: ct.type, fee: ct.fee }))
      : [{ type: 'IN_PERSON', fee: null }, { type: 'AUDIO', fee: null }, { type: 'VIDEO', fee: null }];
  })();

  const currentFeeDisplay = (() => {
    const clinic = selected?.clinics?.find(c => c.id === selectedClinicId);
    const ctFee = clinic?.consultationTypes?.find(ct => ct.type === consultationType)?.fee;
    const fee = ctFee ?? selected?.consultationFee;
    return fee && Number(fee) > 0 ? `₹${Number(fee).toLocaleString('en-IN')}` : null;
  })();

  const timerPct = (secondsLeft / PAYMENT_TIMEOUT_SEC) * 100;
  const timerColor = secondsLeft > 120 ? '#22c55e' : secondsLeft > 60 ? '#f59e0b' : '#ef4444';
  const isPayBlocked = payStage === 'loading' || payStage === 'verifying';

  return (
    <Dialog
      open={open}
      onClose={isPayBlocked ? undefined : (step === 'payment' && payStage !== 'idle' && payStage !== 'error') ? undefined : handleClose}
      maxWidth={step === 'results' ? 'md' : 'sm'}
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >

      {/* ── Step 1: Search ── */}
      {step === 'search' && (
        <>
          <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 700, color: C.ink, fontSize: '1.125rem', px: 3, pt: 3.5, pb: 1 }}>
            Find a Doctor
          </DialogTitle>
          <DialogContent sx={{ px: 3, pt: '20px !important', pb: 2 }}>
            <Typography fontSize="0.875rem" color="text.secondary" sx={{ mb: '20px', mt: '4px' }}>
              Enter your location and select a specialization to find nearby doctors.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            <Stack spacing={2.5}>
              <Box sx={{ position: 'relative' }}>
                <TextField fullWidth label="Your Location" placeholder="e.g. Bangalore, Koramangala…" value={location}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setLocationOptions([]); handleSearch(); } }}
                  slotProps={{ input: {
                    startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: C.muted, fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (<>
                      {locationLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={detectLocation} disabled={locating} sx={{ color: locating ? '#9B9A97' : '#0D9488' }}>
                          {locating ? <CircularProgress size={16} /> : <MyLocationIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    </>),
                  }}}
                />
                {locationOptions.length > 0 && (
                  <Paper elevation={4} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300, mt: 0.5, borderRadius: 2, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    <List dense disablePadding>
                      {locationOptions.map((opt) => (
                        <ListItemButton key={opt.name} onClick={() => { setLocation(opt.name); setLocationCoords({ lat: opt.lat, lon: opt.lon }); setLocationOptions([]); }} sx={{ px: 2, py: 1, '&:hover': { backgroundColor: '#f0f7ff' } }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#0D9488', mr: 1.5, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.875rem', color: C.ink }}>{opt.name}</Typography>
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
              <TextField select label="Specialization *" value={specialty} onChange={(e) => { setSpecialty(e.target.value); setError(''); }} fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocalHospitalIcon sx={{ color: C.muted, fontSize: 20 }} /></InputAdornment> } }}>
                {SPECIALTIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3.5, pt: 2, gap: 1 }}>
            <Button onClick={handleClose} sx={{ color: C.slate }}>Cancel</Button>
            <Button onClick={handleSearch} disabled={searching} variant="contained"
              startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              sx={{ backgroundColor: '#0D9488', borderRadius: 2, fontWeight: 600, px: 3, '&:hover': { backgroundColor: '#0F766E' } }}>
              {searching ? 'Searching…' : 'Search'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* ── Step 2: Results ── */}
      {step === 'results' && (
        <>
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${C.borderSub}`, display: 'flex', alignItems: 'center', gap: 1.5, backgroundColor: C.paper }}>
            <IconButton size="small" onClick={() => setStep('search')} sx={{ color: C.slate, flexShrink: 0, border: `1px solid ${C.border}`, borderRadius: 1.5, p: 0.75, '&:hover': { backgroundColor: C.surface } }}>
              <ArrowBackIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', color: C.ink }}>
                {results.length} <Box component="span" sx={{ color: '#0D9488' }}>{specialty}</Box> {results.length === 1 ? 'doctor' : 'doctors'} found
                {location && <Box component="span" sx={{ fontSize: '0.8125rem', fontWeight: 400, color: C.muted }}> near {location}</Box>}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>Select a clinic to book</Typography>
            </Box>
          </Box>
          <DialogContent sx={{ p: 0, backgroundColor: '#f4f6fb', maxHeight: '70vh', overflowY: 'auto' }}>
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {results.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, backgroundColor: C.paper, borderRadius: 3, border: `1px solid ${C.borderSub}` }}>
                  <LocalHospitalIcon sx={{ fontSize: 44, color: C.subtle, mb: 1.5 }} />
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.slate }}>No {specialty} doctors registered yet</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: C.muted, mt: 0.5 }}>Check the nearby facilities below</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {results.map((doc) => <DoctorResultCard key={doc.profileId} doc={doc} onSelect={handleSelectDoctor} />)}
                </Box>
              )}
              {nearbyClinics.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, mt: 0.5 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography fontSize="0.6875rem" fontWeight={700} color="#9B9A97" letterSpacing="0.08em" textTransform="uppercase" sx={{ whiteSpace: 'nowrap' }}>Nearby Hospitals &amp; Clinics</Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {nearbyClinics.map((c) => <NearbyFacilityCard key={c.osmId} facility={c} />)}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
        </>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 'confirm' && selected && (
        <>
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${C.borderSub}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={() => setStep('results')} sx={{ color: C.slate, border: `1px solid ${C.border}`, borderRadius: 1.5, p: 0.75, '&:hover': { backgroundColor: C.surface } }}>
              <ArrowBackIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Box>
              <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', color: C.ink }}>Book Appointment</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>
                {doctorFullName(selected)} · {selected.specialization ?? 'General'}
                {selectedClinicId && selected.clinics?.find(c => c.id === selectedClinicId)?.name
                  ? ` · ${selected.clinics!.find(c => c.id === selectedClinicId)!.name}` : ''}
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ p: 0, backgroundColor: '#f4f6fb', maxHeight: '72vh', overflowY: 'auto' }}>
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

              {/* Date & Slot */}
              <Box sx={{ backgroundColor: C.paper, borderRadius: 3, p: 2.5, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.75 }}>Select Date &amp; Time</Typography>
                <TextField label="Appointment Date *" type="date" value={date} onChange={(e) => handleDateChange(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: TODAY } }}
                  fullWidth size="small" sx={{ mb: date ? 2 : 0 }}
                />
                {date && (slotsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
                ) : slots.length === 0 ? (
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff7ed', border: '1px solid #fed7aa', textAlign: 'center', mt: 1 }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#c2410c', fontWeight: 500 }}>
                      {date === TODAY ? 'No upcoming slots available for today. Try another date.' : 'No slots available for this date. Try another date.'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.slate, mb: 1 }}>{slots.length} slots available</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875 }}>
                      {slots.map((slot) => {
                        const active = selectedSlot?.id === slot.id;
                        return (
                          <Box key={slot.id} onClick={() => setSelectedSlot(slot)} sx={{ px: 1.75, py: 0.75, borderRadius: 2, cursor: 'pointer', backgroundColor: active ? '#0D9488' : '#F7F7F5', border: `2px solid ${active ? '#0D9488' : '#E9E9E7'}`, transition: 'all 0.12s', '&:hover': { borderColor: '#0D9488', backgroundColor: active ? '#0D9488' : '#F0FDFA' } }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? '#fff' : C.inkMid }}>{fmtSlotTime(slot.startTime)}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                    {selectedSlot && (
                      <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#0D9488' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>{fmtSlotTime(selectedSlot.startTime)} – {fmtSlotTime(selectedSlot.endTime)}</Typography>
                      </Box>
                    )}
                  </>
                ))}
              </Box>

              {/* Who is this for */}
              <Box sx={{ backgroundColor: C.paper, borderRadius: 3, p: 2.5, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.75 }}>Who is this appointment for?</Typography>
                <Box sx={{ display: 'flex', gap: 1.25, mb: isForSelf ? 0 : 2.5 }}>
                  {[{ value: true, label: 'Myself', icon: <PersonIcon sx={{ fontSize: 18 }} /> }, { value: false, label: 'Someone Else', icon: <GroupIcon sx={{ fontSize: 18 }} /> }].map(({ value, label, icon }) => (
                    <Box key={String(value)} onClick={() => setIsForSelf(value)} sx={{ flex: 1, p: 1.5, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center', border: `2px solid ${isForSelf === value ? '#0D9488' : '#E9E9E7'}`, backgroundColor: isForSelf === value ? '#F0FDFA' : '#F7F7F5', transition: 'all 0.12s', '&:hover': { borderColor: '#0D9488' } }}>
                      <Box sx={{ color: isForSelf === value ? '#0D9488' : '#9B9A97', mb: 0.5 }}>{icon}</Box>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: isForSelf === value ? '#0D9488' : '#73726E' }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
                {!isForSelf && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                    <TextField label="Patient Full Name *" value={patientName} onChange={(e) => setPatientName(e.target.value)} fullWidth size="small" placeholder="Enter patient's full name" />
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField label="Phone Number *" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} size="small" placeholder="+91 XXXXX XXXXX" sx={{ flex: 1 }} />
                      <TextField label="Age *" type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} size="small" inputProps={{ min: 0, max: 120 }} sx={{ width: 90 }} />
                    </Box>
                    <TextField select label="Gender *" value={patientGender} onChange={(e) => setPatientGender(e.target.value)} fullWidth size="small">
                      {['Male','Female','Other','Prefer not to say'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </TextField>
                  </Box>
                )}
              </Box>

              {/* Consultation type + reason */}
              <Box sx={{ backgroundColor: C.paper, borderRadius: 3, p: 2.5, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.75 }}>Appointment Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                  <TextField select label="Consultation Type *" value={consultationType} onChange={(e) => setConsultationType(e.target.value)} fullWidth size="small">
                    {availableTypes.map(({ type, fee }) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                          <span>{TYPE_LABELS[type] ?? type}</span>
                          {fee != null && fee > 0 && <Typography component="span" sx={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 700 }}>₹{fee}</Typography>}
                          {fee != null && fee === 0 && <Typography component="span" sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Free</Typography>}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} multiline rows={2} fullWidth size="small" placeholder="e.g. Chest pain, follow-up, routine checkup…" />
                </Box>
              </Box>

              {/* WhatsApp toggle */}
              <Box sx={{ backgroundColor: C.paper, borderRadius: 3, px: 2.5, py: 2, border: `2px solid ${whatsappUpdates ? '#22c55e' : '#E9E9E7'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, cursor: 'pointer', transition: 'border-color 0.15s' }} onClick={() => setWhatsappUpdates(v => !v)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, backgroundColor: whatsappUpdates ? C.greenBg : '#F7F7F5', color: whatsappUpdates ? '#16a34a' : '#9B9A97', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WhatsAppIcon sx={{ fontSize: 20 }} /></Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink }}>Get updates on WhatsApp</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.slate }}>Receive appointment reminders &amp; confirmations</Typography>
                  </Box>
                </Box>
                <Switch checked={whatsappUpdates} onChange={(e) => { e.stopPropagation(); setWhatsappUpdates(e.target.checked); }} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#22c55e' } }} />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 2, gap: 1, backgroundColor: C.paper, borderTop: `1px solid ${C.borderSub}` }}>
            <Button onClick={handleClose} sx={{ color: C.slate, fontWeight: 600 }}>Cancel</Button>
            <Button onClick={handleConfirmBook} disabled={booking || !selectedSlot} variant="contained"
              sx={{ flex: 1, backgroundColor: '#0D9488', borderRadius: 2, fontWeight: 700, py: 1.25, boxShadow: 'none', '&:hover': { backgroundColor: '#0F766E', boxShadow: '0 4px 12px rgba(0,97,165,0.3)' } }}>
              {booking ? <CircularProgress size={20} color="inherit" /> : currentFeeDisplay ? `Confirm & Pay ${currentFeeDisplay}` : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* ── Step 4: Payment ── */}
      {step === 'payment' && bookedAppt && (
        <>
          {/* Gradient header */}
          <Box sx={{ backgroundColor: '#0D9488', p: 2.5, color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PaymentIcon sx={{ fontSize: 28 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'inherit' }}>Complete Payment</Typography>
                  <Typography sx={{ fontSize: '0.78rem', opacity: 0.85 }}>Secure payment via Razorpay</Typography>
                </Box>
              </Box>
              {payStage !== 'success' && secondsLeft > 0 && (
                <Box sx={{ textAlign: 'right', minWidth: 72 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: secondsLeft <= 60 ? '#fca5a5' : 'rgba(255,255,255,0.7)' }} />
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'inherit', color: secondsLeft <= 60 ? '#fca5a5' : '#fff', letterSpacing: '0.05em' }}>
                      {fmtCountdown(secondsLeft)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 72, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${timerPct}%`, backgroundColor: timerColor, borderRadius: 99, transition: 'width 1s linear' }} />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Timer warning */}
          {secondsLeft <= 120 && secondsLeft > 0 && payStage !== 'success' && (
            <Box sx={{ backgroundColor: secondsLeft <= 60 ? C.redBg : C.amberBg, px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: secondsLeft <= 60 ? '#dc2626' : '#b45309' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: secondsLeft <= 60 ? '#dc2626' : '#b45309' }}>
                {secondsLeft <= 60 ? `Hurry! Session expires in ${secondsLeft}s` : `Session expires in ${fmtCountdown(secondsLeft)}`}
              </Typography>
            </Box>
          )}

          <DialogContent sx={{ p: 3 }}>
            {/* Appointment summary */}
            <Box sx={{ backgroundColor: C.surface, borderRadius: 2, p: 2, mb: 2, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{bookedAppt.doctorName}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 600, mt: 0.25 }}>{bookedAppt.doctorSpecialty}</Typography>
              <Divider sx={{ my: 1.25 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', color: C.slate }}>{bookedAppt.appointmentDate} · {bookedAppt.startTime}</Typography>
                <Chip label={payStage === 'success' ? 'Confirmed' : 'Awaiting Payment'} size="small"
                  sx={{ backgroundColor: payStage === 'success' ? C.greenBg : C.amberBg, color: payStage === 'success' ? '#15803d' : '#b45309', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
              </Box>
            </Box>

            {/* Test mode hint */}
            {payStage !== 'success' && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, mb: 2, backgroundColor: '#fefce8', borderRadius: 1.5, border: '1px solid #fde68a' }}>
                <Typography sx={{ fontSize: '0.9rem' }}>🧪</Typography>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>Test Mode</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#78350f', lineHeight: 1.6 }}>
                    Click <b>"Simulate Payment"</b> to instantly confirm, or use Razorpay: Card <b>4111 1111 1111 1111</b> · CVV <b>123</b> · OTP <b>123456</b>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Amount */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', color: C.slate, fontWeight: 600 }}>Consultation Fee</Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488', fontFamily: 'inherit' }}>
                {((bookedAppt.amountPaise ?? 0) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
            </Box>

            {/* Stage feedback */}
            {payStage === 'verifying' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, backgroundColor: '#F0FDFA', borderRadius: 2 }}>
                <CircularProgress size={18} sx={{ color: '#0D9488' }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#0D9488', fontWeight: 600 }}>Verifying your payment…</Typography>
              </Box>
            )}
            {payStage === 'success' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, backgroundColor: C.greenBg, borderRadius: 2 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>Payment successful! Your appointment is confirmed.</Typography>
              </Box>
            )}
            {payStage === 'error' && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, backgroundColor: C.redBg, borderRadius: 2 }}>
                <ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, mt: 0.1 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c' }}>{payError}</Typography>
              </Box>
            )}
            {secondsLeft === 0 && payStage !== 'success' && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, backgroundColor: C.redBg, borderRadius: 2 }}>
                <AccessTimeIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, mt: 0.1 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 600 }}>Payment session expired. Your slot is reserved — retry from My Appointments.</Typography>
              </Box>
            )}

            <Typography sx={{ fontSize: '0.68rem', color: C.muted, mt: 2, textAlign: 'center' }}>
              256-bit encrypted · PCI-DSS compliant · UPI, cards, net banking &amp; wallets
            </Typography>
          </DialogContent>

          {payStage !== 'success' && secondsLeft > 0 && (
            <LinearProgress variant="determinate" value={timerPct} sx={{ height: 3, backgroundColor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { backgroundColor: timerColor, transition: 'transform 1s linear' } }} />
          )}

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, flexDirection: 'column', gap: 1 }}>
            {payStage !== 'success' && secondsLeft > 0 && (
              <Button onClick={handleSimulatePayment} disabled={isPayBlocked} variant="contained" fullWidth size="small"
                startIcon={payStage === 'verifying' ? <CircularProgress size={14} color="inherit" /> : <span>🧪</span>}
                sx={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', borderRadius: 2, fontWeight: 700, boxShadow: 'none', py: 1, '&:hover': { background: 'linear-gradient(90deg, #6d28d9, #5b21b6)' }, '&.Mui-disabled': { backgroundColor: C.border, color: C.muted } }}>
                Simulate Payment (Test Mode)
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <Button onClick={handleClose} disabled={isPayBlocked} variant="outlined" size="small"
                sx={{ borderColor: C.border, color: C.slate, borderRadius: 2, fontWeight: 600, flex: 1 }}>
                {secondsLeft === 0 || payStage === 'success' ? 'Close' : 'Cancel'}
              </Button>
              {payStage !== 'success' && secondsLeft > 0 && (
                <Button onClick={handlePay} disabled={isPayBlocked || payStage === 'checkout'} variant="contained" size="small"
                  startIcon={payStage === 'loading' ? <CircularProgress size={14} color="inherit" /> : <PaymentIcon />}
                  sx={{ backgroundColor: '#0D9488', borderRadius: 2, fontWeight: 700, flex: 2, boxShadow: 'none', '&:hover': { backgroundColor: '#0F766E' }, '&.Mui-disabled': { backgroundColor: C.border, color: C.muted } }}>
                  {payStage === 'loading' ? 'Preparing…' : 'Pay via Razorpay'}
                </Button>
              )}
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
