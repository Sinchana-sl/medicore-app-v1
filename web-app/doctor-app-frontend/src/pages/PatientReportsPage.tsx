import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, CircularProgress, Alert, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';
import ChatBot from '../components/ChatBot';
import { useToast } from '../contexts/ToastContext';
import {
  getMedicalRecords, createMedicalRecord, deleteMedicalRecord,
  type MedicalRecord,
} from '../services/medicalRecordService';
import { getPatientProfile, type PatientProfile } from '../services/patientService';
import { C } from '../styles/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORD_TYPES = [
  { value: 'LAB_RESULT',        label: 'Lab Result',        icon: <ScienceOutlinedIcon sx={{ fontSize: 22 }} />,      color: '#0D9488', bg: '#F0FDFA' },
  { value: 'PRESCRIPTION',      label: 'Prescription',      icon: <MedicationOutlinedIcon sx={{ fontSize: 22 }} />,   color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'DIAGNOSIS',         label: 'Diagnosis',         icon: <MonitorHeartOutlinedIcon sx={{ fontSize: 22 }} />, color: '#DC2626', bg: '#FEF2F2' },
  { value: 'IMAGING',           label: 'Imaging',           icon: <ImageOutlinedIcon sx={{ fontSize: 22 }} />,        color: '#2563EB', bg: '#EFF6FF' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary', icon: <DescriptionOutlinedIcon sx={{ fontSize: 22 }} />,  color: '#D97706', bg: '#FFFBEB' },
  { value: 'OTHER',             label: 'Other',             icon: <FolderOpenOutlinedIcon sx={{ fontSize: 22 }} />,   color: '#6B7280', bg: '#F9FAFB' },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  NORMAL:   { color: '#0F7348', bg: '#F0FDF4' },
  ABNORMAL: { color: '#C73535', bg: '#FEF2F2' },
  PENDING:  { color: '#B45309', bg: '#FFFBEB' },
  REVIEWED: { color: '#0D9488', bg: '#F0FDFA' },
};

function getType(recordType: string) {
  return RECORD_TYPES.find(r => r.value === recordType) ?? RECORD_TYPES[RECORD_TYPES.length - 1];
}

// ─── RecordCard ───────────────────────────────────────────────────────────────

