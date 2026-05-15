import { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, CircularProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Button, Skeleton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleOutlineRounded';
import PersonIcon from '@mui/icons-material/PersonOutlineRounded';
import LocalHospitalIcon from '@mui/icons-material/LocalHospitalOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingIcon from '@mui/icons-material/PendingOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats, getAdminUsers, getAdminDoctors,
  getAdminClinics, getAdminPayments,
} from '../../services/adminService';
import type { AdminStats, AdminUser, AdminDoctor, AdminClinic, PaymentSummary } from '../../services/adminService';

/* ── helpers ──────────────────────────────────────────────────────────────── */

const ROLE_COLOR: Record<string, string> = {
  PATIENT_ROLE: '#0ea5e9',
  DOCTOR_ROLE: '#10b981',
  ADMIN_ROLE: '#8b5cf6',
};
const ROLE_LABEL: Record<string, string> = {
  PATIENT_ROLE: 'Patient',
  DOCTOR_ROLE: 'Doctor',
  ADMIN_ROLE: 'Admin',
};

function initials(f: string, l: string, email: string) {
  if (f || l) return ((f[0] ?? '') + (l[0] ?? '')).toUpperCase();
  return (email[0] ?? '?').toUpperCase();
}

/* ── sub-components ───────────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color, prefix = '', loading }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; prefix?: string; loading?: boolean;
}) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 2, border: `1px solid ${C.border}`,
      backgroundColor: C.paper, display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Box sx={{
        width: 42, height: 42, borderRadius: 1.5, flexShrink: 0,
        backgroundColor: color + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        {loading
          ? <Skeleton width={60} height={28} />
          : <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.ink, lineHeight: 1, letterSpacing: '-0.025em' }}>
              {prefix}{value.toLocaleString()}
            </Typography>
        }
        <Typography sx={{ fontSize: '0.8125rem', color: C.muted, mt: 0.375 }}>{label}</Typography>
      </Box>
    </Paper>
  );
}

function SectionCard({ title, count, path, children, footer }: {
  title: string; count: number; path: string;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 2, overflow: 'hidden', backgroundColor: C.paper, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{title}</Typography>
          <Chip label={count} size="small" sx={{ backgroundColor: C.surface, color: C.muted, fontWeight: 600, height: 18, fontSize: '0.625rem' }} />
        </Box>
        <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />} onClick={() => navigate(path)}
          sx={{ fontSize: '0.75rem', color: C.blue, fontWeight: 600, minWidth: 0, px: 0.75, py: 0.5 }}>
          View all
        </Button>
      </Box>
      <Divider />
      <Box sx={{ flex: 1 }}>{children}</Box>
      {footer && <Box sx={{ borderTop: `1px solid ${C.border}` }}>{footer}</Box>}
    </Paper>
  );
}

function TableSkeleton({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j} sx={{ py: 1.25 }}><Skeleton height={16} /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={cols} sx={{ textAlign: 'center', py: 5, color: C.muted, fontSize: '0.875rem' }}>
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

/* ── main ─────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const adminEmail = localStorage.getItem('token')
    ? (() => { try { return JSON.parse(atob(localStorage.getItem('token')!.split('.')[1])).sub; } catch { return ''; } })()
    : '';

  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [doctors, setDoctors]   = useState<AdminDoctor[]>([]);
  const [clinics, setClinics]   = useState<AdminClinic[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);

  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingUsers, setLoadingUsers]     = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingPay, setLoadingPay]         = useState(true);

  useEffect(() => {
    // Each section loads independently — one failure won't blank the rest
    getAdminStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    getAdminUsers().then(setUsers).catch(console.error).finally(() => setLoadingUsers(false));
    getAdminDoctors().then(setDoctors).catch(console.error).finally(() => setLoadingDoctors(false));
    getAdminClinics().then(setClinics).catch(console.error).finally(() => setLoadingClinics(false));
    getAdminPayments().then(setPayments).catch(console.error).finally(() => setLoadingPay(false));
  }, []);

  const previewUsers    = users.slice(0, 6);
  const previewDoctors  = doctors.slice(0, 5);
  const previewClinics  = clinics.slice(0, 5);
  const previewPayments = payments.slice(0, 5);

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="Dashboard" displayName="Admin" email={adminEmail} />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 3.5 } }}>

          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: C.ink, letterSpacing: '-0.02em', mb: 0.25 }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.8125rem', mb: 3 }}>
            Complete platform overview — users, doctors, clinics and revenue
          </Typography>

          {/* ── stat row ──────────────────────────────────────────────── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' },
            gap: 2, mb: 3,
          }}>
            <StatCard loading={loadingStats} label="Total Users"    value={stats?.totalUsers ?? 0}       icon={<PeopleIcon sx={{ fontSize: 19 }} />}       color="#6366f1" />
            <StatCard loading={loadingStats} label="Patients"        value={stats?.totalPatients ?? 0}     icon={<PersonIcon sx={{ fontSize: 19 }} />}        color="#0ea5e9" />
            <StatCard loading={loadingStats} label="Doctors"         value={stats?.totalDoctors ?? 0}      icon={<LocalHospitalIcon sx={{ fontSize: 19 }} />} color="#10b981" />
            <StatCard loading={loadingClinics} label="Clinics"       value={clinics.length}                icon={<MapsHomeWorkIcon sx={{ fontSize: 19 }} />}  color="#f59e0b" />
            <StatCard loading={loadingStats} label="Appointments"    value={stats?.totalAppointments ?? 0} icon={<CalendarIcon sx={{ fontSize: 19 }} />}      color="#f97316" />
            <StatCard loading={loadingStats} label="Revenue"         value={stats?.totalRevenueRupees ?? 0} icon={<CurrencyRupeeIcon sx={{ fontSize: 19 }} />} color="#8b5cf6" prefix="₹" />
          </Box>

          {/* ── appointment mini-stats ─────────────────────────────────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            {[
              { label: 'Pending / Confirmed', value: stats?.pendingAppointments ?? 0, color: '#f59e0b', icon: <PendingIcon sx={{ fontSize: 16 }} /> },
              { label: 'Completed',           value: stats?.completedAppointments ?? 0, color: '#10b981', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
              { label: 'Captured Payments',   value: stats?.capturedPayments ?? 0,      color: '#8b5cf6', icon: <CurrencyRupeeIcon sx={{ fontSize: 16 }} /> },
            ].map(({ label, value, color, icon }) => (
              <Paper key={label} elevation={0} sx={{
                px: 2, py: 1.5, borderRadius: 2, border: `1px solid ${C.border}`,
                backgroundColor: C.paper, display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, backgroundColor: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Box sx={{ color }}>{icon}</Box>
                </Box>
                <Box>
                  {loadingStats
                    ? <Skeleton width={40} height={20} />
                    : <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.ink, lineHeight: 1 }}>{value}</Typography>
                  }
                  <Typography sx={{ fontSize: '0.6875rem', color: C.muted, mt: 0.25 }}>{label}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── users + doctors ────────────────────────────────────────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>

            {/* Users table */}
            <SectionCard title="Users" count={users.length} path="/admin/users"
              footer={users.length > 6
                ? <Box sx={{ px: 2.5, py: 1.25 }}><Typography sx={{ fontSize: '0.75rem', color: C.muted }}>+{users.length - 6} more users</Typography></Box>
                : undefined
              }>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['User', 'Role', 'Status', 'Joined'].map(h => (
                        <TableCell key={h} sx={{ py: 1, fontSize: '0.6875rem', fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  {loadingUsers
                    ? <TableSkeleton cols={4} />
                    : previewUsers.length === 0
                      ? <EmptyRow cols={4} message="No users yet" />
                      : <TableBody>
                          {previewUsers.map(u => (
                            <TableRow key={u.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: C.surface } }}>
                              <TableCell sx={{ py: 1.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                  <Avatar sx={{
                                    width: 30, height: 30, fontSize: '0.6875rem', fontWeight: 700,
                                    backgroundColor: (ROLE_COLOR[u.role] ?? C.muted) + '25',
                                    color: ROLE_COLOR[u.role] ?? C.muted,
                                  }}>
                                    {initials(u.firstName ?? '', u.lastName ?? '', u.email)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.6875rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {u.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.25 }}>
                                <Chip label={ROLE_LABEL[u.role] ?? u.role} size="small"
                                  sx={{ backgroundColor: (ROLE_COLOR[u.role] ?? C.muted) + '18', color: ROLE_COLOR[u.role] ?? C.muted, fontWeight: 600, fontSize: '0.625rem', height: 19, borderRadius: '4px' }} />
                              </TableCell>
                              <TableCell sx={{ py: 1.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: u.isActive ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: '0.6875rem', color: u.isActive ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                    {u.isActive ? 'Active' : 'Inactive'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.25, fontSize: '0.75rem', color: C.muted }}>{u.createdAt}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                  }
                </Table>
              </TableContainer>
            </SectionCard>

            {/* Doctors table */}
            <SectionCard title="Doctors" count={doctors.length} path="/admin/doctors"
              footer={doctors.length > 5
                ? <Box sx={{ px: 2.5, py: 1.25 }}><Typography sx={{ fontSize: '0.75rem', color: C.muted }}>+{doctors.length - 5} more doctors</Typography></Box>
                : undefined
              }>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Doctor', 'Specialty', 'Clinics', 'Availability'].map(h => (
                        <TableCell key={h} sx={{ py: 1, fontSize: '0.6875rem', fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  {loadingDoctors
                    ? <TableSkeleton cols={4} />
                    : previewDoctors.length === 0
                      ? <EmptyRow cols={4} message="No doctors yet" />
                      : <TableBody>
                          {previewDoctors.map(d => (
                            <TableRow key={d.profileId} sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: C.surface } }}>
                              <TableCell sx={{ py: 1.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#10b98120', color: '#10b981' }}>
                                    {initials(d.firstName ?? '', d.lastName ?? '', d.email)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>
                                      Dr. {[d.firstName, d.lastName].filter(Boolean).join(' ') || '—'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.6875rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {d.consultationFee != null ? `₹${d.consultationFee} / visit` : d.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.25, fontSize: '0.8125rem', color: C.slate }}>{d.specialization || '—'}</TableCell>
                              <TableCell sx={{ py: 1.25 }}>
                                <Chip label={d.clinicCount} size="small"
                                  sx={{ backgroundColor: C.surface, color: C.slate, fontWeight: 600, height: 19, fontSize: '0.625rem' }} />
                              </TableCell>
                              <TableCell sx={{ py: 1.25 }}>
                                <Chip
                                  label={d.isAvailable ? 'Available' : 'Unavailable'} size="small"
                                  sx={{
                                    backgroundColor: d.isAvailable ? '#10b98118' : '#f59e0b18',
                                    color: d.isAvailable ? '#10b981' : '#f59e0b',
                                    fontWeight: 600, fontSize: '0.625rem', height: 19, borderRadius: '4px',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                  }
                </Table>
              </TableContainer>
            </SectionCard>
          </Box>

          {/* ── clinics + revenue ──────────────────────────────────────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>

            {/* Clinics list */}
            <SectionCard title="Clinics" count={clinics.length} path="/admin/clinics"
              footer={clinics.length > 5
                ? <Box sx={{ px: 2.5, py: 1.25 }}><Typography sx={{ fontSize: '0.75rem', color: C.muted }}>+{clinics.length - 5} more clinics</Typography></Box>
                : undefined
              }>
              {loadingClinics
                ? <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1,2,3].map(i => <Skeleton key={i} height={48} borderRadius={8} />)}
                  </Box>
                : previewClinics.length === 0
                  ? <Box sx={{ textAlign: 'center', py: 5 }}><Typography sx={{ color: C.muted, fontSize: '0.875rem' }}>No clinics yet</Typography></Box>
                  : previewClinics.map((c, i) => (
                      <Box key={c.id} sx={{
                        px: 2.5, py: 1.75,
                        borderBottom: i < previewClinics.length - 1 ? `1px solid ${C.border}` : 'none',
                        display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
                          backgroundColor: '#f59e0b15',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <MapsHomeWorkIcon sx={{ fontSize: 17, color: '#f59e0b' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.name}
                            </Typography>
                            {c.isPrimary && (
                              <Chip label="Primary" size="small"
                                sx={{ backgroundColor: '#0ea5e918', color: '#0ea5e9', fontWeight: 600, fontSize: '0.5625rem', height: 16, borderRadius: '3px', flexShrink: 0 }} />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <LocationOnIcon sx={{ fontSize: 11, color: C.muted, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.75rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {[c.city, c.state].filter(Boolean).join(', ') || c.address || '—'}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.6875rem', color: C.muted, mt: 0.125 }}>
                            Dr. {c.doctorName || '—'} · {c.specialization || 'General'}
                          </Typography>
                        </Box>
                      </Box>
                    ))
              }
            </SectionCard>

            {/* Revenue / payments */}
            <SectionCard title="Revenue" count={payments.length} path="/admin/revenue"
              footer={payments.length > 5
                ? <Box sx={{ px: 2.5, py: 1.25 }}><Typography sx={{ fontSize: '0.75rem', color: C.muted }}>+{payments.length - 5} more transactions</Typography></Box>
                : undefined
              }>
              {/* Summary tiles */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 2 }}>
                {[
                  { label: 'Collected', value: `₹${(stats?.totalRevenueRupees ?? 0).toLocaleString()}`, color: '#8b5cf6' },
                  { label: 'Captured',  value: String(stats?.capturedPayments ?? 0), color: '#10b981' },
                  { label: 'Pending',   value: String(stats?.pendingPayments ?? 0),  color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <Box key={label} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: color + '10', border: `1px solid ${color}20`, textAlign: 'center' }}>
                    {loadingStats
                      ? <Skeleton width="60%" height={22} sx={{ mx: 'auto' }} />
                      : <Typography sx={{ fontSize: '1rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</Typography>
                    }
                    <Typography sx={{ fontSize: '0.625rem', color: C.muted, fontWeight: 500, mt: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Amount', 'Status', 'Order ID', 'Date'].map(h => (
                        <TableCell key={h} sx={{ py: 1, fontSize: '0.6875rem', fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  {loadingPay
                    ? <TableSkeleton cols={4} rows={3} />
                    : previewPayments.length === 0
                      ? <EmptyRow cols={4} message="No payments yet" />
                      : <TableBody>
                          {previewPayments.map(p => {
                            const ok = p.status === 'captured';
                            return (
                              <TableRow key={p.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: C.surface } }}>
                                <TableCell sx={{ py: 1.25 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 24, height: 24, borderRadius: 0.75, flexShrink: 0, backgroundColor: ok ? '#10b98118' : '#f59e0b18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {ok
                                        ? <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981' }} />
                                        : <PendingIcon sx={{ fontSize: 13, color: '#f59e0b' }} />}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink }}>₹{p.amountRupees.toLocaleString()}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.25 }}>
                                  <Chip label={p.status} size="small"
                                    sx={{ backgroundColor: ok ? '#10b98118' : '#f59e0b18', color: ok ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.625rem', height: 19, borderRadius: '4px' }} />
                                </TableCell>
                                <TableCell sx={{ py: 1.25, fontSize: '0.6875rem', color: C.muted, fontFamily: 'monospace', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.razorpayOrderId}
                                </TableCell>
                                <TableCell sx={{ py: 1.25, fontSize: '0.75rem', color: C.muted }}>{p.createdAt}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                  }
                </Table>
              </TableContainer>
            </SectionCard>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
