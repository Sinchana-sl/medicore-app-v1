# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedicalApp is a full-stack healthcare appointment booking and management platform called **MediCore**. It consists of:
- **Backend:** `MediCore/` — Spring Boot 4.0.5 (Java 17) REST API
- **Frontend:** `web-app/doctor-app-frontend/` — React 19 + TypeScript + Vite SPA

## Commands

### Backend (`MediCore/`)
```bash
./mvnw spring-boot:run       # Start dev server on :8080
./mvnw clean package         # Build JAR
./mvnw test                  # Run tests
./mvnw test -Dtest=ClassName # Run single test class
```

### Frontend (`web-app/doctor-app-frontend/`)
```bash
npm run dev      # Vite dev server (default :5173)
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Prerequisites
- PostgreSQL running on `localhost:5432` with database `medicore`. The `application.yaml` datasource password is blank — update it if your local postgres user has a password.
- Flyway is **disabled** in `application.yaml` (`flyway.enabled: false`) — run migrations manually or re-enable when needed. Migration files are in `MediCore/src/main/resources/db/migrations/V1–V14__*.sql`.
- SMTP is configured via `spring.mail.*` in `application.yaml` — required for OTP and welcome emails.
- CORS is configured to allow `http://localhost:5173`, `5174`, and `5175`.
- Razorpay test credentials are in `application.yaml` under `razorpay.key-id` / `razorpay.key-secret`.
- Groq API key is in `application.yaml` under `groq.api-key` — required for AI features; get a free key at console.groq.com.

## Architecture

### Backend Structure (`MediCore/src/main/java/com/healthcare/`)

Organized by feature module under `modules/`:

```
config/          # AppConfig, SecurityConfig, CorsConfig, FlywayConfig
security/        # JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
modules/
  auth/          # login, register, logout, refresh token rotation, OTP, password reset
  appointment/   # book, list, cancel appointments (app_appointments table)
  patient/       # get/update patient profile (first_name, last_name on auth_users)
  report/        # create/list medical records (app_medical_records table)
  doctor/        # doctor profile, clinics, availability, slots (see Doctor Module below)
  clinic/        # NearbyClinicController — /public/nearby-clinics (geocodes via Nominatim, POI via Overpass API)
  notifications/ # EmailService — welcome, OTP, and password-reset emails via JavaMail
  payment/       # Razorpay payment orders, verification, simulation (app_payments table)
  ai/            # Groq-backed document explanation + chat assistant
exception/       # GlobalExceptionHandler
```

**Auth flow:** JWT access tokens (15 min) + refresh tokens (7 days). Refresh token rotation with reuse-attack detection. OTP-based email verification (`/auth/otp/send`, `/auth/otp/verify`) and password reset (`/auth/password/send-otp`, `/auth/password/reset`) using the `otp_tokens` table (OTPs expire in 10 min). Logout revokes the refresh token.

Role enum values (stored in DB and used as Spring Security authorities): `PATIENT_ROLE`, `DOCTOR_ROLE`, `ADMIN_ROLE`.

**Security:** Public routes: `/auth/**`, `/public/**`. All other routes require a valid JWT. `/admin/**` requires `ADMIN_ROLE`. `@EnableMethodSecurity` is active so `@PreAuthorize` works on controller methods. `UserDetails.getUsername()` returns the user's **email**.

**Database:** The `auth_users` table is the single user table; appointments and medical records reference it via `patient_id UUID`. No separate `patients` table. JPA uses `ddl-auto: validate` — schema must match migrations exactly (currently V1–V14).

> **Schema note:** V1 defines an original full schema (`users`, `doctors`, `patients`, `clinics`, etc.) that was abandoned. The JPA entities only map to tables introduced from V2 onwards (`auth_users`, `refresh_tokens`, `otp_tokens`, `doctor_profiles`, etc.). When bootstrapping a fresh database, run all migrations V1–V14 in order — the V1 tables will exist but are unused by the application.

**API route prefixes:**
- `/auth/**` — unauthenticated auth + OTP + password-reset endpoints
- `/public/doctors/**` — unauthenticated: browse available doctor slots
- `/public/nearby-clinics?location=&radius=&specialization=` — geocode-based clinic search (no auth); also accepts `?lat=&lon=` directly
- `/api/appointments` — appointment CRUD (patients)
- `/api/patient/profile` — patient profile get/update
- `/api/medical-records` — medical record CRUD
- `/api/doctor/**` — doctor-facing endpoints (requires `DOCTOR_ROLE`)
- `/api/payments` — payment order creation, Razorpay verification, simulation, receipt lookup
- `/api/ai/explain` — multipart upload (image/PDF) → AI-generated explanation (Groq llama-3.2-11b-vision)
- `/api/ai/chat` — stateless chat with conversation history (Groq llama-3.3-70b-versatile)

### Doctor Module (`modules/doctor/`)

The doctor module is fully implemented across two controllers:

- **`DoctorController`** (`/api/doctor`, requires `DOCTOR_ROLE`):
  - `GET/PUT /api/doctor/profile` — upsert doctor profile (specialization, license, bio, fee, etc.)
  - `GET /api/doctor/appointments/today` and `/api/doctor/appointments` — view patient appointments
  - `GET/POST/PUT/DELETE /api/doctor/clinics/{id}` — manage clinic locations
  - `GET/POST/PUT/DELETE /api/doctor/availability/{id}` — set weekly availability per clinic/day
  - `POST /api/doctor/slots/generate` — generate time slots from availability rules (date range)
  - `GET /api/doctor/slots?date=` — view slots for a date; `PATCH /api/doctor/slots/{id}/block`

