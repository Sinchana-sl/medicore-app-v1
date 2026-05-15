import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenueRupees: number;
  capturedPayments: number;
  pendingPayments: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminDoctor {
  profileId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  specialization: string;
  licenseNumber: string;
  yearsExperience: number;
  consultationFee: number | null;
  isAvailable: boolean;
  isActive: boolean;
  clinicCount: number;
  createdAt: string;
}

export interface AdminClinic {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  specialization: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface AdminAppointment {
  id: string;
  patientId: string;
  patientEmail: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
  appointmentDate: string;
  startTime: string;
  consultationType: string;
  status: string;
  paymentStatus: string;
  amountRupees: number | null;
  reason: string;
  createdAt: string;
}

export interface PaymentSummary {
  id: string;
  appointmentId: string;
  patientId: string;
  patientEmail: string | null;
  amountRupees: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
}

// Stats
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
}

// Users
export async function getAdminUsers(role?: string, search?: string): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/admin/users', {
    params: { role: role || undefined, search: search || undefined },
  });
  return data;
}
export async function toggleUserStatus(userId: string): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/status`);
  return data;
}
export async function updateUserRole(userId: string, role: string): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
  return data;
}
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

// Doctors
export async function getAdminDoctors(): Promise<AdminDoctor[]> {
  const { data } = await api.get<AdminDoctor[]>('/admin/doctors');
  return data;
}
export async function toggleDoctorAvailability(profileId: string): Promise<AdminDoctor> {
  const { data } = await api.patch<AdminDoctor>(`/admin/doctors/${profileId}/availability`);
  return data;
}

// Clinics
export async function getAdminClinics(): Promise<AdminClinic[]> {
  const { data } = await api.get<AdminClinic[]>('/admin/clinics');
  return data;
}
export async function deleteClinic(clinicId: string): Promise<void> {
  await api.delete(`/admin/clinics/${clinicId}`);
}

// Appointments
export async function getAdminAppointments(status?: string): Promise<AdminAppointment[]> {
  const { data } = await api.get<AdminAppointment[]>('/admin/appointments', {
    params: { status: status || undefined },
  });
  return data;
}
export async function updateAppointmentStatus(id: string, status: string): Promise<AdminAppointment> {
  const { data } = await api.patch<AdminAppointment>(`/admin/appointments/${id}/status`, { status });
  return data;
}

// Payments
export async function getAdminPayments(): Promise<PaymentSummary[]> {
  const { data } = await api.get<PaymentSummary[]>('/admin/payments');
  return data;
}
