-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE consultation_type AS ENUM ('IN_PERSON', 'VIDEO', 'PHONE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE payment_method AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CASH');
CREATE TYPE day_of_week AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
CREATE TYPE message_sender AS ENUM ('PATIENT', 'DOCTOR');
CREATE TYPE record_type AS ENUM ('PRESCRIPTION', 'LAB_RESULT', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role    NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    gender          gender,
    date_of_birth   DATE,
    profile_pic_url TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLINICS
-- ============================================================
CREATE TABLE clinics (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    state        VARCHAR(100) NOT NULL,
    pincode      VARCHAR(10)  NOT NULL,
    latitude     NUMERIC(9, 6),
    longitude    NUMERIC(9, 6),
    phone        VARCHAR(20),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE doctors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    clinic_id           UUID         REFERENCES clinics(id) ON DELETE SET NULL,
    specialization      VARCHAR(150) NOT NULL,
    qualification       VARCHAR(255) NOT NULL,
    license_number      VARCHAR(100) NOT NULL UNIQUE,
    experience_years    SMALLINT     NOT NULL DEFAULT 0,
    consultation_fee    NUMERIC(10, 2) NOT NULL,
    bio                 TEXT,
    avg_rating          NUMERIC(3, 2) DEFAULT 0.00,
    total_reviews       INT          NOT NULL DEFAULT 0,
    is_available        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_group     VARCHAR(5),
    allergies       TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCTOR AVAILABILITY
-- ============================================================
CREATE TABLE doctor_availability (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id   UUID        NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day         day_of_week NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    slot_duration_minutes SMALLINT NOT NULL DEFAULT 15,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    UNIQUE (doctor_id, day, start_time)
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id           UUID               NOT NULL REFERENCES doctors(id),
    patient_id          UUID               NOT NULL REFERENCES patients(id),
    clinic_id           UUID               REFERENCES clinics(id),
    appointment_date    DATE               NOT NULL,
    start_time          TIME               NOT NULL,
    end_time            TIME               NOT NULL,
    status              appointment_status NOT NULL DEFAULT 'PENDING',
    consultation_type   consultation_type  NOT NULL DEFAULT 'IN_PERSON',
    reason              TEXT,
    notes               TEXT,
    cancelled_by        UUID               REFERENCES users(id),
    cancellation_reason TEXT,
    created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_appointment_time CHECK (end_time > start_time)
);

-- ============================================================
-- CONSULTATIONS
-- ============================================================
CREATE TABLE consultations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id       UUID NOT NULL REFERENCES doctors(id),
    patient_id      UUID NOT NULL REFERENCES patients(id),
    diagnosis       TEXT,
    symptoms        TEXT[],
    prescription    TEXT,
    follow_up_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDICAL RECORDS
-- ============================================================
CREATE TABLE medical_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id UUID        REFERENCES consultations(id) ON DELETE SET NULL,
    uploaded_by     UUID        NOT NULL REFERENCES users(id),
    record_type     record_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    file_url        TEXT        NOT NULL,
    file_size_kb    INT,
    description     TEXT,
    recorded_at     DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REPORTS (generated summaries / analytics)
-- ============================================================
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    generated_by    UUID        NOT NULL REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    content         JSONB,
    file_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID           NOT NULL UNIQUE REFERENCES appointments(id),
    patient_id          UUID           NOT NULL REFERENCES patients(id),
    amount              NUMERIC(10, 2) NOT NULL,
    currency            CHAR(3)        NOT NULL DEFAULT 'INR',
    status              payment_status NOT NULL DEFAULT 'PENDING',
    method              payment_method,
    gateway_order_id    VARCHAR(255),
    gateway_payment_id  VARCHAR(255),
    gateway_signature   VARCHAR(512),
    paid_at             TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID           NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    sender_id       UUID           NOT NULL REFERENCES users(id),
    sender_type     message_sender NOT NULL,
    content         TEXT           NOT NULL,
    is_read         BOOLEAN        NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id       UUID    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id      UUID    NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id  UUID    NOT NULL UNIQUE REFERENCES appointments(id),
    rating          SMALLINT NOT NULL,
    comment         TEXT,
    is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_phone    ON users(phone);
CREATE INDEX idx_users_role     ON users(role);

-- doctors
CREATE INDEX idx_doctors_user_id        ON doctors(user_id);
CREATE INDEX idx_doctors_clinic_id      ON doctors(clinic_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);

-- patients
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- doctor_availability
CREATE INDEX idx_availability_doctor_day ON doctor_availability(doctor_id, day);

-- appointments
CREATE INDEX idx_appointments_doctor_id   ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id  ON appointments(patient_id);
CREATE INDEX idx_appointments_date        ON appointments(appointment_date);
CREATE INDEX idx_appointments_status      ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- consultations
CREATE INDEX idx_consultations_doctor_id  ON consultations(doctor_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);

-- medical_records
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_type       ON medical_records(record_type);

-- payments
CREATE INDEX idx_payments_patient_id     ON payments(patient_id);
CREATE INDEX idx_payments_status         ON payments(status);
CREATE INDEX idx_payments_gateway_order  ON payments(gateway_order_id);

-- messages
CREATE INDEX idx_messages_appointment_id ON messages(appointment_id);
CREATE INDEX idx_messages_sender_id      ON messages(sender_id);

-- reviews
CREATE INDEX idx_reviews_doctor_id  ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient_id ON reviews(patient_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'clinics', 'doctors', 'patients', 'doctor_availability',
        'appointments', 'consultations', 'medical_records', 'reports',
        'payments', 'messages', 'reviews'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t
        );
    END LOOP;
END;
$$;
