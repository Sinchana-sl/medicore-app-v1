import api from './api';

export interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
  doctorImageUrl?: string;
  appointmentDate: string;
  startTime: string;
  consultationType: string;
  status: string;
  reason?: string;
  canJoin: boolean;
  patientPhone?: string;
  paymentStatus?: string;
  amountPaise?: number;
  doctorProfileId?: string;
  razorpayOrderId?: string;
}

export interface BookAppointmentRequest {
  doctorName: string;
  doctorSpecialty?: string;
  clinicName?: string;
  doctorImageUrl?: string;
  appointmentDate: string;
  startTime: string;
  consultationType?: string;
  reason?: string;
  isForSelf: boolean;
  patientName?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  whatsappUpdates: boolean;
  doctorProfileId?: string;
  amountPaise?: number;
  slotId?: string;
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/api/appointments');
  return data;
}

export async function bookAppointment(request: BookAppointmentRequest): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/api/appointments', request);
  return data;
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/api/appointments/${id}/cancel`);
  return data;
}
