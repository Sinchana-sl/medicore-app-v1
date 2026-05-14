import { useEffect, useState } from 'react';
import {
  Box, Button, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip,
  CircularProgress, Alert, Grid, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import {
  getAvailability, addAvailability, updateAvailability, deleteAvailability,
  getClinics, type Availability, type Clinic,
} from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60];
const DAY_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: '#fef3c7', color: '#92400e' },
  1: { bg: '#eff6ff', color: '#0D9488' },
  2: { bg: '#f0fdf4', color: '#15803d' },
  3: { bg: '#fdf4ff', color: '#7e22ce' },
  4: { bg: '#fff7ed', color: '#c2410c' },
  5: { bg: '#eff6ff', color: '#0369a1' },
  6: { bg: '#fef2f2', color: '#b91c1c' },
};

interface AvailForm {
  clinicId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}
const emptyForm = (): AvailForm => ({ clinicId: '', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 });

function RuleCard({ rule, onEdit, onDelete }: { rule: Availability; onEdit: () => void; onDelete: () => void }) {
  const dc = DAY_COLORS[rule.dayOfWeek];
  return (
    <Box sx={{ backgroundColor: '#fff', p: 2.5, borderRadius: '6px', border: '1px solid #E9E9E7', boxShadow: '0 2px 8px -2px rgba(26,54,93,0.06)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Chip label={rule.dayName} size="small" sx={{ backgroundColor: dc.bg, color: dc.color, fontWeight: 700, fontSize: '0.75rem', minWidth: 90 }} />
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#37352F', fontFamily: 'inherit' }}>
        {rule.startTime.slice(0, 5)} – {rule.endTime.slice(0, 5)}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: '#73726E' }}>
        {rule.slotDurationMinutes} min slots
      </Typography>
      {rule.clinicName && (
        <Typography sx={{ fontSize: '0.8125rem', color: '#9B9A97' }}>@ {rule.clinicName}</Typography>
      )}
      {!rule.isActive && <Chip label="Inactive" size="small" sx={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.625rem' }} />}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
        <IconButton size="small" onClick={onEdit} sx={{ color: '#73726E', '&:hover': { color: '#37352F', backgroundColor: '#eff6ff' } }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={onDelete} sx={{ color: '#73726E', '&:hover': { color: '#dc2626', backgroundColor: '#fef2f2' } }}><DeleteIcon fontSize="small" /></IconButton>
      </Box>
    </Box>
  );
}

function AvailDialog({ open, onClose, onSaved, clinics, initial, ruleId }: {
  open: boolean; onClose: () => void; onSaved: () => void;
  clinics: Clinic[]; initial: AvailForm; ruleId?: string;
}) {
  const toast = useToast();
  const [form, setForm] = useState<AvailForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setForm(initial); setError(null); }, [initial, open]);

  const setField = (k: keyof AvailForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.startTime >= form.endTime) { setError('End time must be after start time.'); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
        clinicId: form.clinicId || undefined,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMinutes: form.slotDurationMinutes,
      };
      if (ruleId) await updateAvailability(ruleId, payload);
      else await addAvailability(payload);
      toast(`Schedule ${ruleId ? 'updated' : 'added'} successfully`, 'success');
      onSaved();
    } catch {
      const msg = `Failed to ${ruleId ? 'update' : 'add'} schedule.`;
      setError(msg); toast(msg, 'error');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#37352F', pb: 1 }}>
        {ruleId ? 'Edit Schedule' : 'Add Schedule'}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth select label="Day of Week" value={form.dayOfWeek} onChange={(e) => setField('dayOfWeek', Number(e.target.value))}>
              {DAYS.map((d, i) => <MenuItem key={i} value={i}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Start Time" type="time" value={form.startTime} onChange={(e) => setField('startTime', e.target.value)} inputProps={{ step: 300 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="End Time" type="time" value={form.endTime} onChange={(e) => setField('endTime', e.target.value)} inputProps={{ step: 300 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth select label="Slot Duration" value={form.slotDurationMinutes} onChange={(e) => setField('slotDurationMinutes', Number(e.target.value))}>
              {SLOT_DURATIONS.map(d => <MenuItem key={d} value={d}>{d} minutes</MenuItem>)}
            </TextField>
          </Grid>
          {clinics.length > 0 && (
            <Grid item xs={12}>
              <TextField fullWidth select label="Clinic (optional)" value={form.clinicId} onChange={(e) => setField('clinicId', e.target.value)}>
                <MenuItem value="">— No specific clinic —</MenuItem>
                {clinics.map(c => <MenuItem key={c.id} value={c.id}>{c.name}{c.isPrimary ? ' (Primary)' : ''}</MenuItem>)}
              </TextField>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: '#73726E' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#37352F' }, borderRadius: '6px', px: 3 }}>
          {saving ? 'Saving…' : ruleId ? 'Save Changes' : 'Add Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DoctorAvailabilityPage() {
  const toast = useToast();
  const [rules, setRules] = useState<Availability[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<Availability | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getAvailability(), getClinics()])
      .then(([a, c]) => { setRules(a); setClinics(c); })
      .catch(() => toast('Failed to load availability', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (rule: Availability) => {
    try {
      await deleteAvailability(rule.id);
      toast('Schedule removed', 'success');
      load();
    } catch { toast('Failed to remove schedule', 'error'); }
  };

  const openAdd = () => { setEditRule(null); setDialogOpen(true); };
  const openEdit = (r: Availability) => { setEditRule(r); setDialogOpen(true); };
  const handleSaved = () => { setDialogOpen(false); load(); };

  const initialForm: AvailForm = editRule
    ? { clinicId: editRule.clinicId ?? '', dayOfWeek: editRule.dayOfWeek, startTime: editRule.startTime.slice(0, 5), endTime: editRule.endTime.slice(0, 5), slotDurationMinutes: editRule.slotDurationMinutes }
    : emptyForm();

  // Group by day
  const byDay: Record<number, Availability[]> = {};
  rules.forEach(r => { byDay[r.dayOfWeek] = [...(byDay[r.dayOfWeek] ?? []), r]; });

  return (
    <DoctorPageLayout title="Availability Schedule" subtitle="Set your weekly working hours and slot durations">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#37352F' }, borderRadius: '6px', px: 3, py: 1.25, fontWeight: 600 }}>
          Add Schedule
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : rules.length === 0 ? (
        <Box sx={{ backgroundColor: '#fff', p: 6, borderRadius: '8px', border: '1px solid #E9E9E7', textAlign: 'center' }}>
          <EventAvailableIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography sx={{ color: '#73726E', mb: 2 }}>No availability schedule set up yet.</Typography>
          <Button variant="outlined" onClick={openAdd} sx={{ borderColor: '#37352F', color: '#37352F', borderRadius: 2 }}>Add your first schedule</Button>
        </Box>
      ) : (
        <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E9E9E7', boxShadow: 'none', overflow: 'hidden' }}>
          {DAYS.map((dayName, dow) => {
            const dayRules = byDay[dow];
            if (!dayRules?.length) return null;
            const dc = DAY_COLORS[dow];
            return (
              <Box key={dow}>
                <Box sx={{ px: 3, py: 2, backgroundColor: dc.bg, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: dc.color, fontFamily: 'inherit' }}>{dayName}</Typography>
                  <Chip label={`${dayRules.length} rule${dayRules.length > 1 ? 's' : ''}`} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.6)', color: dc.color, fontSize: '0.625rem', height: 18 }} />
                </Box>
                <Box sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {dayRules.map(r => (
                    <RuleCard key={r.id} rule={r} onEdit={() => openEdit(r)} onDelete={() => handleDelete(r)} />
                  ))}
                </Box>
                <Divider />
              </Box>
            );
          })}
        </Box>
      )}

      <AvailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        clinics={clinics}
        initial={initialForm}
        ruleId={editRule?.id}
      />
    </DoctorPageLayout>
  );
}
