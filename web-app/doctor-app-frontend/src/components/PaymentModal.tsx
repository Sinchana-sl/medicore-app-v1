import { C } from '../styles/theme';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, Button, CircularProgress, Chip, Divider, LinearProgress,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { createPaymentOrder, verifyPayment, simulatePayment } from '../services/paymentService';

const PAYMENT_TIMEOUT_SEC = 600; // 10 minutes

interface Props {
  open: boolean;
  appointmentId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  amountPaise: number;
  patientPhone?: string;
  onSuccess: () => void;
  onClose: () => void;
}

type Stage = 'idle' | 'loading' | 'checkout' | 'verifying' | 'success' | 'error' | 'expired';

declare global {
  interface Window {
    Razorpay: new (options: object) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PaymentModal({
  open, appointmentId, doctorName, specialty, date, time, amountPaise,
  patientPhone, onSuccess, onClose,
}: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SEC);
  const rzpRef = useRef<ReturnType<typeof window.Razorpay> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setSecondsLeft(PAYMENT_TIMEOUT_SEC);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stopTimer();
          setStage('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (open) {
      startTimer();
    } else {
      stopTimer();
      setStage('idle');
      setError('');
      setSecondsLeft(PAYMENT_TIMEOUT_SEC);
    }
    return stopTimer;
  }, [open, startTimer, stopTimer]);

  async function handlePay() {
    if (stage === 'expired') return;
    setStage('loading');
    setError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment script. Please check your connection.');

      const order = await createPaymentOrder(appointmentId);
      setStage('checkout');

      const isTestKey = order.keyId.startsWith('rzp_test_');

      const options = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: 'MediCore',
        description: `Consultation with ${doctorName}`,
        order_id: order.orderId,
        prefill: {
          name: order.patientName,
          email: order.patientEmail,
          contact: isTestKey ? '+919999999999' : (patientPhone ?? ''),
        },
        theme: { color: '#0D9488' },
        modal: {
          ondismiss: () => {
            if (stage !== 'success' && stage !== 'expired') setStage('idle');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          stopTimer();
          setStage('verifying');
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setStage('success');
            setTimeout(() => { onSuccess(); }, 2000);
          } catch {
            setStage('error');
            setError('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        },
      };

      rzpRef.current = new window.Razorpay(options);
      rzpRef.current.open();
    } catch (e: unknown) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    }
  }

  async function handleSimulate() {
    setStage('verifying');
    setError('');
    stopTimer();
    try {
      await simulatePayment(appointmentId);
      setStage('success');
      setTimeout(() => { onSuccess(); }, 1500);
    } catch (e: unknown) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Simulation failed. Please try again.');
    }
  }

  const amount = (amountPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const timerPct = (secondsLeft / PAYMENT_TIMEOUT_SEC) * 100;
  const timerColor = secondsLeft > 120 ? '#22c55e' : secondsLeft > 60 ? '#f59e0b' : '#ef4444';
  const isBlocked = stage === 'loading' || stage === 'verifying';

  return (
    <Dialog
      open={open}
      onClose={isBlocked ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ backgroundColor: '#0D9488', p: 2.5, color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'inherit' }}>
                Complete Payment
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', opacity: 0.85 }}>Secure payment via Razorpay</Typography>
            </Box>
          </Box>

          {/* Countdown timer */}
          {stage !== 'success' && stage !== 'expired' && (
            <Box sx={{ textAlign: 'right', minWidth: 72 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: secondsLeft <= 60 ? '#fca5a5' : 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{
                  fontSize: '1rem', fontWeight: 800, fontFamily: 'inherit',
                  color: secondsLeft <= 60 ? '#fca5a5' : '#fff',
                  letterSpacing: '0.05em',
                }}>
                  {fmtTime(secondsLeft)}
                </Typography>
              </Box>
              <Box sx={{ width: 72, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${timerPct}%`, backgroundColor: timerColor, borderRadius: 99, transition: 'width 1s linear, background-color 0.5s' }} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Timer warning strip */}
      {secondsLeft <= 120 && stage !== 'success' && stage !== 'expired' && (
        <Box sx={{ backgroundColor: secondsLeft <= 60 ? C.redBg : C.amberBg, px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: secondsLeft <= 60 ? '#dc2626' : '#b45309' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: secondsLeft <= 60 ? '#dc2626' : '#b45309' }}>
            {secondsLeft <= 60
              ? `Hurry! Session expires in ${secondsLeft} seconds`
              : `Session expires in ${fmtTime(secondsLeft)} — complete payment soon`}
          </Typography>
        </Box>
      )}

      <DialogContent sx={{ p: 3 }}>
        {/* Appointment summary */}
        <Box sx={{ backgroundColor: C.surface, borderRadius: 2, p: 2, mb: 2, border: `1px solid ${C.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{doctorName}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 600, mt: 0.25 }}>{specialty}</Typography>
          <Divider sx={{ my: 1.25 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', color: C.slate }}>{date} · {time}</Typography>
            <Chip
              label={stage === 'success' ? 'Confirmed' : 'Awaiting Payment'}
              size="small"
              sx={{
                backgroundColor: stage === 'success' ? C.greenBg : C.amberBg,
                color: stage === 'success' ? '#15803d' : '#b45309',
                fontWeight: 700, fontSize: '0.65rem', height: 20,
              }}
            />
          </Box>
        </Box>

        {/* Test mode hint */}
        {stage !== 'success' && stage !== 'expired' && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, mb: 2, backgroundColor: '#fefce8', borderRadius: 1.5, border: '1px solid #fde68a' }}>
            <Typography sx={{ fontSize: '0.9rem' }}>🧪</Typography>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>Test Mode</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#78350f', lineHeight: 1.6 }}>
                Click <b>"Simulate Payment"</b> below to instantly confirm without Razorpay UI.<br />
                Or use Razorpay: Card <b>4111 1111 1111 1111</b> · CVV <b>123</b> · OTP <b>123456</b>
              </Typography>
            </Box>
          </Box>
        )}


        {/* Amount */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: C.slate, fontWeight: 600 }}>Consultation Fee</Typography>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488', fontFamily: 'inherit' }}>
            {amount}
          </Typography>
        </Box>

        {/* Stage feedback */}
        {stage === 'verifying' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, backgroundColor: '#F0FDFA', borderRadius: 2 }}>
            <CircularProgress size={18} sx={{ color: '#0D9488' }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#0D9488', fontWeight: 600 }}>
              Verifying your payment…
            </Typography>
          </Box>
        )}

        {stage === 'success' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, backgroundColor: C.greenBg, borderRadius: 2 }}>
            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>
              Payment successful! Your appointment is confirmed.
            </Typography>
          </Box>
        )}

        {stage === 'error' && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, backgroundColor: C.redBg, borderRadius: 2 }}>
            <ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, mt: 0.1 }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c' }}>{error}</Typography>
          </Box>
        )}

        {stage === 'expired' && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, backgroundColor: C.redBg, borderRadius: 2 }}>
            <AccessTimeIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, mt: 0.1 }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 700 }}>
                Payment session expired
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#b91c1c', mt: 0.25 }}>
                Your appointment is reserved. Click "Pay Now" from your appointments to try again.
              </Typography>
            </Box>
          </Box>
        )}

        <Typography sx={{ fontSize: '0.68rem', color: C.muted, mt: 2, textAlign: 'center' }}>
          256-bit encrypted • PCI-DSS compliant • Supports UPI, cards, net banking & wallets
        </Typography>
      </DialogContent>

      {/* Progress bar at bottom for timer */}
      {stage !== 'success' && stage !== 'expired' && (
        <LinearProgress
          variant="determinate"
          value={timerPct}
          sx={{
            height: 3,
            backgroundColor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: timerColor,
              transition: 'transform 1s linear, background-color 0.5s',
            },
          }}
        />
      )}

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, flexDirection: 'column', gap: 1 }}>
        {/* Simulate button — always visible, backend guards against production */}
        {stage !== 'success' && stage !== 'expired' && (
          <Button
            onClick={handleSimulate}
            disabled={isBlocked}
            variant="contained"
            fullWidth
            size="small"
            startIcon={stage === 'verifying' ? <CircularProgress size={14} color="inherit" /> : <span>🧪</span>}
            sx={{
              background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
              borderRadius: 2, fontWeight: 700, boxShadow: 'none', py: 1,
              '&:hover': { background: 'linear-gradient(90deg, #6d28d9, #5b21b6)', boxShadow: '0 3px 8px rgba(109,40,217,0.35)' },
              '&.Mui-disabled': { backgroundColor: C.border, color: C.muted },
            }}
          >
            Simulate Payment (Test Mode)
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            onClick={onClose}
            disabled={isBlocked}
            variant="outlined"
            size="small"
            sx={{ borderColor: C.border, color: C.slate, borderRadius: 2, fontWeight: 600, flex: 1 }}
          >
            {stage === 'expired' ? 'Close' : 'Cancel'}
          </Button>
          {stage !== 'expired' && (
            <Button
              onClick={handlePay}
              disabled={isBlocked || stage === 'success' || stage === 'checkout'}
              variant="contained"
              size="small"
              startIcon={stage === 'loading' ? <CircularProgress size={14} color="inherit" /> : <PaymentIcon />}
              sx={{
                backgroundColor: '#0D9488', borderRadius: 2, fontWeight: 700, flex: 2, boxShadow: 'none',
                '&:hover': { backgroundColor: '#0F766E' },
                '&.Mui-disabled': { backgroundColor: C.border, color: C.muted },
              }}
            >
              {stage === 'loading' ? 'Preparing…' : `Pay via Razorpay`}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
