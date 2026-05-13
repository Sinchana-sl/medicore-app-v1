import api from './api';

export interface PaymentOrderResponse {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  appointmentId: string;
  patientName: string;
  patientEmail: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResult {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaise: number;
  currency: string;
  status: string;
  appointmentId: string;
}

export async function createPaymentOrder(appointmentId: string): Promise<PaymentOrderResponse> {
  const { data } = await api.post('/api/payments/create-order', { appointmentId });
  return data;
}

export async function verifyPayment(req: VerifyPaymentRequest): Promise<PaymentResult> {
  const { data } = await api.post('/api/payments/verify', req);
  return data;
}

export async function simulatePayment(appointmentId: string): Promise<PaymentResult> {
  const { data } = await api.post('/api/payments/simulate', { appointmentId });
  return data;
}
