import api from './api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DoctorProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileId?: string;
  specialization?: string;
  licenseNumber?: string;
  bio?: string;
  yearsExperience?: number;
  consultationFee?: number;
  profileImageUrl?: string;
  isAvailable?: boolean;
}

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  startTime: string;
  consultationType: string;
  status: string;
  reason: string | null;
  canJoin: boolean;
}

export interface ConsultationTypeEntry {
  type: 'IN_PERSON' | 'AUDIO' | 'VIDEO';
  fee: number;
}

export interface Clinic {
  id: string;
  doctorId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
  consultationTypes?: ConsultationTypeEntry[];
}

export interface Availability {
  id: string;
  doctorId: string;
  clinicId?: string;
  clinicName?: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface Slot {
  id: string;
  doctorId: string;
  clinicId?: string;
  clinicName?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

// ── Public search (no auth required) ──────────────────────────────────────────

export interface PublicClinicInfo {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  isPrimary: boolean;
  distanceKm?: number;
  consultationTypes?: ConsultationTypeEntry[];
}

export interface PublicDoctorResult {
  profileId: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  bio?: string;
  yearsExperience?: number;
  consultationFee?: number;
  isAvailable?: boolean;
  clinicName?: string;
  clinicCity?: string;
  distanceKm?: number;
  clinics?: PublicClinicInfo[];
}

export interface PublicSlot {
  id: string;
  clinicName?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface UnifiedSearchResult {
  registeredDoctors: PublicDoctorResult[];
  nearbyFacilities: NearbyClinic[];
}

/**
 * Unified search — one backend call that returns both:
 *   - DB-registered doctors (exact specialization, ≤1 km)
 *   - Real-time OSM hospitals/clinics from Overpass (≤1 km)
 *
 * When `coords` are supplied (from Nominatim autocomplete) geocoding is skipped server-side.
 */
export async function unifiedSearch(
  specialization: string,
  location?: string,
  coords?: { lat: number; lon: number } | null,
): Promise<UnifiedSearchResult> {
  const params: Record<string, string | number> = {};
  if (specialization) params.specialization = specialization;
  if (location?.trim()) params.location = location.trim();
  if (coords) { params.lat = coords.lat; params.lon = coords.lon; }
  const { data } = await api.get<UnifiedSearchResult>('/public/doctors/search', { params });
  return data;
}

export async function searchPublicDoctors(
  specialization: string,
  location?: string,
  coords?: { lat: number; lon: number } | null,
): Promise<PublicDoctorResult[]> {
  const params: Record<string, string | number> = {};
  if (specialization) params.specialization = specialization;
  if (location?.trim()) params.location = location.trim();
  if (coords) { params.lat = coords.lat; params.lon = coords.lon; }
  const { data } = await api.get<PublicDoctorResult[]>('/public/doctors', { params });
  return data;
}

export async function getPublicDoctorSlots(profileId: string, date: string, clinicId?: string): Promise<PublicSlot[]> {
  const params: Record<string, string> = { date };
  if (clinicId) params.clinicId = clinicId;
  const { data } = await api.get<PublicSlot[]>(`/public/doctors/${profileId}/slots`, { params });
  return data;
}

// ── Nearby clinics (Nominatim geocode + Overpass called directly from browser) ─

export interface NearbyClinic {
  osmId: number;
  name: string;
  type: 'hospital' | 'clinic' | string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  lat: number;
  lon: number;
  distanceKm: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags: Record<string, string>): string {
  return [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']]
    .filter(Boolean).join(', ');
}

/**
 * Geocodes a city name → { lat, lon } using Nominatim (OpenStreetMap).
 * API: GET https://nominatim.openstreetmap.org/search?q=<city>&format=json&limit=1
 */
export async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'MediCore/1.0' } }
  );
  const data = await resp.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

/**
 * Finds hospitals & clinics near (lat, lon) using the Overpass API (OpenStreetMap).
 *
 * External API: POST https://overpass-api.de/api/interpreter
 * Body (form-encoded): data=<OverpassQL query>
 *
 * OverpassQL query searches for:
 *   amenity=hospital, amenity=clinic, healthcare=doctor
 *   within `radius` metres of the given coordinates.
 *
 * Returns up to 20 results sorted by distance (closest first).
 */
export async function searchNearbyFacilities(lat: number, lon: number, radius = 5000): Promise<NearbyClinic[]> {
  const query = `[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});
  way["amenity"="hospital"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});
  node["amenity"="clinic"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});
  way["amenity"="clinic"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});
  node["healthcare"="doctor"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});
);
out center tags;`;

  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  });

  if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);

  const data = await resp.json();
  type OsmEl = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

  return (data.elements as OsmEl[])
    .filter((el) => el.tags?.name)
    .map((el) => {
      const eLat = el.lat ?? el.center?.lat ?? 0;
      const eLon = el.lon ?? el.center?.lon ?? 0;
      const tags = el.tags!;
      return {
        osmId: el.id,
        name: tags.name!,
        type: tags.amenity ?? tags.healthcare ?? 'clinic',
        address: buildAddress(tags) || undefined,
        phone: tags.phone,
        website: tags.website,
        openingHours: tags.opening_hours,
        lat: eLat,
        lon: eLon,
        distanceKm: haversineKm(lat, lon, eLat, eLon),
      } satisfies NearbyClinic;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20);
}

