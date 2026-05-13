ALTER TABLE app_appointments
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_app_appointments_doctor_id
  ON app_appointments(doctor_id);
