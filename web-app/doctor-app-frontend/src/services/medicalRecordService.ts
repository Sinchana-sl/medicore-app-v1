import api from './api';

export interface MedicalRecord {
  id: string;
  title: string;
  subtitle?: string;
  recordType: string;
  status: string;
  fileUrl?: string;
  recordedAt?: string;
}

export interface CreateMedicalRecordRequest {
  title: string;
  subtitle?: string;
  recordType?: string;
  fileUrl?: string;
  fileSizeKb?: number;
  recordedAt?: string;
}

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const { data } = await api.get<MedicalRecord[]>('/api/medical-records');
  return data;
}

export async function createMedicalRecord(request: CreateMedicalRecordRequest): Promise<MedicalRecord> {
  const { data } = await api.post<MedicalRecord>('/api/medical-records', request);
  return data;
}
