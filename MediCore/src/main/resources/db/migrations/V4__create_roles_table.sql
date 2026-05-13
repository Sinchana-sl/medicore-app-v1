CREATE TABLE roles (
    id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50)  NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES
('PATIENT_ROLE'),
('DOCTOR_ROLE'),
('ADMIN_ROLE');

ALTER TABLE auth_users
    ADD COLUMN role_id UUID REFERENCES roles(id),
    ALTER COLUMN role DROP DEFAULT;

UPDATE auth_users u
SET role_id = r.id
FROM roles r
WHERE r.name = u.role || '_ROLE';

CREATE INDEX idx_auth_users_role_id ON auth_users(role_id);
