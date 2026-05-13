-- Payment status enum (no-op if already exists from V1)
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE app_appointments
    ADD COLUMN IF NOT EXISTS payment_status  VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS amount_paise    BIGINT,
    ADD COLUMN IF NOT EXISTS doctor_profile_id UUID,
    ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

CREATE TABLE IF NOT EXISTS app_payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID NOT NULL REFERENCES app_appointments(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL,
    razorpay_order_id   VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  VARCHAR(256),
    amount_paise        BIGINT NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
    status              VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    error_code          VARCHAR(100),
    error_description   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment ON app_payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient     ON app_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_order       ON app_payments(razorpay_order_id);
