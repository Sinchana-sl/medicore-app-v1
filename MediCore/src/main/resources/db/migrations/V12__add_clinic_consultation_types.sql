CREATE TABLE IF NOT EXISTS app_clinic_consultation_types (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID        NOT NULL REFERENCES app_clinics(id) ON DELETE CASCADE,
    consultation_type   VARCHAR(20) NOT NULL CHECK (consultation_type IN ('IN_PERSON', 'AUDIO', 'VIDEO')),
    fee                 NUMERIC(10,2) NOT NULL,
    UNIQUE (clinic_id, consultation_type)
);

CREATE INDEX IF NOT EXISTS idx_clinic_consultation_types_clinic ON app_clinic_consultation_types(clinic_id);
