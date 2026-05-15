import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import { getAdminClinics, deleteClinic } from '../../services/adminService';
import type { AdminClinic } from '../../services/adminService';
import { useSearchParams } from 'react-router-dom';

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminClinic | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    try { setClinics(await getAdminClinics()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pre-filter by doctor if navigated from doctors page
  useEffect(() => {
    const doctorFilter = searchParams.get('doctor');
    if (doctorFilter) setSearch(doctorFilter);
  }, [searchParams]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClinic(deleteTarget.id);
      setClinics(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  }

  const filtered = clinics.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.name.toLowerCase().includes(q) ||
      c.doctorName.toLowerCase().includes(q) ||
      c.doctorEmail.toLowerCase().includes(q) ||
      (c.city ?? '').toLowerCase().includes(q) ||
      (c.specialization ?? '').toLowerCase().includes(q) ||
      c.doctorId.includes(q);
  });

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="Clinics" />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>Clinics</Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.875rem', mb: 3 }}>
            All clinic locations registered by doctors
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search by clinic name, doctor, city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: C.muted }} /></InputAdornment>,
              }}
              sx={{ minWidth: 320, backgroundColor: C.paper, borderRadius: 1 }}
            />
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
                      {['Clinic', 'Location', 'Doctor', 'Specialty', 'Phone', 'Type', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: C.muted, py: 1.25, borderBottom: `1px solid ${C.border}` }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: C.muted }}>
                          No clinics found
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(c => (
                      <TableRow key={c.id} sx={{ '&:hover': { backgroundColor: C.surface } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink }}>{c.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 14, color: C.muted, mt: 0.25, flexShrink: 0 }} />
                            <Box>
                              <Typography sx={{ fontSize: '0.8125rem', color: C.slate }}>
                                {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                              </Typography>
                              {c.address && (
                                <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{c.address}</Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.ink, fontWeight: 500 }}>{c.doctorName || '—'}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{c.doctorEmail}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{c.specialization || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{c.phone || '—'}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          {c.isPrimary && (
                            <Chip label="Primary" size="small"
                              sx={{ backgroundColor: '#0ea5e918', color: '#0ea5e9', fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px' }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Tooltip title="Delete clinic">
                            <IconButton size="small" sx={{ color: C.muted, '&:hover': { color: '#ef4444' } }}
                              onClick={() => setDeleteTarget(c)}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Clinic</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: C.slate }}>
            Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: C.muted }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
