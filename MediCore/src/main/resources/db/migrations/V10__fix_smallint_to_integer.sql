-- Hibernate maps Java int to INTEGER; change SMALLINT columns to match
ALTER TABLE app_doctor_availability
    ALTER COLUMN day_of_week           TYPE INTEGER,
    ALTER COLUMN slot_duration_minutes TYPE INTEGER;

ALTER TABLE app_doctor_profiles
    ALTER COLUMN years_experience TYPE INTEGER;
