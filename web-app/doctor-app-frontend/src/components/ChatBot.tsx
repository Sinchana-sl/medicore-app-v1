import { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, IconButton, Typography, Fab, TextField,
  Avatar, Chip, CircularProgress, Stack, Divider,
  Tab, Tabs, MenuItem, Select, Button, LinearProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TranslateIcon from '@mui/icons-material/Translate';
import ArticleIcon from '@mui/icons-material/Article';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { searchPublicDoctors, getPublicDoctorSlots, type PublicDoctorResult, type PublicSlot } from '../services/doctorService';
import { bookAppointment, type Appointment } from '../services/appointmentService';
import { explainDocument, sendChatMessage, type ChatMessage } from '../services/aiService';

// ─── Appointment booking types ───────────────────────────────────────────────

type Step =
  | 'welcome' | 'ask_specialty' | 'ask_location' | 'searching'
  | 'show_doctors' | 'ask_date' | 'loading_slots' | 'show_slots'
  | 'ask_reason' | 'ask_type' | 'confirm' | 'booking' | 'done';

interface Msg { id: number; from: 'bot' | 'user'; text: string }
interface BookingState {
  doctor?: PublicDoctorResult; slot?: PublicSlot;
  reason?: string; consultationType?: string;
}

interface Props {
  onAppointmentBooked: (appt: Appointment) => void;
  /** When provided, ChatBot is fully controlled — no FAB rendered */
  open?: boolean;
  onClose?: () => void;
}

const SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Dermatologist',
  'Orthopedic', 'Neurologist', 'Gynecologist', 'Pediatrician',
];

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi',
];

// ─── Explain document types ───────────────────────────────────────────────────

interface ExplainMsg {
  id: number;
  from: 'bot' | 'user';
  text?: string;
  fileName?: string;
  loading?: boolean;
}

