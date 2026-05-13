import { useEffect, useState } from 'react';
import {
  Box, Button, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel,
  Checkbox, Chip, CircularProgress, Alert, Grid, Divider,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import {
  getClinics, addClinic, updateClinic, deleteClinic,
  type Clinic, type ConsultationTypeEntry,
} from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';

// ── Types ──────────────────────────────────────────────────────────────────────

type ConsultationType = 'IN_PERSON' | 'AUDIO' | 'VIDEO';

interface FeeMap { IN_PERSON: string; AUDIO: string; VIDEO: string; }

interface ClinicForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isPrimary: boolean;
  selectedTypes: ConsultationType[];
  fees: FeeMap;
}

const emptyForm = (): ClinicForm => ({
  name: '', address: '', city: '', state: '', pincode: '', phone: '',
  isPrimary: false,
  selectedTypes: [],
  fees: { IN_PERSON: '', AUDIO: '', VIDEO: '' },
});

// ── Consultation type meta ─────────────────────────────────────────────────────

const TYPE_META: Record<ConsultationType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  IN_PERSON: { label: 'In-Person',   icon: <PersonPinCircleIcon sx={{ fontSize: 16 }} />, color: '#15803d', bg: '#f0fdf4' },
  AUDIO:     { label: 'Audio Call',  icon: <PhoneInTalkIcon     sx={{ fontSize: 16 }} />, color: '#0061a5', bg: '#eff6ff' },
  VIDEO:     { label: 'Video Call',  icon: <VideocamIcon        sx={{ fontSize: 16 }} />, color: '#7c3aed', bg: '#f5f3ff' },
};

// ── Clinic Card ────────────────────────────────────────────────────────────────

