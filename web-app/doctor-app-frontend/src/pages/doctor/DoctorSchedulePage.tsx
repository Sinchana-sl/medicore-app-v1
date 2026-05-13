import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Divider, Tooltip,
  IconButton, TextField, Typography, Alert, MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import {
  getAvailability, addAvailability, deleteAvailability, generateSlots,
  getClinics,
  type Availability, type Clinic,
} from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const SLOT_DURATIONS = [15, 30, 45, 60];

const DAY_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: '#fef3c7', color: '#92400e' },
  1: { bg: '#eff6ff', color: '#0D9488' },
  2: { bg: '#f0fdf4', color: '#15803d' },
  3: { bg: '#fdf4ff', color: '#7e22ce' },
  4: { bg: '#fff7ed', color: '#c2410c' },
  5: { bg: '#e0f2fe', color: '#0369a1' },
  6: { bg: '#fef2f2', color: '#b91c1c' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0]; }
function daysLater(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
function to12hr(time: string): string {
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function slotCount(startTime: string, endTime: string, duration: number): number {
  const toMins = (t: string) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m; };
  return Math.floor((toMins(endTime) - toMins(startTime)) / duration);
}
function endFromSlots(startTime: string, numSlots: number, duration: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + numSlots * duration;
  return `${Math.floor(total / 60) % 24}`.padStart(2, '0') + ':' + `${total % 60}`.padStart(2, '0');
}
function extractErrorDetail(reason: unknown): string {
  if (reason && typeof reason === 'object') {
    const r = reason as Record<string, unknown>;
    const data = r['response'] && typeof r['response'] === 'object'
      ? (r['response'] as Record<string, unknown>)['data']
      : null;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d['detail'] === 'string') return d['detail'];
      if (typeof d['message'] === 'string') return d['message'];
    }
    if (typeof r['message'] === 'string') return r['message'];
  }
  return 'Unknown error';
}
function isConflictError(reason: unknown): boolean {
  if (reason && typeof reason === 'object') {
    const r = reason as Record<string, unknown>;
    const resp = r['response'] as Record<string, unknown> | null;
    return resp?.['status'] === 409;
  }
  return false;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DoctorSchedulePage() {
  const toast = useToast();
  const [rules, setRules]         = useState<Availability[]>([]);
  const [clinics, setClinics]     = useState<Clinic[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  // Form state
  const [selectedDays, setSelectedDays]   = useState<number[]>([]);
  const [clinicId, setClinicId]           = useState<string>('');
  const [startTime, setStartTime]         = useState('09:00');
  const [endTime, setEndTime]             = useState('17:00');
  const [slotDuration, setSlotDuration]   = useState(30);
  const [numSlots, setNumSlots]           = useState('');

  const slotsLocked = numSlots !== '' && Number(numSlots) > 0;

  const applySlotCount = (start: string, n: string, dur: number) => {
    const parsed = parseInt(n, 10);
    if (parsed > 0) setEndTime(endFromSlots(start, parsed, dur));
  };

  const load = () => {
    setLoading(true);
    Promise.all([getAvailability(), getClinics()])
      .then(([avail, clin]) => { setRules(avail); setClinics(clin); })
      .catch(() => toast('Failed to load schedule', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleDay = (day: number) =>
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );

  const handleSave = async () => {
    if (selectedDays.length === 0) { setError('Select at least one day.'); setIsConflict(false); return; }
    if (!clinicId) { setError('Please select a clinic for this schedule.'); setIsConflict(false); return; }
    if (startTime >= endTime) { setError('End time must be after start time.'); setIsConflict(false); return; }
    setError(null); setIsConflict(false);
    setSaving(true);

    const results = await Promise.allSettled(
      selectedDays.map(day =>
        addAvailability({ clinicId, dayOfWeek: day, startTime, endTime, slotDurationMinutes: slotDuration }),
      ),
    );
    setSaving(false);

    const failed  = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    const succeeded = results.length - failed.length;
    if (succeeded > 0) {
      toast(`Schedule saved for ${succeeded} day${succeeded > 1 ? 's' : ''}`, 'success');
      setSelectedDays([]);
      setNumSlots('');
      load();
    }
    if (failed.length > 0) {
      const firstReason = failed[0].reason;
      const conflict = failed.some(f => isConflictError(f.reason));
      setIsConflict(conflict);
      setError(extractErrorDetail(firstReason));
    }
  };

  const handleDelete = async (rule: Availability) => {
    try {
      await deleteAvailability(rule.id);
      toast('Schedule removed', 'success');
      load();
    } catch {
      toast('Failed to remove schedule', 'error');
    }
  };

  const handleGenerateSlots = async () => {
    setGenerating(true);
    try {
      const created = await generateSlots({ fromDate: todayStr(), toDate: daysLater(7) });
      toast(`Generated ${created.length} slot${created.length !== 1 ? 's' : ''} for the next 7 days`, 'success');
    } catch {
      toast('Failed to generate slots. Make sure you have a schedule set up first.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const byDay: Record<number, Availability[]> = {};
  rules.forEach(r => { byDay[r.dayOfWeek] = [...(byDay[r.dayOfWeek] ?? []), r]; });

  const sectionLabelSx = {
    fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase' as const, letterSpacing: '0.08em', mb: 1.5,
  };

  return (
    <DoctorPageLayout
      title="My Schedule"
      subtitle="Set your weekly availability per clinic and generate appointment slots"
    >
      {/* ── Set Schedule Form ─────────────────────────────────────────────── */}
      <Box sx={{
        backgroundColor: '#fff', p: { xs: 3, md: 4 },
        borderRadius: '8px', border: '1px solid #E9E9E7',
        boxShadow: 'none', mb: 3,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#37352F', fontFamily: 'inherit', mb: 3 }}>
          Set Your Weekly Schedule
        </Typography>

        {/* Error / conflict alert */}
        {error && (
          <Alert
            severity={isConflict ? 'warning' : 'error'}
            icon={isConflict ? <WarningAmberIcon /> : undefined}
            sx={{ mb: 2.5, borderRadius: '6px', alignItems: 'flex-start' }}
            onClose={() => { setError(null); setIsConflict(false); }}
          >
            {isConflict
              ? <><strong>Time conflict detected. </strong>{error}</>
              : error}
          </Alert>
        )}

        {/* Clinic selector */}
        <Typography sx={sectionLabelSx}>Select Clinic *</Typography>
        {clinics.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            You haven't added any clinics yet. Add a clinic from the <strong>Clinics</strong> page first.
          </Alert>
        ) : (
          <TextField
            select
            fullWidth
            label="Clinic *"
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            sx={{ mb: 3 }}
            helperText="Choose which clinic this availability block is for"
          >
            {clinics.map(c => (
              <MenuItem key={c.id} value={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalHospitalIcon sx={{ fontSize: 18, color: '#64748b', flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#37352F' }}>
                      {c.name}
                      {c.isPrimary && (
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.7rem', color: '#0D9488', fontWeight: 700 }}>
                          PRIMARY
                        </Typography>
                      )}
                    </Typography>
                    {(c.address || c.city) && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {[c.address, c.city].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Day toggles */}
        <Typography sx={sectionLabelSx}>Select Days *</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {DAYS.map(({ label, value }) => {
            const active = selectedDays.includes(value);
            const dc = DAY_COLORS[value];
            return (
              <Chip
                key={value}
                label={label}
                onClick={() => toggleDay(value)}
                sx={{
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  minWidth: 56, height: 40, borderRadius: '6px',
                  backgroundColor: active ? dc.bg : '#F7F7F5',
                  color: active ? dc.color : '#94a3b8',
                  border: `2px solid ${active ? dc.color : 'transparent'}`,
                  transition: 'all 0.15s',
                  '&:hover': { backgroundColor: dc.bg, color: dc.color },
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            );
          })}
        </Box>

        {/* Time Range + No. of slots */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography sx={sectionLabelSx}>Time Range *</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                label="Start" type="time" value={startTime}
                onChange={e => { setStartTime(e.target.value); applySlotCount(e.target.value, numSlots, slotDuration); }}
                inputProps={{ step: 300 }}
                sx={{ flex: 1 }}
              />
              <Typography sx={{ color: '#94a3b8', fontWeight: 700 }}>–</Typography>
              <TextField
                label="End" type="time" value={endTime}
                onChange={e => setEndTime(e.target.value)}
                inputProps={{ step: 300 }}
                disabled={slotsLocked}
                sx={{ flex: 1 }}
                helperText={slotsLocked ? 'Auto-computed' : ''}
              />
            </Box>
          </Box>

          <Box sx={{ flex: '0 1 160px' }}>
            <Typography sx={sectionLabelSx}>
              No. of Slots
              <Typography component="span" sx={{ fontSize: '0.6875rem', color: '#cbd5e1', ml: 0.75, fontWeight: 500, textTransform: 'none' }}>
                optional
              </Typography>
            </Typography>
            <TextField
              placeholder="e.g. 8" type="number" value={numSlots}
              onChange={e => { const val = e.target.value; setNumSlots(val); applySlotCount(startTime, val, slotDuration); }}
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: '100%' }}
              helperText={slotsLocked ? `Ends at ${to12hr(endTime)}` : ' '}
            />
          </Box>
        </Box>

        {/* Slot duration */}
        <Typography sx={sectionLabelSx}>Slot Duration *</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {SLOT_DURATIONS.map(d => (
            <Button
              key={d}
              onClick={() => { setSlotDuration(d); applySlotCount(startTime, numSlots, d); }}
              variant={slotDuration === d ? 'contained' : 'outlined'}
              sx={{
                minWidth: 80, borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', py: 1,
                ...(slotDuration === d
                  ? { backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#37352F' }, boxShadow: 'none' }
                  : { borderColor: '#E9E9E7', color: '#64748b', '&:hover': { borderColor: '#94a3b8', backgroundColor: '#F7F7F5' } }
                ),
              }}
            >
              {d} min
            </Button>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || selectedDays.length === 0 || !clinicId}
          sx={{
            px: 4, py: 1.25, borderRadius: '6px', fontWeight: 700, fontSize: '0.9375rem',
            backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#37352F' },
            boxShadow: 'none',
          }}
        >
          {saving ? 'Saving…' : 'Save Schedule'}
        </Button>
      </Box>

      {/* ── Current Schedule ──────────────────────────────────────────────── */}
      <Box sx={{
        backgroundColor: '#fff', borderRadius: '8px',
        border: '1px solid #E9E9E7',
        boxShadow: 'none',
      }}>
        <Box sx={{
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
        }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#37352F', fontFamily: 'inherit' }}>
              Weekly Schedule
            </Typography>
            {!loading && rules.length > 0 && (
              <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.25 }}>
                {rules.length} rule{rules.length !== 1 ? 's' : ''} across {Object.keys(byDay).length} day{Object.keys(byDay).length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained" size="small"
            onClick={handleGenerateSlots}
            disabled={generating || rules.length === 0}
            sx={{
              backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#37352F' },
              borderRadius: '6px', fontWeight: 600, px: 2.5, py: 1, boxShadow: 'none', fontSize: '0.8125rem',
            }}
          >
            {generating ? 'Generating…' : '⚡ Generate Slots (Next 7 Days)'}
          </Button>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : rules.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventAvailableIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
            <Typography sx={{ color: '#64748b', fontWeight: 500 }}>No schedule set up yet.</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.5 }}>
              Select a clinic, days, and time above to get started.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {DAYS.map(({ label, value }) => {
              const dayRules = byDay[value];
              const dc = DAY_COLORS[value];
              const hasRules = dayRules?.length > 0;

              return (
                <Box key={value} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 2,
                  p: 2, borderRadius: '8px',
                  backgroundColor: hasRules ? '#fafbff' : '#F7F7F5',
                  border: `1px solid ${hasRules ? '#e8eef8' : '#F1F0EF'}`,
                  transition: 'all 0.15s',
                  ...(hasRules && { '&:hover': { boxShadow: '0 2px 12px -2px rgba(26,54,93,0.10)', borderColor: '#dbe5f5' } }),
                }}>
                  {/* Day badge */}
                  <Box sx={{
                    minWidth: 44, height: 44, borderRadius: '6px',
                    backgroundColor: hasRules ? dc.bg : '#F1F0EF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Typography sx={{
                      fontSize: '0.75rem', fontWeight: 800,
                      color: hasRules ? dc.color : '#cbd5e1',
                      fontFamily: 'inherit', letterSpacing: '0.02em',
                    }}>
                      {label}
                    </Typography>
                  </Box>

                  {/* Rules */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {!hasRules ? (
                      <Typography sx={{ fontSize: '0.8125rem', color: '#cbd5e1', pt: 1.25, fontStyle: 'italic' }}>
                        Not scheduled
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {dayRules.map(rule => {
                          const count = slotCount(rule.startTime, rule.endTime, rule.slotDurationMinutes);
                          return (
                            <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              {/* Time */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <AccessTimeIcon sx={{ fontSize: '0.875rem', color: dc.color }} />
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                  {to12hr(rule.startTime)} – {to12hr(rule.endTime)}
                                </Typography>
                              </Box>

                              {/* Duration chip */}
                              <Chip
                                label={`${rule.slotDurationMinutes} min`}
                                size="small"
                                sx={{ backgroundColor: dc.bg, color: dc.color, fontWeight: 700, fontSize: '0.6875rem', height: 22, borderRadius: 6 }}
                              />

                              {/* Slot count */}
                              <Tooltip title="Slots per day" placement="top" arrow>
                                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                  {count} slot{count !== 1 ? 's' : ''}/day
                                </Typography>
                              </Tooltip>

                              {/* Clinic badge */}
                              {rule.clinicName && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocalHospitalIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                    {rule.clinicName}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  {/* Delete button */}
                  {hasRules && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                      {dayRules.map(rule => (
                        <Tooltip key={rule.id} title="Remove" placement="left">
                          <IconButton
                            size="small" onClick={() => handleDelete(rule)}
                            sx={{ color: '#cbd5e1', borderRadius: 1.5, '&:hover': { color: '#dc2626', backgroundColor: '#fef2f2' } }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </DoctorPageLayout>
  );
}
