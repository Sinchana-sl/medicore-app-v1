import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import {
  getAdminUsers, toggleUserStatus, updateUserRole, deleteUser,
} from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'PATIENT_ROLE', label: 'Patients' },
  { value: 'DOCTOR_ROLE', label: 'Doctors' },
  { value: 'ADMIN_ROLE', label: 'Admins' },
];

const ROLE_COLORS: Record<string, string> = {
  PATIENT_ROLE: '#0ea5e9',
  DOCTOR_ROLE: '#10b981',
  ADMIN_ROLE: '#8b5cf6',
};

const ROLE_LABELS: Record<string, string> = {
  PATIENT_ROLE: 'Patient',
  DOCTOR_ROLE: 'Doctor',
  ADMIN_ROLE: 'Admin',
};

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? C.muted;
  return (
    <Chip
      label={ROLE_LABELS[role] ?? role}
      size="small"
      sx={{ backgroundColor: color + '18', color, fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px' }}
    />
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers(roleFilter, search);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleToggleStatus(user: AdminUser) {
    const updated = await toggleUserStatus(user.id);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  }

  async function handleRoleSave() {
    if (!editUser || !newRole) return;
    setSaving(true);
    try {
      const updated = await updateUserRole(editUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditUser(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="User Management" />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>Users</Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.875rem', mb: 3 }}>
            Manage accounts, roles, and access
          </Typography>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: C.muted }} /></InputAdornment>,
              }}
              sx={{ minWidth: 260, backgroundColor: C.paper, borderRadius: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 140, backgroundColor: C.paper }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)}>
                {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
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
                      {['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: C.muted, py: 1.25, borderBottom: `1px solid ${C.border}` }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: C.muted }}>
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : users.map(user => (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: C.surface } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.ink, fontWeight: 500, py: 1.25 }}>
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{user.email}</TableCell>
                        <TableCell sx={{ py: 1.25 }}><RoleBadge role={user.role} /></TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{user.phone || '—'}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              backgroundColor: user.isActive ? '#10b98118' : '#ef444418',
                              color: user.isActive ? '#10b981' : '#ef4444',
                              fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{user.createdAt}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Change role">
                              <IconButton size="small" sx={{ color: C.muted, '&:hover': { color: C.blue } }}
                                onClick={() => { setEditUser(user); setNewRole(user.role); }}>
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                              <IconButton size="small"
                                sx={{ color: C.muted, '&:hover': { color: user.isActive ? '#ef4444' : '#10b981' } }}
                                onClick={() => handleToggleStatus(user)}>
                                {user.isActive
                                  ? <BlockIcon sx={{ fontSize: 16 }} />
                                  : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete user">
                              <IconButton size="small" sx={{ color: C.muted, '&:hover': { color: '#ef4444' } }}
                                onClick={() => setDeleteTarget(user)}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
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

      {/* Edit role dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Change Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: C.slate, mb: 2 }}>
            {editUser?.email}
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>New Role</InputLabel>
            <Select value={newRole} label="New Role" onChange={e => setNewRole(e.target.value)}>
              <MenuItem value="PATIENT_ROLE">Patient</MenuItem>
              <MenuItem value="DOCTOR_ROLE">Doctor</MenuItem>
              <MenuItem value="ADMIN_ROLE">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditUser(null)} sx={{ color: C.muted }}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleSave} disabled={saving}
            sx={{ backgroundColor: C.blue, '&:hover': { backgroundColor: C.blue } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: C.slate }}>
            Are you sure you want to permanently delete <strong>{deleteTarget?.email}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: C.muted }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={saving}
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
