-- Add profile fields to auth_users
ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name  VARCHAR(100) DEFAULT '';

-- Patient appointments (linked directly to auth_users to keep auth and app tables consistent)
CREATE TABLE IF NOT EXISTS app_appointments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  doctor_name       VARCHAR(200) NOT NULL,
  doctor_specialty  VARCHAR(100),
  clinic_name       VARCHAR(200),
  doctor_image_url  TEXT,
  appointment_date  DATE        NOT NULL,
  start_time        TIME        NOT NULL,
  consultation_type VARCHAR(20) NOT NULL DEFAULT 'IN_PERSON',
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  reason            TEXT,
  notes             TEXT,
  can_join          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_appointments_patient_id
  ON app_appointments(patient_id);

CREATE INDEX IF NOT EXISTS idx_app_appointments_date
  ON app_appointments(appointment_date);

CREATE TRIGGER set_updated_at_app_appointments
  BEFORE UPDATE ON app_appointments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Patient medical records (linked directly to auth_users)
CREATE TABLE IF NOT EXISTS app_medical_records (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  subtitle     TEXT,
  record_type  VARCHAR(30) NOT NULL DEFAULT 'LAB_RESULT',
  status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  file_url     TEXT,
  file_size_kb INT,
  recorded_at  DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_medical_records_patient_id
  ON app_medical_records(patient_id);
