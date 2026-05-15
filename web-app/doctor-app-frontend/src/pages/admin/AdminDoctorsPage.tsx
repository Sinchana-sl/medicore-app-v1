import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ToggleOnIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffIcon from '@mui/icons-material/ToggleOffOutlined';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import { getAdminDoctors, toggleDoctorAvailability } from '../../services/adminService';
import type { AdminDoctor } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try { setDoctors(await getAdminDoctors()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(doctor: AdminDoctor) {
    const updated = await toggleDoctorAvailability(doctor.profileId);
    setDoctors(prev => prev.map(d => d.profileId === updated.profileId ? updated : d));
  }

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    return !q ||
      d.email.toLowerCase().includes(q) ||
      (d.firstName + ' ' + d.lastName).toLowerCase().includes(q) ||
      (d.specialization ?? '').toLowerCase().includes(q);
  });

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="Doctors" />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>Doctors</Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.875rem', mb: 3 }}>
            Manage doctor profiles and availability
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search by name, email or specialty…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: C.muted }} /></InputAdornment>,
              }}
              sx={{ minWidth: 300, backgroundColor: C.paper, borderRadius: 1 }}
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
                      {['Doctor', 'Specialty', 'Experience', 'Fee', 'Clinics', 'Status', 'Account', 'Actions'].map(h => (
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
                          No doctors found
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(d => (
                      <TableRow key={d.profileId} sx={{ '&:hover': { backgroundColor: C.surface } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink }}>
                            {[d.firstName, d.lastName].filter(Boolean).join(' ') || '—'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{d.email}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>
                          {d.specialization || '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>
                          {d.yearsExperience != null ? `${d.yearsExperience} yrs` : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>
                          {d.consultationFee != null ? `₹${d.consultationFee}` : '—'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={d.clinicCount}
                            size="small"
                            sx={{ backgroundColor: C.surface, color: C.slate, fontWeight: 600, height: 20, fontSize: '0.6875rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={d.isAvailable ? 'Available' : 'Unavailable'}
                            size="small"
                            sx={{
                              backgroundColor: d.isAvailable ? '#10b98118' : '#f59e0b18',
                              color: d.isAvailable ? '#10b981' : '#f59e0b',
                              fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={d.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              backgroundColor: d.isActive ? '#10b98118' : '#ef444418',
                              color: d.isActive ? '#10b981' : '#ef4444',
                              fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={d.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                              <IconButton size="small"
                                sx={{ color: d.isAvailable ? '#10b981' : C.muted, '&:hover': { color: C.blue } }}
                                onClick={() => handleToggle(d)}>
                                {d.isAvailable
                                  ? <ToggleOnIcon sx={{ fontSize: 20 }} />
                                  : <ToggleOffIcon sx={{ fontSize: 20 }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View clinics">
                              <IconButton size="small"
                                sx={{ color: C.muted, '&:hover': { color: C.blue } }}
                                onClick={() => navigate(`/admin/clinics?doctor=${d.profileId}`)}>
                                <MapsHomeWorkIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
    </Box>
  );
}
