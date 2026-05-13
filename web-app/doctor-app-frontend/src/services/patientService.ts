import api from './api';

export interface PatientProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  dateOfBirth: string | null;   // ISO date "YYYY-MM-DD"
  gender: string | null;
  bloodType: string | null;
  memberSince: string | null;
}

export async function getPatientProfile(): Promise<PatientProfile> {
  const { data } = await api.get<PatientProfile>('/api/patient/profile');
  return data;
}

export async function updatePatientProfile(
  updates: Partial<Pick<PatientProfile, 'firstName' | 'lastName' | 'phone' | 'dateOfBirth' | 'gender' | 'bloodType'>>
): Promise<PatientProfile> {
  const { data } = await api.patch<PatientProfile>('/api/patient/profile', updates);
  return data;
}