function RecordCard({ record, onDelete }: { record: MedicalRecord; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();
  const type = getType(record.recordType);
  const statusStyle = STATUS_STYLE[(record.status ?? '').toUpperCase()] ?? { color: C.muted, bg: C.surface };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMedicalRecord(record.id);
      onDelete(record.id);
      toast('Record deleted', 'success');
    } catch {
      toast('Failed to delete record', 'error');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Box sx={{
        backgroundColor: C.paper,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${type.color}`,
        borderRadius: '8px',
        p: 2.5,
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
      }}>
        {/* Type icon */}
        <Box sx={{
          width: 44, height: 44, borderRadius: '10px', flexShrink: 0,
          backgroundColor: type.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: type.color,
        }}>
          {type.icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>
              {record.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {record.status && (
                <Chip
                  label={record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase()}
                  size="small"
                  sx={{ fontSize: '0.625rem', fontWeight: 700, height: 20, backgroundColor: statusStyle.bg, color: statusStyle.color }}
                />
              )}
              {record.fileUrl && (
                <IconButton
                  size="small"
                  href={record.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  component="a"
                  sx={{ color: C.blue, width: 28, height: 28 }}
                >
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => setConfirmOpen(true)}
                sx={{ color: '#cbd5e1', width: 28, height: 28, '&:hover': { color: '#dc2626', backgroundColor: C.redBg } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {record.subtitle && (
            <Typography sx={{ fontSize: '0.8125rem', color: C.slate, mb: 0.75, lineHeight: 1.5 }}>
              {record.subtitle}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={type.label}
              size="small"
              sx={{ fontSize: '0.625rem', fontWeight: 600, height: 20, backgroundColor: type.bg, color: type.color }}
            />
            {record.recordedAt && (
              <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>
                {record.recordedAt}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Delete confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: C.ink, fontSize: '1rem', pb: 1 }}>
          Delete Record?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: C.slate }}>
            "{record.title}" will be permanently removed. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: C.slate, fontWeight: 600 }}>Cancel</Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            sx={{ backgroundColor: '#dc2626', borderRadius: '6px', fontWeight: 600, '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            {deleting ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientReportsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', subtitle: '', recordType: 'LAB_RESULT', fileUrl: '', recordedAt: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, r] = await Promise.all([getPatientProfile(), getMedicalRecords()]);
        setProfile(p);
        setRecords(r);
      } catch {
        setApiError('Failed to load medical records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = profile
    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || (profile.email ?? '')
    : '';

  // Filter
  const filtered = records.filter(r => {
    const matchType = !activeType || r.recordType === activeType;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.title.toLowerCase().includes(q)
      || (r.subtitle ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // Type counts
  const counts = RECORD_TYPES.reduce<Record<string, number>>((acc, rt) => {
    acc[rt.value] = records.filter(r => r.recordType === rt.value).length;
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const created = await createMedicalRecord({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        recordType: form.recordType,
        fileUrl: form.fileUrl.trim() || undefined,
        recordedAt: form.recordedAt || undefined,
      });
      setRecords(prev => [created, ...prev]);
      setAddOpen(false);
      setForm({ title: '', subtitle: '', recordType: 'LAB_RESULT', fileUrl: '', recordedAt: '' });
      toast('Record added successfully', 'success');
    } catch {
      toast('Failed to add record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Box sx={{ backgroundColor: C.paper, minHeight: '100vh' }}>
      <TopNavBar
        displayName={displayName}
        email={profile?.email}
        onProfileClick={() => navigate('/settings')}
      />

      <Box sx={{ display: 'flex' }}>
        <SideNavBar onChatClick={() => setChatOpen(o => !o)} chatActive={chatOpen} />

        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

            {/* ── Header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.ink, fontFamily: 'inherit', letterSpacing: '-0.02em' }}>
                  Medical Records
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: C.muted, mt: 0.25 }}>
                  {records.length} record{records.length !== 1 ? 's' : ''} in your health history
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
                sx={{
                  borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem',
                  background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                  boxShadow: `0 2px 8px ${C.blue}35`,
                  '&:hover': { background: `linear-gradient(135deg, ${C.blueDark}, #0B5E57)` },
                }}
              >
                Add Record
              </Button>
            </Box>

            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setApiError('')}>
                {apiError}
              </Alert>
            )}

            {/* ── Type filter chips ── */}
            <Box sx={{
              backgroundColor: C.paper, border: `1px solid ${C.border}`,
              borderRadius: '8px', p: 2, mb: 3,
              display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <Chip
                label={`All (${records.length})`}
                clickable
                onClick={() => setActiveType(null)}
                sx={{
                  fontWeight: 700, fontSize: '0.8rem',
                  backgroundColor: !activeType ? C.blue : C.surface,
                  color: !activeType ? '#fff' : C.slate,
                  '&:hover': { backgroundColor: !activeType ? C.blueDark : C.borderSub },
                }}
              />
              {RECORD_TYPES.map(rt => (
                <Chip
                  key={rt.value}
                  label={`${rt.label} (${counts[rt.value] ?? 0})`}
                  clickable
                  onClick={() => setActiveType(activeType === rt.value ? null : rt.value)}
                  sx={{
                    fontWeight: 600, fontSize: '0.8rem',
                    backgroundColor: activeType === rt.value ? rt.bg : C.surface,
                    color: activeType === rt.value ? rt.color : C.slate,
                    border: `1px solid ${activeType === rt.value ? rt.color + '50' : C.border}`,
                    '&:hover': { backgroundColor: rt.bg, color: rt.color },
                  }}
                />
              ))}
            </Box>

            {/* ── Search ── */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title or notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: C.muted }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} sx={{ color: C.muted }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: C.paper } }}
            />

            {/* ── Records list ── */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: C.blue }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{
                backgroundColor: C.paper, border: `1px solid ${C.border}`,
                borderRadius: '8px', py: 8, textAlign: 'center',
              }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <FolderOpenOutlinedIcon sx={{ fontSize: 32, color: C.muted }} />
                </Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: C.ink, mb: 0.5 }}>
                  {activeType || search ? 'No matching records' : 'No medical records yet'}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: C.muted, mb: 2 }}>
                  {activeType || search
                    ? 'Try clearing the filter or search term.'
                    : 'Start building your health history by adding your first record.'}
                </Typography>
                {!activeType && !search && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddOpen(true)}
                    sx={{
                      borderRadius: '8px', fontWeight: 700,
                      background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                      '&:hover': { background: `linear-gradient(135deg, ${C.blueDark}, #0B5E57)` },
                    }}
                  >
                    Add Your First Record
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filtered.map(r => (
                    <RecordCard key={r.id} record={r} onDelete={handleDelete} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', color: C.muted, textAlign: 'center', mt: 2 }}>
                  Showing {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Add Record Dialog ── */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: C.ink }}>Add Medical Record</Typography>
          <IconButton onClick={() => !saving && setAddOpen(false)} size="small" sx={{ color: C.muted }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Title *</Typography>
            <TextField
              fullWidth size="small" placeholder="e.g. Blood Test Results"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Record Type</Typography>
            <TextField
              fullWidth select size="small"
              value={form.recordType}
              onChange={e => setForm(f => ({ ...f, recordType: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              {RECORD_TYPES.map(r => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Notes / Description</Typography>
            <TextField
              fullWidth size="small" multiline rows={3}
              placeholder="Doctor's notes, test details, medication instructions…"
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>Date</Typography>
              <TextField
                fullWidth size="small" type="date"
                value={form.recordedAt}
                onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.inkMid, mb: 0.75 }}>File URL <Typography component="span" sx={{ fontSize: '0.75rem', color: C.muted }}>(optional)</Typography></Typography>
              <TextField
                fullWidth size="small" placeholder="https://…"
                value={form.fileUrl}
                onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving} sx={{ color: C.slate, fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={saving || !form.title.trim()}
            variant="contained"
            sx={{
              borderRadius: '8px', fontWeight: 700, minWidth: 120,
              background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
              '&:hover': { background: `linear-gradient(135deg, ${C.blueDark}, #0B5E57)` },
            }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>

      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} onAppointmentBooked={() => {}} />
    </Box>
  );
}
