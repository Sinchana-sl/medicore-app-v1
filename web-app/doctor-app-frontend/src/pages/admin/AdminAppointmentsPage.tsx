import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import EditIcon from '@mui/icons-material/EditOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import { getAdminAppointments, updateAppointmentStatus } from '../../services/adminService';
import type { AdminAppointment } from '../../services/adminService';

const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: '#f59e0b18', text: '#f59e0b' },
  CONFIRMED: { bg: '#0ea5e918', text: '#0ea5e9' },
  COMPLETED: { bg: '#10b98118', text: '#10b981' },
  CANCELLED: { bg: '#ef444418', text: '#ef4444' },
};

const TYPE_LABELS: Record<string, string> = {
  IN_PERSON: 'In-Person',
  VIDEO:     'Video',
  CHAT:      'Chat',
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: C.surface, text: C.muted };
  return (
    <Chip label={status} size="small"
      sx={{ backgroundColor: c.bg, color: c.text, fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px' }}
    />
  );
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editTarget, setEditTarget] = useState<AdminAppointment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAppointments(await getAdminAppointments(statusFilter || undefined)); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusSave() {
    if (!editTarget || !newStatus) return;
    setSaving(true);
    try {
      const updated = await updateAppointmentStatus(editTarget.id, newStatus);
      setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditTarget(null);
    } finally { setSaving(false); }
  }

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    return !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientEmail.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      (a.clinicName ?? '').toLowerCase().includes(q);
  });

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="Appointments" />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>Appointments</Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.875rem', mb: 3 }}>
            All appointments across the platform
          </Typography>

          {/* Summary chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.filter(s => s).map(s => {
              const count = appointments.filter(a => a.status === s).length;
              const c = STATUS_COLORS[s];
              return (
                <Chip
                  key={s} label={`${s} · ${count}`} size="small"
                  onClick={() => setStatusFilter(prev => prev === s ? '' : s)}
                  sx={{
                    backgroundColor: statusFilter === s ? c.bg : C.paper,
                    color: statusFilter === s ? c.text : C.muted,
                    border: `1px solid ${statusFilter === s ? c.text + '40' : C.border}`,
                    fontWeight: 600, fontSize: '0.6875rem', cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by patient, doctor or clinic…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: C.muted }} /></InputAdornment>,
              }}
              sx={{ minWidth: 300, backgroundColor: C.paper, borderRadius: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 140, backgroundColor: C.paper }}>
              <Select
                value={statusFilter}
                displayEmpty
                onChange={e => setStatusFilter(e.target.value)}
                renderValue={v => v || 'All Statuses'}
              >
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={32} sx={{ color: C.blue }} />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: C.surface }}>
                      {['Patient', 'Doctor', 'Date & Time', 'Type', 'Status', 'Payment', 'Amount', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: C.muted, py: 1.25, borderBottom: `1px solid ${C.border}` }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: C.muted }}>
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(a => (
                      <TableRow key={a.id} sx={{ '&:hover': { backgroundColor: C.surface } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.ink }}>{a.patientName || '—'}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{a.patientEmail}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.ink }}>{a.doctorName}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{a.doctorSpecialty}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.ink }}>{a.appointmentDate}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{a.startTime}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>
                          {TYPE_LABELS[a.consultationType] ?? a.consultationType}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}><StatusBadge status={a.status} /></TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={a.paymentStatus}
                            size="small"
                            sx={{
                              backgroundColor: a.paymentStatus === 'PAID' ? '#10b98118' : '#f59e0b18',
                              color: a.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                              fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, py: 1.25 }}>
                          {a.amountRupees != null ? `₹${a.amountRupees}` : '—'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Tooltip title="Change status">
                            <IconButton size="small" sx={{ color: C.muted, '&:hover': { color: C.blue } }}
                              onClick={() => { setEditTarget(a); setNewStatus(a.status); }}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Edit status dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Status</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: C.slate, mb: 2 }}>
            {editTarget?.patientName} · {editTarget?.appointmentDate}
          </Typography>
          <FormControl fullWidth size="small">
            <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: C.muted }}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusSave} disabled={saving}
            sx={{ backgroundColor: C.blue, '&:hover': { backgroundColor: C.blue } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