- **`PublicDoctorController`** (`/public/doctors`, unauthenticated):
  - `GET /public/doctors/{doctorProfileId}/slots?date=` — returns AVAILABLE slots for patients to book

Entities: `DoctorProfile`, `DoctorClinic`, `DoctorAvailability`, `DoctorSlot` (all in `doctor/entity/`).

> **Module structure note:** Unlike other modules that use a `service/` subdirectory, the doctor module keeps `DoctorService.java` and `DoctorAvailabilityService.java` directly at the `modules/doctor/` root alongside the controllers.

### Payment Module (`modules/payment/`)

Uses Razorpay for payment processing. Endpoints at `/api/payments`:
- `POST /create-order` — creates a Razorpay order linked to an appointment
- `POST /verify` — verifies Razorpay signature and confirms payment
- `POST /simulate` — simulates a successful payment (test/dev use)
- `GET /appointment/{appointmentId}` — retrieves payment details for an appointment

Also includes `ReceiptPdfService` for generating PDF payment receipts.

### AI Module (`modules/ai/`)

Powered by Groq API (free tier). Two endpoints:
- `POST /api/ai/explain` (multipart) — accepts image (JPG/PNG) or PDF, returns plain-text explanation; uses `llama-3.2-11b-vision-preview` for images and extracts text via PDFBox for PDFs, then uses `llama-3.3-70b-versatile`
- `POST /api/ai/chat` — accepts `[{role, content}]` history array, returns AI reply

The `groq.api-key` must be set in `application.yaml` — service logs a warning on startup if missing.

### Frontend Structure (`web-app/doctor-app-frontend/src/`)

```
pages/
  LoginPage, RegisterPage, ForgotPasswordPage
  PatientDashboard, PatientAppointmentsPage, PatientSettingsPage
  DoctorDashboard
  doctor/  DoctorProfilePage, DoctorSchedulePage, DoctorClinicsPage, DoctorAvailabilityPage, DoctorSlotsPage
components/
  AuthForm, BrandLogo, BrandingPanel, RoleSelector
  SideNavBar/TopNavBar (patient), DoctorSideNavBar/DoctorTopNavBar/DoctorPageLayout (doctor)
  AppointmentCard, ReportItem, HealthTimeline, ProfileAvatarMenu
  ChatBot, PaymentModal
contexts/
  AppThemeContext.tsx  # light/dark/system theme toggle; exposes useAppTheme()
  DoctorContext.tsx    # loads & caches DoctorProfile; exposes useDoctorContext()
  ToastContext.tsx     # app-wide toast notifications
services/
  api.ts               # Axios instance; injects Bearer token; clears auth + redirects on 401/403
  authService.ts       # login, register, logout, token/role storage in localStorage
  doctorService.ts     # profile, appointments, clinics, availability, slots
  appointmentService.ts, patientService.ts, medicalRecordService.ts
  aiService.ts, paymentService.ts
hooks/           # useAuth.ts
styles/theme.ts  # MUI theme (supports light/dark modes)
```

**Routing** (in `App.tsx`): All routes are wrapped in `AppThemeProvider` → `ToastProvider`. Patient routes: `/` and `/login` → LoginPage, `/register`, `/forgot-password`, `/dashboard`, `/appointments`, `/settings`. Doctor routes wrapped in `DoctorProvider` (which pre-fetches the doctor profile): `/doctor-dashboard`, `/doctor/profile`, `/doctor/schedule`, `/doctor/clinics`. Note: `DoctorAvailabilityPage` and `DoctorSlotsPage` exist as files in `pages/doctor/` but are **not yet added to `App.tsx`**.

**localStorage keys:** `token` (JWT), `role` (`PATIENT_ROLE`/`DOCTOR_ROLE`/`ADMIN_ROLE`), `userId`, `loginTime`, `expiresIn`. The `api.ts` base URL is hardcoded to `http://localhost:8080`. The `registerUser` function maps UI role values (`patient` → `PATIENT_ROLE`, `doctor` → `DOCTOR_ROLE`) before sending to the backend.

**UI:** Material-UI (MUI) v9 with Emotion. React Compiler is enabled via `@rolldown/plugin-babel` with `reactCompilerPreset` in `vite.config.ts`.

## Implementation Status

| Module | Backend | Frontend |
|--------|---------|----------|
| Auth (login/register/refresh/logout) | ✅ Complete | ✅ Complete |
| OTP login + password reset | ✅ Complete | ✅ Complete |
| Role-based routing | ✅ Complete | ✅ Complete |
| Appointment CRUD | ✅ Complete | ✅ Complete |
| Patient profile | ✅ Complete | ⏳ UI only |
| Medical records | ✅ Complete | ⏳ UI only |
| Doctor profile/clinics/availability/slots | ✅ Complete | ✅ Complete |
| Email notifications (welcome, OTP) | ✅ Complete | N/A |
| Payments (Razorpay) | ✅ Complete | ⏳ PaymentModal component exists |
| AI (document explain + chat) | ✅ Complete | ⏳ ChatBot component exists |