let _id = 0;
function mkMsg(from: 'bot' | 'user', text: string): Msg { return { id: ++_id, from, text }; }

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatBot({ onAppointmentBooked, open: controlledOpen, onClose }: Props) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const handleClose = () => { isControlled ? onClose?.() : setInternalOpen(false); };
  const [tab, setTab] = useState(0);

  // ── booking state ──
  const [messages, setMessages] = useState<Msg[]>([
    mkMsg('bot', "Hi there! 👋 I'm MediBot, your health assistant. I can help you book appointments. What would you like to do?"),
  ]);
  const [step, setStep] = useState<Step>('welcome');
  const [input, setInput] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [doctors, setDoctors] = useState<PublicDoctorResult[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctorResult | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [booking, setBooking] = useState<BookingState>({});

  // ── explain state ──
  const [explainMsgs, setExplainMsgs] = useState<ExplainMsg[]>([
    {
      id: ++_id, from: 'bot',
      text: "📄 Upload a prescription or lab report and I'll explain it in simple language you can understand.\n\nYou can also choose the language you'd like the explanation in!",
    },
  ]);
  const [language, setLanguage] = useState('English');
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── AI chat state ──
  interface AiChatMsg { id: number; role: 'user' | 'assistant'; text: string; loading?: boolean }
  const [aiMsgs, setAiMsgs] = useState<AiChatMsg[]>([
    { id: ++_id, role: 'assistant', text: "Hi! I'm MediBot 🤖\n\nAsk me anything about health — symptoms, medications, wellness tips, or what a medical term means. I'm here to help!" },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef<HTMLDivElement>(null);

  const bookingBottomRef = useRef<HTMLDivElement>(null);
  const explainBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bookingBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  useEffect(() => {
    explainBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [explainMsgs]);

  useEffect(() => {
    aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMsgs]);

  // ── booking helpers ──────────────────────────────────────────────────────────

  function push(...msgs: Msg[]) { setMessages(prev => [...prev, ...msgs]); }
  function botSay(text: string, delay = 400) { setTimeout(() => push(mkMsg('bot', text)), delay); }

  function pickWelcome(choice: string) {
    push(mkMsg('user', choice));
    if (choice === 'Book Appointment') {
      botSay("Great! Let's find you a doctor. What specialty are you looking for?");
      setTimeout(() => setStep('ask_specialty'), 420);
    } else {
      botSay("I'm best at booking appointments for now! Tap 'Book Appointment' to get started.");
    }
  }

  function pickSpecialty(s: string) {
    setSpecialty(s);
    push(mkMsg('user', s));
    botSay(`Got it — looking for a ${s}. Which city or area should I search in?`);
    setTimeout(() => setStep('ask_location'), 420);
    setInput('');
  }

  function sendLocation() {
    const loc = input.trim();
    if (!loc) return;
    setLocation(loc);
    setInput('');
    push(mkMsg('user', loc));
    setStep('searching');
    push(mkMsg('bot', `Searching for ${specialty}s near ${loc}…`));
    searchPublicDoctors(specialty, loc)
      .then(results => {
        if (!results.length) {
          push(mkMsg('bot', "I couldn't find any doctors for that specialty and location. Try a different city or specialty."));
          setStep('ask_specialty');
        } else {
          setDoctors(results.slice(0, 5));
          push(mkMsg('bot', `Found ${Math.min(results.length, 5)} doctor(s). Tap one to select:`));
          setStep('show_doctors');
        }
      })
      .catch(() => {
        push(mkMsg('bot', "Sorry, I had trouble searching. Please try again."));
        setStep('ask_location');
      });
  }

  function pickDoctor(doctor: PublicDoctorResult) {
    setSelectedDoctor(doctor);
    push(mkMsg('user', `Dr. ${doctor.firstName} ${doctor.lastName}`));
    botSay("What date would you like to visit? Pick a date below:");
    setTimeout(() => setStep('ask_date'), 420);
  }

  function submitDate() {
    if (!date || !selectedDoctor?.profileId) return;
    push(mkMsg('user', date));
    setStep('loading_slots');
    push(mkMsg('bot', "Checking available slots…"));
    getPublicDoctorSlots(selectedDoctor.profileId, date)
      .then(all => {
        const available = all.filter(s => s.status === 'AVAILABLE');
        if (!available.length) {
          push(mkMsg('bot', "No available slots on that date. Please pick another date:"));
          setStep('ask_date');
        } else {
          setSlots(available);
          push(mkMsg('bot', "Here are the available time slots — pick one:"));
          setStep('show_slots');
        }
      })
      .catch(() => {
        push(mkMsg('bot', "Couldn't fetch slots. Please try a different date."));
        setStep('ask_date');
      });
  }

  function pickSlot(slot: PublicSlot) {
    setBooking(prev => ({ ...prev, doctor: selectedDoctor!, slot }));
    push(mkMsg('user', slot.startTime));
    botSay("What's the reason for your visit? (tap Skip if you prefer not to say)");
    setTimeout(() => setStep('ask_reason'), 420);
  }

  function submitReason(reason: string) {
    setBooking(prev => ({ ...prev, reason }));
    push(mkMsg('user', reason || 'No specific reason'));
    setInput('');
    botSay("How would you like to consult?");
    setTimeout(() => setStep('ask_type'), 420);
  }

  function pickConsultType(type: string) {
    const final: BookingState = { ...booking, consultationType: type };
    setBooking(final);
    push(mkMsg('user', type.replace('_', ' ')));
    const d = final.doctor!;
    const s = final.slot!;
    botSay(
      `Here's your booking summary:\n\n👨‍⚕️ Dr. ${d.firstName} ${d.lastName} (${d.specialization || specialty})\n📅 ${s.slotDate} at ${s.startTime}\n💊 Reason: ${final.reason || 'Not specified'}\n📞 Type: ${type.replace('_', ' ')}\n\nShall I confirm this booking?`
    );
    setTimeout(() => setStep('confirm'), 420);
  }

  async function confirmBooking(yes: boolean) {
    if (!yes) {
      push(mkMsg('user', 'Cancel'));
      botSay("No worries! Let me know if you'd like to try again.");
      setStep('welcome');
      return;
    }
    push(mkMsg('user', 'Yes, confirm!'));
    setStep('booking');
    push(mkMsg('bot', "Booking your appointment…"));
    try {
      const d = booking.doctor!;
      const s = booking.slot!;
      const fee = d.consultationFee ? Math.round(d.consultationFee * 100) : 0;

      const result = await bookAppointment({
        doctorName: `Dr. ${d.firstName} ${d.lastName}`,
        doctorSpecialty: d.specialization || specialty,
        clinicName: s.clinicName || d.clinicName,
        appointmentDate: s.slotDate,
        startTime: s.startTime,
        consultationType: booking.consultationType || 'IN_PERSON',
        reason: booking.reason || '',
        isForSelf: true,
        whatsappUpdates: false,
        doctorProfileId: d.profileId,
        amountPaise: fee > 0 ? fee : undefined,
      });

      if (result.status === 'PAYMENT_PENDING' && result.amountPaise && result.amountPaise > 0) {
        push(mkMsg('bot',
          `✅ Appointment reserved!\n\n📅 ${result.appointmentDate} at ${result.startTime}\n👨‍⚕️ ${result.doctorName}\n\n💳 Complete payment of ₹${(result.amountPaise / 100).toLocaleString('en-IN')} to confirm your slot. The payment window will open now.`
        ));
      } else {
        push(mkMsg('bot',
          `✅ Appointment booked!\n\n📅 ${result.appointmentDate} at ${result.startTime}\n👨‍⚕️ ${result.doctorName}\nStatus: Confirmed`
        ));
      }

      onAppointmentBooked(result);
      setStep('done');
    } catch {
      push(mkMsg('bot', "Sorry, there was an error booking your appointment. Please try again or use the 'Book Appointment' button on the dashboard."));
      setStep('welcome');
    }
  }

  // ── explain document ──────────────────────────────────────────────────────────

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const userMsg: ExplainMsg = { id: ++_id, from: 'user', fileName: file.name };
    const loadingMsg: ExplainMsg = { id: ++_id, from: 'bot', loading: true };
    setExplainMsgs(prev => [...prev, userMsg, loadingMsg]);
    setAnalyzing(true);

    try {
      const explanation = await explainDocument(file, language);
      setExplainMsgs(prev =>
        prev.map(m => m.loading ? { ...m, loading: false, text: explanation } : m)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not analyse document. Please try again.';
      setExplainMsgs(prev =>
        prev.map(m => m.loading ? { ...m, loading: false, text: `❌ ${msg}` } : m)
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // ── AI chat handler ───────────────────────────────────────────────────────────

  async function sendAiMessage() {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');

    const userMsg: AiChatMsg = { id: ++_id, role: 'user', text };
    const loadingMsg: AiChatMsg = { id: ++_id, role: 'assistant', text: '', loading: true };
    setAiMsgs(prev => [...prev, userMsg, loadingMsg]);
    setAiLoading(true);

    // Build history from existing non-loading messages + new user message
    const history: ChatMessage[] = aiMsgs
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.text }));
    history.push({ role: 'user', content: text });

    try {
      const reply = await sendChatMessage(history);
      setAiMsgs(prev => prev.map(m => m.loading ? { ...m, loading: false, text: reply } : m));
    } catch {
      setAiMsgs(prev => prev.map(m => m.loading
        ? { ...m, loading: false, text: '❌ Sorry, I had trouble responding. Please try again.' }
        : m
      ));
    } finally {
      setAiLoading(false);
    }
  }

  // ── shared styles ─────────────────────────────────────────────────────────────

  const chipSx = {
    backgroundColor: '#e8f4ff', color: '#0061a5', fontWeight: 600,
    '&:hover': { backgroundColor: '#d0eaff' },
  };
  const sendBtnSx = {
    backgroundColor: '#0061a5', color: '#fff', borderRadius: 2,
    '&:hover': { backgroundColor: '#004f8a' },
    '&.Mui-disabled': { backgroundColor: '#cbd5e1', color: '#fff' },
  };

  // ── booking actions ───────────────────────────────────────────────────────────

  function renderBookingActions() {
    switch (step) {
      case 'welcome': case 'done':
        return (
          <Stack direction="row" sx={{ p: 1.5, flexWrap: 'wrap', gap: 1 }}>
            {['Book Appointment', 'Help'].map(c => (
              <Chip key={c} label={c} onClick={() => pickWelcome(c)} clickable sx={chipSx} />
            ))}
          </Stack>
        );
      case 'ask_specialty':
        return (
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.75 }}>
              {SPECIALTIES.map(s => (
                <Chip key={s} label={s} onClick={() => pickSpecialty(s)} clickable size="small" sx={chipSx} />
              ))}
            </Stack>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Or type a specialty…" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) pickSpecialty(input.trim()); }}
                fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              <IconButton onClick={() => { if (input.trim()) pickSpecialty(input.trim()); }}
                disabled={!input.trim()} sx={sendBtnSx}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      case 'ask_location':
        return (
          <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
            <TextField size="small" placeholder="e.g. Bangalore, Mumbai…" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendLocation(); }}
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <IconButton onClick={sendLocation} disabled={!input.trim()} sx={sendBtnSx}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'show_doctors':
        return (
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflow: 'auto' }}>
            {doctors.map((d, i) => (
              <Paper key={i} variant="outlined" onClick={() => pickDoctor(d)}
                sx={{ p: 1.25, cursor: 'pointer', borderRadius: 2, borderColor: '#e2e8f0', '&:hover': { borderColor: '#0061a5', backgroundColor: '#f0f8ff' } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                  Dr. {d.firstName} {d.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {d.specialization} · {d.clinicCity || location}{d.consultationFee ? ` · ₹${d.consultationFee}` : ''}
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      case 'ask_date': case 'loading_slots':
        return (
          <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField type="date" size="small" value={date}
              onChange={e => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              disabled={step === 'loading_slots'} />
            <IconButton onClick={submitDate} disabled={!date || step === 'loading_slots'} sx={sendBtnSx}>
              {step === 'loading_slots' ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        );
      case 'show_slots':
        return (
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {slots.map((s, i) => (
                <Chip key={i} label={s.startTime} onClick={() => pickSlot(s)} clickable sx={chipSx} />
              ))}
            </Stack>
          </Box>
        );
      case 'ask_reason':
        return (
          <Box sx={{ p: 1.5 }}>
            <Chip label="Skip" onClick={() => submitReason('')} clickable size="small"
              sx={{ mb: 1, backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Reason for visit…" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) submitReason(input.trim()); }}
                fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              <IconButton onClick={() => { if (input.trim()) submitReason(input.trim()); }}
                disabled={!input.trim()} sx={sendBtnSx}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      case 'ask_type':
        return (
          <Stack direction="row" sx={{ p: 1.5, gap: 1, flexWrap: 'wrap' }}>
            {['IN_PERSON', 'AUDIO', 'VIDEO'].map(t => (
              <Chip key={t} label={t.replace('_', ' ')} onClick={() => pickConsultType(t)} clickable sx={chipSx} />
            ))}
          </Stack>
        );
      case 'confirm':
        return (
          <Stack direction="row" sx={{ p: 1.5, gap: 1 }}>
            <Chip label="✅ Yes, confirm!" onClick={() => confirmBooking(true)} clickable
              sx={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 700, '&:hover': { backgroundColor: '#bbf7d0' } }} />
            <Chip label="❌ Cancel" onClick={() => confirmBooking(false)} clickable
              sx={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, '&:hover': { backgroundColor: '#fecaca' } }} />
          </Stack>
        );
      case 'booking':
        return (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#0061a5' }} />
          </Box>
        );
      default: return null;
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* FAB only shown in standalone (uncontrolled) mode */}
      {!isControlled && (
        <Fab onClick={() => setInternalOpen(o => !o)} size="large"
          sx={{
            position: 'fixed', bottom: 32, right: 32,
            backgroundColor: '#0061a5', color: '#fff',
            boxShadow: '0 4px 20px rgba(0,97,165,0.45)', zIndex: 1300,
            '&:hover': { backgroundColor: '#004f8a', transform: 'scale(1.05)' },
            transition: 'all 0.2s ease',
          }}>
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      )}

      {open && (
        <Paper elevation={isControlled ? 0 : 8}
          sx={isControlled ? {
            width: '100%', height: '100%',
            borderRadius: 0, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            border: 'none',
          } : {
            // floating mode (standalone FAB)
            position: 'fixed', bottom: 100, right: 32,
            width: 380, height: 560,
            borderRadius: 4, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            zIndex: 1299, border: '1px solid #e2e8f0',
          }}>

          {/* Header */}
          <Box sx={{ backgroundColor: '#0061a5', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ backgroundColor: '#1e88e5', width: 36, height: 36 }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>MediBot</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>AI Health Assistant</Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ ml: 'auto', color: '#fff', p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab} onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 38, backgroundColor: '#f0f7ff',
              '& .MuiTab-root': { minHeight: 38, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', py: 0, minWidth: 0 },
              '& .Mui-selected': { color: '#0061a5' },
              '& .MuiTabs-indicator': { backgroundColor: '#0061a5' },
            }}>
            <Tab icon={<ChatIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Book" />
            <Tab icon={<ArticleIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Documents" />
            <Tab icon={<PsychologyIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="AI Chat" />
          </Tabs>

          {/* ── Tab 0: Appointment booking ── */}
          {tab === 0 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: '#f8fafc' }}>
                {messages.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
                    {m.from === 'bot' && (
                      <Avatar sx={{ backgroundColor: '#0061a5', width: 28, height: 28, flexShrink: 0 }}>
                        <SmartToyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    <Box sx={{
                      maxWidth: '78%',
                      backgroundColor: m.from === 'user' ? '#0061a5' : '#fff',
                      color: m.from === 'user' ? '#fff' : '#0f172a',
                      px: 1.5, py: 1,
                      borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.82rem', lineHeight: 1.55, whiteSpace: 'pre-line',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: m.from === 'bot' ? '1px solid #e2e8f0' : 'none',
                    }}>
                      {m.text}
                    </Box>
                  </Box>
                ))}
                <div ref={bookingBottomRef} />
              </Box>
              <Divider />
              {renderBookingActions()}
            </>
          )}

          {/* ── Tab 1: Explain document ── */}
          {tab === 1 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: '#f8fafc' }}>
                {explainMsgs.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
                    {m.from === 'bot' && (
                      <Avatar sx={{ backgroundColor: '#0061a5', width: 28, height: 28, flexShrink: 0 }}>
                        <SmartToyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    <Box sx={{
                      maxWidth: '82%',
                      backgroundColor: m.from === 'user' ? '#e8f4ff' : '#fff',
                      color: m.from === 'user' ? '#0061a5' : '#0f172a',
                      px: 1.5, py: 1,
                      borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.8rem', lineHeight: 1.65, whiteSpace: 'pre-line',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
                    }}>
                      {m.loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={14} sx={{ color: '#0061a5' }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Analysing document…</Typography>
                        </Box>
                      ) : m.fileName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UploadFileIcon sx={{ fontSize: 16, color: '#0061a5' }} />
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{m.fileName}</Typography>
                        </Box>
                      ) : (
                        m.text
                      )}
                    </Box>
                  </Box>
                ))}
                <div ref={explainBottomRef} />
              </Box>

              {analyzing && <LinearProgress sx={{ height: 2, backgroundColor: '#dbeafe', '& .MuiLinearProgress-bar': { backgroundColor: '#0061a5' } }} />}

              <Divider />

              {/* Language + upload controls */}
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TranslateIcon sx={{ fontSize: 18, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                    Explain in:
                  </Typography>
                  <Select
                    value={language} onChange={e => setLanguage(e.target.value)}
                    size="small" variant="outlined"
                    sx={{ flex: 1, fontSize: '0.78rem', '& .MuiOutlinedInput-input': { py: 0.5, px: 1.25 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    {LANGUAGES.map(l => (
                      <MenuItem key={l} value={l} sx={{ fontSize: '0.82rem' }}>{l}</MenuItem>
                    ))}
                  </Select>
                </Box>

                <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                <Button
                  variant="contained" fullWidth startIcon={<UploadFileIcon />}
                  onClick={() => fileRef.current?.click()}
                  disabled={analyzing}
                  sx={{
                    background: 'linear-gradient(90deg,#0061a5,#0891b2)',
                    borderRadius: 2.5, fontWeight: 700, fontSize: '0.8rem',
                    boxShadow: 'none', py: 0.85,
                    '&:hover': { background: 'linear-gradient(90deg,#004f8a,#0e7490)' },
                    '&.Mui-disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
                  }}>
                  {analyzing ? 'Analysing…' : 'Upload Prescription / Report'}
                </Button>
                <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
                  Supports JPG, PNG, PDF · Max 10 MB
                </Typography>
              </Box>
            </>
          )}
          {/* ── Tab 2: AI Chat ── */}
          {tab === 2 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: '#f8fafc' }}>
                {aiMsgs.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
                    {m.role === 'assistant' && (
                      <Avatar sx={{ backgroundColor: '#7c3aed', width: 28, height: 28, flexShrink: 0 }}>
                        <PsychologyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    <Box sx={{
                      maxWidth: '80%',
                      backgroundColor: m.role === 'user' ? '#0061a5' : '#fff',
                      color: m.role === 'user' ? '#fff' : '#0f172a',
                      px: 1.75, py: 1.1,
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '0.82rem', lineHeight: 1.65, whiteSpace: 'pre-line',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                    }}>
                      {m.loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[0, 1, 2].map(i => (
                              <Box key={i} sx={{
                                width: 7, height: 7, borderRadius: '50%',
                                backgroundColor: '#0061a5',
                                animation: 'bounce 1.2s infinite',
                                animationDelay: `${i * 0.2}s`,
                                '@keyframes bounce': {
                                  '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 },
                                  '40%': { transform: 'scale(1)', opacity: 1 },
                                },
                              }} />
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>MediBot is thinking…</Typography>
                        </Box>
                      ) : m.text}
                    </Box>
                  </Box>
                ))}
                <div ref={aiBottomRef} />
              </Box>

              <Divider />

              {/* Suggested prompts when empty */}
              {aiMsgs.length <= 1 && (
                <Box sx={{ px: 1.5, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {[
                    'What causes high blood pressure?',
                    'Explain what HbA1c means',
                    'Tips to improve sleep quality',
                    'Signs of vitamin D deficiency',
                  ].map(prompt => (
                    <Chip key={prompt} label={prompt} size="small" clickable
                      onClick={() => { setAiInput(prompt); }}
                      sx={{ fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#f0f7ff', color: '#0061a5', border: '1px solid #bfdbfe', '&:hover': { backgroundColor: '#dbeafe' } }}
                    />
                  ))}
                </Box>
              )}

              {/* Input bar */}
              <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  size="small" fullWidth multiline maxRows={4}
                  placeholder="Ask MediBot anything about health…"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
                  disabled={aiLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '0.82rem' } }}
                />
                <IconButton
                  onClick={sendAiMessage}
                  disabled={!aiInput.trim() || aiLoading}
                  sx={{ backgroundColor: '#0061a5', color: '#fff', borderRadius: 2, flexShrink: 0,
                    '&:hover': { backgroundColor: '#004f8a' },
                    '&.Mui-disabled': { backgroundColor: '#cbd5e1', color: '#fff' } }}
                >
                  {aiLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
}
