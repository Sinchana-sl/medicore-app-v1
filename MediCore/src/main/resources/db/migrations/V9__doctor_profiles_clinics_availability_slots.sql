-- ============================================================
-- Doctor extended profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS app_doctor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
    specialization      VARCHAR(150),
    license_number      VARCHAR(100),
    bio                 TEXT,
    years_experience    SMALLINT NOT NULL DEFAULT 0,
    consultation_fee    NUMERIC(10,2),
    profile_image_url   TEXT,
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_doctor_profiles_user_id ON app_doctor_profiles(user_id);

-- ============================================================
-- Clinics (owned by a doctor profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_clinics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id   UUID NOT NULL REFERENCES app_doctor_profiles(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    address     TEXT,
    city        VARCHAR(100),
    state       VARCHAR(100),
    pincode     VARCHAR(10),
    phone       VARCHAR(20),
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_clinics_doctor_id ON app_clinics(doctor_id);

-- ============================================================
-- Doctor availability (recurring weekly schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_doctor_availability (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id               UUID NOT NULL REFERENCES app_doctor_profiles(id) ON DELETE CASCADE,
    clinic_id               UUID REFERENCES app_clinics(id) ON DELETE SET NULL,
    day_of_week             SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time              TIME NOT NULL,
    end_time                TIME NOT NULL,
    slot_duration_minutes   SMALLINT NOT NULL DEFAULT 30,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_avail_time_order CHECK (end_time > start_time),
    CONSTRAINT uq_doctor_day_start UNIQUE (doctor_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_app_doctor_availability_doctor ON app_doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_app_doctor_availability_day    ON app_doctor_availability(doctor_id, day_of_week);

-- ============================================================
-- Generated time slots for specific dates
-- ============================================================
CREATE TABLE IF NOT EXISTS app_doctor_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id       UUID NOT NULL REFERENCES app_doctor_profiles(id) ON DELETE CASCADE,
    clinic_id       UUID REFERENCES app_clinics(id) ON DELETE SET NULL,
    availability_id UUID REFERENCES app_doctor_availability(id) ON DELETE SET NULL,
    slot_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    appointment_id  UUID REFERENCES app_appointments(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, slot_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_app_doctor_slots_doctor_date ON app_doctor_slots(doctor_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_app_doctor_slots_status      ON app_doctor_slots(doctor_id, slot_date, status);

-- Triggers (skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_app_doctor_profiles'
    ) THEN
        CREATE TRIGGER set_updated_at_app_doctor_profiles
            BEFORE UPDATE ON app_doctor_profiles
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_app_clinics'
    ) THEN
        CREATE TRIGGER set_updated_at_app_clinics
            BEFORE UPDATE ON app_clinics
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    END IF;
END;
$$;
