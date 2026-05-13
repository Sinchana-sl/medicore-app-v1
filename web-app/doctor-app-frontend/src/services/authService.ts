import api from './api';

export interface AuthResponse {
  userId: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiError {
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string>;
}

function persistSession(data: AuthResponse) {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('role', data.role);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('loginTime', String(Date.now()));
  localStorage.setItem('expiresIn', String(data.expiresIn));
}

export function logout() {
  localStorage.clear();
  window.location.href = '/login';
}

export function isTokenExpired(): boolean {
  const loginTime = localStorage.getItem('loginTime');
  const expiresIn = localStorage.getItem('expiresIn');
  if (!loginTime || !expiresIn) return true;
  return Date.now() - Number(loginTime) > Number(expiresIn);
}

export function getRole(): string | null {
  return localStorage.getItem('role');
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  persistSession(data);
  return data;
}

const roleMap: Record<string, string> = {
  patient: 'PATIENT_ROLE',
  doctor: 'DOCTOR_ROLE',
};

export interface RegisterExtras {
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  specialization?: string;
}

export async function registerUser(email: string, password: string, role: string, extras?: RegisterExtras): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    role: roleMap[role] ?? role,
    ...extras,
  });
  persistSession(data);
  return data;
}

export async function sendOtp(email: string): Promise<void> {
  await api.post('/auth/otp/send', { email });
}

export async function verifyOtp(email: string, code: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/otp/verify', { email, code });
  persistSession(data);
  return data;
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  await api.post('/auth/password/send-otp', { email });
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await api.post('/auth/password/reset', { email, code, newPassword });
}