// kept for server-side use — calls backend which proxies Nominatim + Overpass
export async function getNearbyClinics(location: string, radius = 5000): Promise<NearbyClinic[]> {
  const { data } = await api.get<NearbyClinic[]>('/public/nearby-clinics', {
    params: { location: location.trim(), radius },
  });
  return data;
}

// ── Profile ────────────────────────────────────────────────────────────────────

export async function getDoctorProfile(): Promise<DoctorProfile> {
  const { data } = await api.get<DoctorProfile>('/api/doctor/profile');
  return data;
}

export async function updateDoctorProfile(payload: Partial<DoctorProfile>): Promise<DoctorProfile> {
  const { data } = await api.put<DoctorProfile>('/api/doctor/profile', payload);
  return data;
}

// ── Appointments ───────────────────────────────────────────────────────────────

export async function getDoctorTodaysAppointments(): Promise<DoctorAppointment[]> {
  const { data } = await api.get<DoctorAppointment[]>('/api/doctor/appointments/today');
  return data;
}

export async function getDoctorAllAppointments(): Promise<DoctorAppointment[]> {
  const { data } = await api.get<DoctorAppointment[]>('/api/doctor/appointments');
  return data;
}

export async function completeAppointment(id: string): Promise<DoctorAppointment> {
  const { data } = await api.patch<DoctorAppointment>(`/api/doctor/appointments/${id}/complete`);
  return data;
}

// ── Clinics ────────────────────────────────────────────────────────────────────

export async function getClinics(): Promise<Clinic[]> {
  const { data } = await api.get<Clinic[]>('/api/doctor/clinics');
  return data;
}

export async function addClinic(payload: Omit<Clinic, 'id' | 'doctorId'>): Promise<Clinic> {
  const { data } = await api.post<Clinic>('/api/doctor/clinics', payload);
  return data;
}

export async function updateClinic(id: string, payload: Partial<Clinic>): Promise<Clinic> {
  const { data } = await api.put<Clinic>(`/api/doctor/clinics/${id}`, payload);
  return data;
}

export async function deleteClinic(id: string): Promise<void> {
  await api.delete(`/api/doctor/clinics/${id}`);
}

// ── Availability ───────────────────────────────────────────────────────────────

export async function getAvailability(): Promise<Availability[]> {
  const { data } = await api.get<Availability[]>('/api/doctor/availability');
  return data;
}

export async function addAvailability(payload: {
  clinicId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}): Promise<Availability> {
  const { data } = await api.post<Availability>('/api/doctor/availability', payload);
  return data;
}

export async function updateAvailability(id: string, payload: Partial<{
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  clinicId: string;
}>): Promise<Availability> {
  const { data } = await api.put<Availability>(`/api/doctor/availability/${id}`, payload);
  return data;
}

export async function deleteAvailability(id: string): Promise<void> {
  await api.delete(`/api/doctor/availability/${id}`);
}

// ── Slots ──────────────────────────────────────────────────────────────────────

export async function getSlots(date: string): Promise<Slot[]> {
  const { data } = await api.get<Slot[]>('/api/doctor/slots', { params: { date } });
  return data;
}

export async function generateSlots(payload: {
  fromDate: string;
  toDate: string;
  clinicId?: string;
}): Promise<Slot[]> {
  const { data } = await api.post<Slot[]>('/api/doctor/slots/generate', payload);
  return data;
}

export async function blockSlot(id: string): Promise<Slot> {
  const { data } = await api.patch<Slot>(`/api/doctor/slots/${id}/block`);
  return data;
}
