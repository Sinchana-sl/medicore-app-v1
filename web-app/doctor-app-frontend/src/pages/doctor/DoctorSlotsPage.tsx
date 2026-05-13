import { useEffect, useState, type FormEvent } from 'react';
import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  TextField, MenuItem, Grid, Divider,
} from '@mui/material';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import LockIcon from '@mui/icons-material/Lock';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import { getSlots, generateSlots, blockSlot, getClinics, type Slot, type Clinic } from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  AVAILABLE: { label: 'Available', bg: '#f0fdf4', color: '#16a34a' },
  BOOKED:    { label: 'Booked',    bg: '#eff6ff', color: '#1d4ed8' },
  BLOCKED:   { label: 'Blocked',   bg: '#fef2f2', color: '#dc2626' },
};

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function SlotRow({ slot, onBlock }: { slot: Slot; onBlock: () => void }) {
  const s = STATUS_STYLE[slot.status] ?? { label: slot.status, bg: '#f1f5f9', color: '#475569' };
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2,
      border: '1px solid #f1f5f9', backgroundColor: '#fff',
      '&:hover': { boxShadow: '0 2px 8px -2px rgba(26,54,93,0.08)' },
    }}>
      <Box sx={{ minWidth: 100, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 1.5, px: 2, py: 1 }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#002045', fontFamily: 'Manrope, sans-serif' }}>
          {String(slot.startTime).slice(0, 5)}
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
          – {String(slot.endTime).slice(0, 5)}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Chip label={s.label} size="small" sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.6875rem', borderRadius: 6, height: 24 }} />
        {slot.clinicName && (
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>@ {slot.clinicName}</Typography>
        )}
      </Box>

      {slot.status === 'AVAILABLE' && (
        <Button size="small" startIcon={<LockIcon sx={{ fontSize: '0.875rem !important' }} />} onClick={onBlock}
          sx={{ color: '#64748b', borderColor: '#e2e8f0', border: '1px solid', borderRadius: 1.5, fontSize: '0.75rem', px: 1.5, py: 0.5, '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' } }}>
          Block
        </Button>
      )}
    </Box>
  );
}

export default function DoctorSlotsPage() {
  const toast = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);

  // View state
  const [viewDate, setViewDate] = useState(today());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Generate state
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [genClinicId, setGenClinicId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => { getClinics().then(setClinics).catch(() => {}); }, []);

  const loadSlots = (date: string) => {
    setSlotsLoading(true);
    getSlots(date).then(setSlots).catch(() => toast('Failed to load slots', 'error')).finally(() => setSlotsLoading(false));
  };

  useEffect(() => { loadSlots(viewDate); }, [viewDate]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (toDate < fromDate) { setGenError('End date must be on or after start date.'); return; }
    setGenerating(true); setGenResult(null); setGenError(null);
    try {
      const created = await generateSlots({ fromDate, toDate, clinicId: genClinicId || undefined });
      const msg = `Generated ${created.length} slot${created.length !== 1 ? 's' : ''} successfully.`;
      setGenResult(msg);
      toast(msg, 'success');
      if (created.length > 0) loadSlots(viewDate);
    } catch {
      const msg = 'Failed to generate slots. Make sure you have availability rules set up.';
      setGenError(msg); toast(msg, 'error');
    } finally { setGenerating(false); }
  };

  const handleBlock = async (slotId: string) => {
    try {
      await blockSlot(slotId);
      toast('Slot blocked', 'success');
      loadSlots(viewDate);
    } catch { toast('Failed to block slot', 'error'); }
  };

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const key = s.clinicName ?? 'No Clinic';
    acc[key] = [...(acc[key] ?? []), s];
    return acc;
  }, {});

  const available = slots.filter(s => s.status === 'AVAILABLE').length;
  const booked    = slots.filter(s => s.status === 'BOOKED').length;
  const blocked   = slots.filter(s => s.status === 'BLOCKED').length;

  return (
    <DoctorPageLayout title="Slot Management" subtitle="Generate appointment slots and manage their availability">
      <Grid container spacing={3}>
        {/* Generate section */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#002045', fontFamily: 'Manrope, sans-serif', mb: 0.5 }}>Generate Slots</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 3 }}>Creates slots based on your availability schedule.</Typography>

            {genResult && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setGenResult(null)}>{genResult}</Alert>}
            {genError  && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setGenError(null)}>{genError}</Alert>}

            <Box component="form" onSubmit={handleGenerate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} inputProps={{ min: today() }} />
              <TextField fullWidth label="To Date"   type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   inputProps={{ min: fromDate }} />
              {clinics.length > 0 && (
                <TextField fullWidth select label="Clinic (optional)" value={genClinicId} onChange={(e) => setGenClinicId(e.target.value)}>
                  <MenuItem value="">— All clinics —</MenuItem>
                  {clinics.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              )}
              <Button type="submit" variant="contained" disabled={generating}
                sx={{ mt: 1, py: 1.25, backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' }, borderRadius: 2, fontWeight: 600 }}>
                {generating ? 'Generating…' : 'Generate Slots'}
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* View section */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#002045', fontFamily: 'Manrope, sans-serif' }}>Slots for Date</Typography>
              <TextField type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} size="small" sx={{ maxWidth: 180 }} />
            </Box>

            {/* Summary chips */}
            {!slotsLoading && slots.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip label={`${available} Available`} size="small" sx={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 600 }} />
                <Chip label={`${booked} Booked`}       size="small" sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} />
                <Chip label={`${blocked} Blocked`}     size="small" sx={{ backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 600 }} />
              </Box>
            )}

            {slotsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} /></Box>
            ) : slots.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CalendarViewDayIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                <Typography sx={{ color: '#64748b', mb: 1 }}>No slots found for this date.</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Use Generate Slots to create them from your availability schedule.</Typography>
              </Box>
            ) : (
              <Box>
                {Object.entries(grouped).map(([clinicName, clinicSlots]) => (
                  <Box key={clinicName} sx={{ mb: 3 }}>
                    {Object.keys(grouped).length > 1 && (
                      <>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>{clinicName}</Typography>
                        <Divider sx={{ mb: 1.5 }} />
                      </>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {clinicSlots.map(s => <SlotRow key={s.id} slot={s} onBlock={() => handleBlock(s.id)} />)}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </DoctorPageLayout>
  );
}