function ClinicCard({ clinic, onEdit, onDelete }: { clinic: Clinic; onEdit: () => void; onDelete: () => void }) {
  const fullAddress = [clinic.address, clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(', ');
  return (
    <Box sx={{
      backgroundColor: '#fff', p: 3, borderRadius: 3,
      border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -4px rgba(26,54,93,0.06)',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '50%', backgroundColor: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', flexShrink: 0,
          }}>
            <LocalHospitalIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#002045', fontFamily: 'Manrope, sans-serif' }}>
                {clinic.name}
              </Typography>
              {clinic.isPrimary && (
                <Chip label="Primary" size="small" sx={{ backgroundColor: '#002045', color: '#fff', fontSize: '0.625rem', height: 20 }} />
              )}
            </Box>

            {fullAddress && (
              <Box display="flex" alignItems="flex-start" gap={0.75} mb={0.5}>
                <LocationOnIcon sx={{ fontSize: 14, color: '#94a3b8', mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>{fullAddress}</Typography>
              </Box>
            )}
            {clinic.phone && (
              <Box display="flex" alignItems="center" gap={0.75} mb={1}>
                <PhoneIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{clinic.phone}</Typography>
              </Box>
            )}

            {/* Consultation type badges */}
            {clinic.consultationTypes && clinic.consultationTypes.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
                {clinic.consultationTypes.map((ct) => {
                  const meta = TYPE_META[ct.type as ConsultationType];
                  if (!meta) return null;
                  return (
                    <Box key={ct.type} sx={{
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      backgroundColor: meta.bg, color: meta.color,
                      px: 1.25, py: 0.5, borderRadius: 1.5,
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {meta.icon}
                      <span>{meta.label}</span>
                      <Typography component="span" fontSize="0.75rem" fontWeight={700} ml={0.5}>
                        ₹{Number(ct.fee).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          <IconButton size="small" onClick={onEdit}
            sx={{ color: '#64748b', '&:hover': { color: '#002045', backgroundColor: '#eff6ff' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete}
            sx={{ color: '#64748b', '&:hover': { color: '#dc2626', backgroundColor: '#fef2f2' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// ── Clinic Dialog ──────────────────────────────────────────────────────────────

function ClinicDialog({ open, onClose, onSaved, initial, clinicId }: {
  open: boolean; onClose: () => void; onSaved: () => void;
  initial: ClinicForm; clinicId?: string;
}) {
  const toast = useToast();
  const [form, setForm] = useState<ClinicForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setForm(initial); setError(null); }, [initial, open]);

  const set = (k: keyof ClinicForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function toggleType(type: ConsultationType) {
    setForm(f => {
      const already = f.selectedTypes.includes(type);
      return { ...f, selectedTypes: already ? f.selectedTypes.filter(t => t !== type) : [...f.selectedTypes, type] };
    });
  }

  function setFee(type: ConsultationType, val: string) {
    setForm(f => ({ ...f, fees: { ...f.fees, [type]: val } }));
  }

  function validate(): string | null {
    if (!form.name.trim())    return 'Clinic name is required.';
    if (!form.address.trim()) return 'Street address is required.';
    if (!form.city.trim())    return 'City is required.';
    if (form.selectedTypes.length === 0) return 'Select at least one consultation type.';
    for (const t of form.selectedTypes) {
      const fee = parseFloat(form.fees[t]);
      if (isNaN(fee) || fee < 0) return `Enter a valid fee for ${TYPE_META[t].label}.`;
    }
    return null;
  }

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true); setError(null);
    try {
      const consultationTypes: ConsultationTypeEntry[] = form.selectedTypes.map(t => ({
        type: t,
        fee: parseFloat(form.fees[t]),
      }));
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        phone: form.phone.trim(),
        isPrimary: form.isPrimary,
        consultationTypes,
      };
      if (clinicId) await updateClinic(clinicId, payload);
      else await addClinic(payload);
      toast(`Clinic ${clinicId ? 'updated' : 'added'} successfully`, 'success');
      onSaved();
    } catch {
      const msg = `Failed to ${clinicId ? 'update' : 'add'} clinic.`;
      setError(msg); toast(msg, 'error');
    } finally { setSaving(false); }
  };

  const labelSx = { fontSize: '0.8125rem', fontWeight: 600, color: '#475569', mb: 1, display: 'block' };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#002045', pb: 1 }}>
        {clinicId ? 'Edit Clinic' : 'Add Clinic'}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          {/* Clinic name */}
          <Grid item xs={12}>
            <TextField fullWidth label="Clinic Name *" value={form.name} onChange={set('name')} />
          </Grid>

          {/* Address section */}
          <Grid item xs={12}>
            <Divider sx={{ mt: 0.5, mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Address
              </Typography>
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Street Address *" value={form.address} onChange={set('address')}
              placeholder="e.g. 123 MG Road, 2nd Floor"
              helperText="Building, street, area — be specific so patients can find you" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="City *" value={form.city} onChange={set('city')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="State" value={form.state} onChange={set('state')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Pincode" value={form.pincode} onChange={set('pincode')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone" value={form.phone} onChange={set('phone')} />
          </Grid>

          {/* Consultation types + fees */}
          <Grid item xs={12}>
            <Divider sx={{ mt: 0.5, mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Consultation Types &amp; Fees *
              </Typography>
            </Divider>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 2 }}>
              Select all types you offer and set a consultation fee for each.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(Object.keys(TYPE_META) as ConsultationType[]).map((type) => {
                const meta = TYPE_META[type];
                const selected = form.selectedTypes.includes(type);
                return (
                  <Box key={type} sx={{
                    borderRadius: 2, border: `1.5px solid ${selected ? meta.color : '#e2e8f0'}`,
                    backgroundColor: selected ? meta.bg : '#fafafa',
                    transition: 'all 0.15s',
                    overflow: 'hidden',
                  }}>
                    {/* Type toggle row */}
                    <Box
                      onClick={() => toggleType(type)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 2, py: 1.5, cursor: 'pointer',
                        '&:hover': { backgroundColor: selected ? meta.bg : '#f1f5f9' },
                      }}
                    >
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: selected ? meta.color : '#e2e8f0',
                        color: selected ? '#fff' : '#64748b', flexShrink: 0,
                        transition: 'all 0.15s',
                      }}>
                        {meta.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: selected ? meta.color : '#334155' }}>
                          {meta.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {type === 'IN_PERSON' && 'Patient visits your clinic in person'}
                          {type === 'AUDIO'     && 'Consultation over a phone/audio call'}
                          {type === 'VIDEO'     && 'Consultation via video conference'}
                        </Typography>
                      </Box>
                      <Checkbox checked={selected} onChange={() => toggleType(type)}
                        sx={{ color: meta.color, '&.Mui-checked': { color: meta.color }, p: 0, flexShrink: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>

                    {/* Fee input — only visible when selected */}
                    {selected && (
                      <Box sx={{ px: 2, pb: 2, pt: 0.5, borderTop: `1px solid ${meta.color}22` }}>
                        <TextField
                          fullWidth size="small"
                          label={`${meta.label} Fee (₹)`}
                          type="number"
                          value={form.fees[type]}
                          onChange={(e) => setFee(type, e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            },
                            htmlInput: { min: 0, step: 50 },
                          }}
                          placeholder="e.g. 500"
                        />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Primary */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.isPrimary} onChange={set('isPrimary')} color="primary" />}
              label={<Typography variant="body2">Set as primary clinic</Typography>}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' }, borderRadius: 2, px: 3 }}>
          {saving ? 'Saving…' : clinicId ? 'Save Changes' : 'Add Clinic'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DoctorClinicsPage() {
  const toast = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClinic, setEditClinic] = useState<Clinic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);

  const load = () => {
    setLoading(true);
    getClinics()
      .then(setClinics)
      .catch(() => toast('Failed to load clinics', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClinic(deleteTarget.id);
      toast('Clinic removed', 'success');
      load();
    } catch { toast('Failed to delete clinic', 'error'); }
    setDeleteTarget(null);
  };

  const openAdd = () => { setEditClinic(null); setDialogOpen(true); };
  const openEdit = (c: Clinic) => { setEditClinic(c); setDialogOpen(true); };
  const handleSaved = () => { setDialogOpen(false); load(); };

  // Populate form from existing clinic when editing
  const initialForm: ClinicForm = editClinic ? {
    name: editClinic.name,
    address: editClinic.address ?? '',
    city: editClinic.city ?? '',
    state: editClinic.state ?? '',
    pincode: editClinic.pincode ?? '',
    phone: editClinic.phone ?? '',
    isPrimary: editClinic.isPrimary,
    selectedTypes: (editClinic.consultationTypes ?? []).map(ct => ct.type as ConsultationType),
    fees: {
      IN_PERSON: String((editClinic.consultationTypes ?? []).find(ct => ct.type === 'IN_PERSON')?.fee ?? ''),
      AUDIO:     String((editClinic.consultationTypes ?? []).find(ct => ct.type === 'AUDIO')?.fee ?? ''),
      VIDEO:     String((editClinic.consultationTypes ?? []).find(ct => ct.type === 'VIDEO')?.fee ?? ''),
    },
  } : emptyForm();

  return (
    <DoctorPageLayout title="My Clinics" subtitle="Manage your clinic locations, addresses, and consultation types">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ backgroundColor: '#1a365d', '&:hover': { backgroundColor: '#002045' }, borderRadius: 2, px: 3, py: 1.25, fontWeight: 600 }}>
          Add Clinic
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : clinics.length === 0 ? (
        <Box sx={{ backgroundColor: '#fff', p: 6, borderRadius: 3, border: '1px solid #f1f5f9', textAlign: 'center' }}>
          <LocalHospitalIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography sx={{ color: '#64748b', mb: 2 }}>No clinics added yet.</Typography>
          <Button variant="outlined" onClick={openAdd} sx={{ borderColor: '#002045', color: '#002045', borderRadius: 2 }}>
            Add your first clinic
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {clinics.map(c => (
            <ClinicCard key={c.id} clinic={c} onEdit={() => openEdit(c)} onDelete={() => setDeleteTarget(c)} />
          ))}
        </Box>
      )}

      <ClinicDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        initial={initialForm}
        clinicId={editClinic?.id}
      />

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#002045' }}>Remove Clinic</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' }, borderRadius: 2 }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </DoctorPageLayout>
  );
}
