import { useState, useRef, useEffect } from 'react';
import {
  Box, IconButton, Typography, Fab, TextField,
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
import { C } from '../styles/theme';

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
    mkMsg('bot', "Hi there! I'm MediBot, your health assistant. I can help you book appointments. What would you like to do?"),
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
      text: "Upload a prescription or lab report and I'll explain it in simple language.\n\nChoose the language you'd like the explanation in.",
    },
  ]);
  const [language, setLanguage] = useState('English');
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── AI chat state ──
  interface AiChatMsg { id: number; role: 'user' | 'assistant'; text: string; loading?: boolean }
  const [aiMsgs, setAiMsgs] = useState<AiChatMsg[]>([
    { id: ++_id, role: 'assistant', text: "Hi! I'm MediBot.\n\nAsk me anything about health — symptoms, medications, wellness tips, or what a medical term means." },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef<HTMLDivElement>(null);

  const bookingBottomRef = useRef<HTMLDivElement>(null);
  const explainBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bookingBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, step]);
  useEffect(() => { explainBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [explainMsgs]);
  useEffect(() => { aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMsgs]);

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
      `Here's your booking summary:\n\nDr. ${d.firstName} ${d.lastName} (${d.specialization || specialty})\n${s.slotDate} at ${s.startTime}\nReason: ${final.reason || 'Not specified'}\nType: ${type.replace('_', ' ')}\n\nShall I confirm this booking?`
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
          `Appointment reserved!\n\n${result.appointmentDate} at ${result.startTime}\n${result.doctorName}\n\nComplete payment of ₹${(result.amountPaise / 100).toLocaleString('en-IN')} to confirm your slot.`
        ));
      } else {
        push(mkMsg('bot',
          `Appointment booked!\n\n${result.appointmentDate} at ${result.startTime}\n${result.doctorName}\nStatus: Confirmed`
        ));
      }
      onAppointmentBooked(result);
      setStep('done');
    } catch {
      push(mkMsg('bot', "Sorry, there was an error booking your appointment. Please try again."));
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
      setExplainMsgs(prev => prev.map(m => m.loading ? { ...m, loading: false, text: explanation } : m));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not analyse document. Please try again.';
      setExplainMsgs(prev => prev.map(m => m.loading ? { ...m, loading: false, text: `Error: ${msg}` } : m));
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
    const history: ChatMessage[] = aiMsgs
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.text }));
    history.push({ role: 'user', content: text });
    try {
      const reply = await sendChatMessage(history);
      setAiMsgs(prev => prev.map(m => m.loading ? { ...m, loading: false, text: reply } : m));
    } catch {
      setAiMsgs(prev => prev.map(m => m.loading
        ? { ...m, loading: false, text: 'Sorry, I had trouble responding. Please try again.' }
        : m
      ));
    } finally {
      setAiLoading(false);
    }
  }

  // ── shared styles ─────────────────────────────────────────────────────────────

  const chipSx = {
    backgroundColor: C.blueLight, color: C.blue, fontWeight: 600, fontSize: '0.72rem',
    border: `1px solid ${C.blueMid}`,
    '&:hover': { backgroundColor: C.blueMid },
  };

  const sendBtnSx = {
    backgroundColor: C.blue, color: '#fff', borderRadius: '8px',
    '&:hover': { backgroundColor: C.blueDark },
    '&.Mui-disabled': { backgroundColor: C.borderSub, color: C.muted },
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', fontSize: '0.82rem', backgroundColor: C.surface,
      '& fieldset': { borderColor: C.border },
      '&:hover fieldset': { borderColor: C.subtle },
      '&.Mui-focused fieldset': { borderColor: C.blue },
    },
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
            <Stack direction="row" sx={{ mb: 1.25, flexWrap: 'wrap', gap: 0.75 }}>
              {SPECIALTIES.map(s => (
                <Chip key={s} label={s} onClick={() => pickSpecialty(s)} clickable size="small" sx={chipSx} />
              ))}
            </Stack>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Or type a specialty…" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) pickSpecialty(input.trim()); }}
                fullWidth sx={inputSx} />
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
              fullWidth sx={inputSx} />
            <IconButton onClick={sendLocation} disabled={!input.trim()} sx={sendBtnSx}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'show_doctors':
        return (
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 200, overflow: 'auto' }}>
            {doctors.map((d, i) => (
              <Box key={i} onClick={() => pickDoctor(d)}
                sx={{
                  p: 1.25, cursor: 'pointer', borderRadius: '8px',
                  border: `1px solid ${C.border}`, backgroundColor: C.paper,
                  '&:hover': { borderColor: C.blue, backgroundColor: C.blueLight },
                  transition: 'all 0.15s',
                }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.ink }}>
                  Dr. {d.firstName} {d.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: C.slate, mt: 0.25 }}>
                  {d.specialization} · {d.clinicCity || location}{d.consultationFee ? ` · ₹${d.consultationFee}` : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      case 'ask_date': case 'loading_slots':
        return (
          <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField type="date" size="small" value={date}
              onChange={e => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
              fullWidth sx={inputSx}
              disabled={step === 'loading_slots'} />
            <IconButton onClick={submitDate} disabled={!date || step === 'loading_slots'} sx={sendBtnSx}>
              {step === 'loading_slots' ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        );
      case 'show_slots':
        return (
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {slots.map((s, i) => (
                <Chip key={i} label={s.startTime} onClick={() => pickSlot(s)} clickable size="small" sx={chipSx} />
              ))}
            </Stack>
          </Box>
        );
      case 'ask_reason':
        return (
          <Box sx={{ p: 1.5 }}>
            <Chip label="Skip" onClick={() => submitReason('')} clickable size="small"
              sx={{ mb: 1, backgroundColor: C.borderSub, color: C.slate, fontWeight: 600 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Reason for visit…" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) submitReason(input.trim()); }}
                fullWidth sx={inputSx} />
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
              <Chip key={t} label={t.replace('_', ' ')} onClick={() => pickConsultType(t)} clickable size="small" sx={chipSx} />
            ))}
          </Stack>
        );
      case 'confirm':
        return (
          <Stack direction="row" sx={{ p: 1.5, gap: 1 }}>
            <Chip label="Confirm booking" onClick={() => confirmBooking(true)} clickable
              sx={{ backgroundColor: C.greenBg, color: C.green, fontWeight: 700, border: `1px solid ${C.green}30`, '&:hover': { backgroundColor: '#d1fae5' } }} />
            <Chip label="Cancel" onClick={() => confirmBooking(false)} clickable
              sx={{ backgroundColor: C.redBg, color: C.red, fontWeight: 700, border: `1px solid ${C.red}30`, '&:hover': { backgroundColor: '#fecaca' } }} />
          </Stack>
        );
      case 'booking':
        return (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={22} sx={{ color: C.blue }} />
          </Box>
        );
      default: return null;
    }
  }

  // ─── Bubble helpers ───────────────────────────────────────────────────────────

  const botBubble = {
    maxWidth: '82%', backgroundColor: C.paper, color: C.ink,
    px: 1.5, py: 1, borderRadius: '4px 14px 14px 14px',
    fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-line',
    border: `1px solid ${C.border}`,
  };

  const userBubble = {
    maxWidth: '82%', backgroundColor: C.blue, color: '#fff',
    px: 1.5, py: 1, borderRadius: '14px 14px 4px 14px',
    fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-line',
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* FAB only in uncontrolled mode */}
      {!isControlled && (
        <Fab onClick={() => setInternalOpen(o => !o)} size="large"
          sx={{
            position: 'fixed', bottom: 28, right: 28,
            backgroundColor: C.blue, color: '#fff', boxShadow: '0 4px 16px rgba(13,148,136,0.35)',
            zIndex: 1300,
            '&:hover': { backgroundColor: C.blueDark },
          }}>
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      )}

      {open && (
        <Box
          sx={isControlled ? {
            width: '100%', height: '100%',
            borderRadius: 0, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            border: 'none', backgroundColor: C.paper,
          } : {
            position: 'fixed', bottom: 96, right: 28,
            width: 380, height: 570,
            borderRadius: '12px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            zIndex: 1299,
            border: `1px solid ${C.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            backgroundColor: C.paper,
          }}>

          {/* Header */}
          <Box sx={{ backgroundColor: C.blue, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.15)', width: 34, height: 34, borderRadius: '8px' }}>
              <SmartToyIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', lineHeight: 1.2 }}>MediBot</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>AI Health Assistant</Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5, '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab} onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 36, backgroundColor: C.surface,
              borderBottom: `1px solid ${C.border}`,
              '& .MuiTab-root': { minHeight: 36, fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', py: 0, minWidth: 0, color: C.slate },
              '& .Mui-selected': { color: C.blue },
              '& .MuiTabs-indicator': { backgroundColor: C.blue, height: 2 },
            }}>
            <Tab icon={<ChatIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Book" />
            <Tab icon={<ArticleIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Documents" />
            <Tab icon={<PsychologyIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="AI Chat" />
          </Tabs>

          {/* ── Tab 0: Appointment booking ── */}
          {tab === 0 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, backgroundColor: C.surface }}>
                {messages.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 0.75 }}>
                    {m.from === 'bot' && (
                      <Avatar sx={{ backgroundColor: C.blue, width: 26, height: 26, borderRadius: '6px', flexShrink: 0 }}>
                        <SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} />
                      </Avatar>
                    )}
                    <Box sx={m.from === 'user' ? userBubble : botBubble}>{m.text}</Box>
                  </Box>
                ))}
                <div ref={bookingBottomRef} />
              </Box>
              <Divider sx={{ borderColor: C.border }} />
              {renderBookingActions()}
            </>
          )}

          {/* ── Tab 1: Explain document ── */}
          {tab === 1 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, backgroundColor: C.surface }}>
                {explainMsgs.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 0.75 }}>
                    {m.from === 'bot' && (
                      <Avatar sx={{ backgroundColor: C.blue, width: 26, height: 26, borderRadius: '6px', flexShrink: 0 }}>
                        <SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} />
                      </Avatar>
                    )}
                    <Box sx={m.from === 'user'
                      ? { ...userBubble, backgroundColor: C.blueLight, color: C.blue, border: `1px solid ${C.blueMid}` }
                      : botBubble}>
                      {m.loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={12} sx={{ color: C.blue }} />
                          <Typography sx={{ fontSize: '0.78rem', color: C.slate }}>Analysing document…</Typography>
                        </Box>
                      ) : m.fileName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <UploadFileIcon sx={{ fontSize: 15, color: C.blue }} />
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{m.fileName}</Typography>
                        </Box>
                      ) : m.text}
                    </Box>
                  </Box>
                ))}
                <div ref={explainBottomRef} />
              </Box>

              {analyzing && (
                <LinearProgress sx={{ height: 2, backgroundColor: C.blueMid, '& .MuiLinearProgress-bar': { backgroundColor: C.blue } }} />
              )}

              <Divider sx={{ borderColor: C.border }} />

              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25, backgroundColor: C.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TranslateIcon sx={{ fontSize: 16, color: C.slate }} />
                  <Typography sx={{ fontSize: '0.73rem', color: C.slate, fontWeight: 600, flexShrink: 0 }}>
                    Explain in:
                  </Typography>
                  <Select
                    value={language} onChange={e => setLanguage(e.target.value)}
                    size="small" variant="outlined"
                    sx={{ flex: 1, fontSize: '0.78rem', '& .MuiOutlinedInput-input': { py: 0.5, px: 1 }, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
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
                    backgroundColor: C.blue, borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem',
                    boxShadow: 'none', py: 0.85, textTransform: 'none',
                    '&:hover': { backgroundColor: C.blueDark, boxShadow: 'none' },
                    '&.Mui-disabled': { backgroundColor: C.borderSub, color: C.muted },
                  }}>
                  {analyzing ? 'Analysing…' : 'Upload Prescription / Report'}
                </Button>
                <Typography sx={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center' }}>
                  Supports JPG, PNG, PDF · Max 10 MB
                </Typography>
              </Box>
            </>
          )}

          {/* ── Tab 2: AI Chat ── */}
          {tab === 2 && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, backgroundColor: C.surface }}>
                {aiMsgs.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 0.75 }}>
                    {m.role === 'assistant' && (
                      <Avatar sx={{ backgroundColor: C.purple, width: 26, height: 26, borderRadius: '6px', flexShrink: 0 }}>
                        <PsychologyIcon sx={{ fontSize: 14, color: '#fff' }} />
                      </Avatar>
                    )}
                    <Box sx={m.role === 'user' ? userBubble : botBubble}>
                      {m.loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[0, 1, 2].map(i => (
                              <Box key={i} sx={{
                                width: 6, height: 6, borderRadius: '50%',
                                backgroundColor: C.blue,
                                animation: 'bounce 1.2s infinite',
                                animationDelay: `${i * 0.2}s`,
                                '@keyframes bounce': {
                                  '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 },
                                  '40%': { transform: 'scale(1)', opacity: 1 },
                                },
                              }} />
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: '0.73rem', color: C.slate }}>MediBot is thinking…</Typography>
                        </Box>
                      ) : m.text}
                    </Box>
                  </Box>
                ))}
                <div ref={aiBottomRef} />
              </Box>

              {/* Suggested prompts */}
              {aiMsgs.length <= 1 && (
                <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.75, backgroundColor: C.paper, borderTop: `1px solid ${C.border}` }}>
                  {[
                    'What causes high blood pressure?',
                    'Explain what HbA1c means',
                    'Tips to improve sleep quality',
                    'Signs of vitamin D deficiency',
                  ].map(prompt => (
                    <Chip key={prompt} label={prompt} size="small" clickable
                      onClick={() => setAiInput(prompt)}
                      sx={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: C.blueLight, color: C.blue, border: `1px solid ${C.blueMid}`, '&:hover': { backgroundColor: C.blueMid } }}
                    />
                  ))}
                </Box>
              )}

              <Divider sx={{ borderColor: C.border }} />

              <Box sx={{ p: 1.25, display: 'flex', gap: 1, alignItems: 'flex-end', backgroundColor: C.paper }}>
                <TextField
                  size="small" fullWidth multiline maxRows={4}
                  placeholder="Ask MediBot anything about health…"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
                  disabled={aiLoading}
                  sx={inputSx}
                />
                <IconButton
                  onClick={sendAiMessage}
                  disabled={!aiInput.trim() || aiLoading}
                  sx={{ ...sendBtnSx, borderRadius: '8px', flexShrink: 0, width: 36, height: 36 }}
                >
                  {aiLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      )}
    </>
  );
}
