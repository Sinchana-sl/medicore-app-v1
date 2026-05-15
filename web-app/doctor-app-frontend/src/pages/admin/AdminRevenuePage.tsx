import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import AdminSideNavBar from '../../components/AdminSideNavBar';
import AdminTopNavBar from '../../components/AdminTopNavBar';
import { C } from '../../styles/theme';
import { getAdminPayments, getAdminStats } from '../../services/adminService';
import type { PaymentSummary, AdminStats } from '../../services/adminService';

const STATUS_COLORS: Record<string, string> = {
  captured: '#10b981',
  created:  '#f59e0b',
  failed:   '#ef4444',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? C.muted;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{ backgroundColor: color + '18', color, fontWeight: 600, fontSize: '0.6875rem', height: 20, borderRadius: '4px' }}
    />
  );
}

function SummaryCard({ label, value, prefix = '' }: { label: string; value: number; prefix?: string }) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 2, border: `1px solid ${C.border}`, backgroundColor: C.paper,
      display: 'flex', flexDirection: 'column', gap: 0.5,
    }}>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink }}>
        {prefix}{value.toLocaleString()}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: C.muted }}>{label}</Typography>
    </Paper>
  );
}

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminPayments(), getAdminStats()])
      .then(([p, s]) => { setPayments(p); setStats(s); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <AdminTopNavBar title="Revenue" />
      <Box sx={{ display: 'flex' }}>
        <AdminSideNavBar />
        <Box component="main" sx={{ ml: { xs: 0, md: '240px' }, flex: 1, mt: '52px', p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink, mb: 0.5 }}>Revenue</Typography>
          <Typography sx={{ color: C.muted, fontSize: '0.875rem', mb: 3 }}>
            Payment transactions and revenue overview
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress size={36} sx={{ color: C.blue }} />
            </Box>
          ) : (
            <>
              {/* Summary cards */}
              {stats && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
                  <SummaryCard label="Total Revenue (Rupees)" value={stats.totalRevenueRupees} prefix="₹" />
                  <SummaryCard label="Captured Payments" value={stats.capturedPayments} />
                  <SummaryCard label="Pending Payments" value={stats.pendingPayments} />
                </Box>
              )}

              {/* Payments table */}
              <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CurrencyRupeeIcon sx={{ fontSize: 18, color: C.muted }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: C.ink }}>
                    All Transactions
                  </Typography>
                  <Chip label={payments.length} size="small" sx={{ ml: 'auto', backgroundColor: C.surface, color: C.muted, fontWeight: 600, height: 20, fontSize: '0.6875rem' }} />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: C.surface }}>
                        {['Amount', 'Status', 'Razorpay Order ID', 'Payment ID', 'Date'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: C.muted, py: 1.25, borderBottom: `1px solid ${C.border}` }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: C.muted }}>
                            No payments yet
                          </TableCell>
                        </TableRow>
                      ) : payments.map(p => (
                        <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: C.surface } }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: C.ink, py: 1.25 }}>
                            ₹{p.amountRupees.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ py: 1.25 }}><StatusBadge status={p.status} /></TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: C.slate, py: 1.25, fontFamily: 'monospace' }}>
                            {p.razorpayOrderId}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: C.slate, py: 1.25, fontFamily: 'monospace' }}>
                            {p.razorpayPaymentId || '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: C.slate, py: 1.25 }}>{p.createdAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
