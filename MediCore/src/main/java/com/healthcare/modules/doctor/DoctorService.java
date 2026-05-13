package com.healthcare.modules.doctor;

import com.healthcare.modules.appointment.entity.AppAppointment;
import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.doctor.dto.*;
import com.healthcare.modules.doctor.entity.DoctorClinic;
import com.healthcare.modules.doctor.entity.DoctorProfile;
import com.healthcare.modules.doctor.entity.ClinicConsultationType;
import com.healthcare.modules.doctor.repository.ClinicConsultationTypeRepository;
import com.healthcare.modules.doctor.repository.DoctorClinicRepository;
import com.healthcare.modules.doctor.repository.DoctorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository profileRepository;
    private final DoctorClinicRepository clinicRepository;
    private final ClinicConsultationTypeRepository consultationTypeRepository;
    private final AppointmentRepository appointmentRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    // ── Profile ────────────────────────────────────────────────────────────────

    @Transactional
    public DoctorProfileResponse getProfile(String email) {
        User user = getUser(email);
        DoctorProfile profile = getOrCreateProfile(user.getId());
        return toProfileResponse(user, profile);
    }

    @Transactional
    public DoctorProfileResponse upsertProfile(String email, DoctorProfileRequest req) {
        User user = getUser(email);

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null)  user.setLastName(req.getLastName());
        userRepository.save(user);

        // Atomic insert-if-absent eliminates the check-then-insert race condition.
        profileRepository.insertIfAbsent(user.getId());
        DoctorProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow();

        if (req.getSpecialization()  != null) profile.setSpecialization(req.getSpecialization());
        if (req.getLicenseNumber()   != null) profile.setLicenseNumber(req.getLicenseNumber());
        if (req.getBio()             != null) profile.setBio(req.getBio());
        if (req.getYearsExperience() != null) profile.setYearsExperience(req.getYearsExperience());
        if (req.getConsultationFee() != null) profile.setConsultationFee(req.getConsultationFee());
        if (req.getProfileImageUrl() != null) profile.setProfileImageUrl(req.getProfileImageUrl());
        if (req.getIsAvailable()     != null) profile.setAvailable(req.getIsAvailable());

        profileRepository.save(profile);
        return toProfileResponse(user, profile);
    }

    // ── Public search ─────────────────────────────────────────────────────────

    public List<PublicDoctorResponse> searchPublicDoctors(
            String specialization, String location, Double searchLat, Double searchLon) {

        // 1. Find doctors matching the requested specialization.
        //    Two sources merged (deduped by profile id):
        //      a) doctor_profiles.specialization exact match
        //      b) doctors whose clinic NAME contains a specialization keyword
        //         (covers doctors who haven't filled in their profile specialization yet)
        Map<UUID, DoctorProfile> profileMap = new LinkedHashMap<>();

        if (specialization == null || specialization.isBlank()) {
            profileRepository.findByIsAvailableTrue()
                    .forEach(p -> profileMap.put(p.getId(), p));
        } else {
            // a) exact specialization field match
            profileRepository.findBySpecializationIgnoreCase(specialization)
                    .forEach(p -> profileMap.put(p.getId(), p));

            // b) clinic-name keyword match — catches doctors whose profile specialization is blank/null
            String keyword = specializationToKeyword(specialization);
            List<UUID> doctorIdsByClinicName = clinicRepository.findDoctorIdsByClinicNameKeyword(keyword);
            if (!doctorIdsByClinicName.isEmpty()) {
                profileRepository.findAllById(doctorIdsByClinicName)
                        .stream()
                        .filter(DoctorProfile::isAvailable)
                        .forEach(p -> profileMap.putIfAbsent(p.getId(), p));
            }
        }

        List<DoctorProfile> profiles = new ArrayList<>(profileMap.values());

        boolean hasLocation = searchLat != null || (location != null && !location.isBlank());

        // 2. Build lookup structures for location matching
        //    clinicDistances : clinicId → km from search point  (coordinate path)
        //    textMatchedIds  : clinicIds that match the location text  (text path)
        Map<UUID, Double> clinicDistances = new HashMap<>();
        Set<UUID> textMatchedIds = new HashSet<>();

        if (searchLat != null && searchLon != null) {
            for (DoctorClinic c : clinicRepository.findAll()) {
                if (c.getLatitude() == null || c.getLongitude() == null) continue;
                double dist = haversineKm(searchLat, searchLon, c.getLatitude(), c.getLongitude());
                clinicDistances.put(c.getId(), Math.round(dist * 100.0) / 100.0);
            }
        }
        if (location != null && !location.isBlank()) {
            // Text match on city / address / state — catches clinics that have no lat/lon stored
            clinicRepository.findByLocation(location)
                    .forEach(c -> textMatchedIds.add(c.getId()));
        }

        // 3. For each doctor build a filtered, enriched clinic list
        List<PublicDoctorResponse> results = profiles.stream()
                .filter(DoctorProfile::isAvailable)
                .map(p -> {
                    User user = userRepository.findById(p.getUserId()).orElse(null);
                    List<DoctorClinic> allClinics =
                            clinicRepository.findByDoctorIdOrderByIsPrimaryDescNameAsc(p.getId());

                    // Keep only location-matching clinics when a location was given.
                    // A clinic matches if:
                    //   • its id is in textMatchedIds (city/address text hit), OR
                    //   • it has coordinates and is in clinicDistances (any distance — shown with badge)
                    // When no location is specified every clinic passes.
                    List<DoctorClinic> matchedClinics = hasLocation
                            ? allClinics.stream()
                                    .filter(c -> textMatchedIds.contains(c.getId())
                                            || clinicDistances.containsKey(c.getId()))
                                    .collect(Collectors.toList())
                            : allClinics;

                    // Skip doctor entirely if a location was given but none of their clinics match
                    if (hasLocation && matchedClinics.isEmpty()) return null;

                    // Enrich matched clinics with distance + consultation types
                    List<PublicClinicInfo> clinicInfos = matchedClinics.stream().map(c -> {
                        Double cDist = clinicDistances.get(c.getId());

                        List<ConsultationTypeEntry> types = consultationTypeRepository.findByClinicId(c.getId())
                                .stream().map(t -> {
                                    ConsultationTypeEntry e = new ConsultationTypeEntry();
                                    e.setType(t.getConsultationType());
                                    e.setFee(t.getFee());
                                    return e;
                                }).collect(Collectors.toList());

                        return PublicClinicInfo.builder()
                                .id(c.getId())
                                .name(c.getName())
                                .address(c.getAddress())
                                .city(c.getCity())
                                .state(c.getState())
                                .phone(c.getPhone())
                                .isPrimary(c.isPrimary())
                                .distanceKm(cDist)
                                .consultationTypes(types)
                                .build();
                    }).collect(Collectors.toList());

                    // Sort: closest first, then primary, then alphabetical
                    clinicInfos.sort(Comparator
                            .comparingDouble((PublicClinicInfo ci) ->
                                    ci.getDistanceKm() != null ? ci.getDistanceKm() : Double.MAX_VALUE)
                            .thenComparing(ci -> !ci.isPrimary()));

                    Double bestDist = clinicInfos.stream()
                            .map(PublicClinicInfo::getDistanceKm)
                            .filter(Objects::nonNull)
                            .min(Double::compareTo)
                            .orElse(null);

                    DoctorClinic firstClinic = matchedClinics.isEmpty() ? null : matchedClinics.get(0);

                    return PublicDoctorResponse.builder()
                            .profileId(p.getId())
                            .firstName(user != null ? user.getFirstName() : "")
                            .lastName(user != null ? user.getLastName() : "")
                            .specialization(p.getSpecialization())
                            .bio(p.getBio())
                            .yearsExperience(p.getYearsExperience())
                            .consultationFee(p.getConsultationFee())
                            .isAvailable(p.isAvailable())
                            .clinicName(firstClinic != null ? firstClinic.getName() : null)
                            .clinicCity(firstClinic != null ? firstClinic.getCity() : null)
                            .distanceKm(bestDist)
                            .clinics(clinicInfos)
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Sort doctors: closest clinic first, unlocated doctors last
        results.sort(Comparator.comparingDouble((PublicDoctorResponse r) ->
                r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE));

        return results;
    }

    private static String specializationToKeyword(String specialization) {
        return switch (specialization.toLowerCase(Locale.ENGLISH)) {
            case "cardiology"       -> "cardio";
            case "dermatology"      -> "derma";
            case "general practice" -> "general";
            case "neurology"        -> "neuro";
            case "oncology"         -> "oncol";
            case "orthopedics"      -> "ortho";
            case "pediatrics"       -> "pedia";
            case "psychiatry"       -> "psych";
            case "radiology"        -> "radio";
            case "surgery"          -> "surg";
            default                 -> specialization.length() > 5
                                        ? specialization.substring(0, 5).toLowerCase(Locale.ENGLISH)
                                        : specialization.toLowerCase(Locale.ENGLISH);
        };
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Appointments ───────────────────────────────────────────────────────────

    public List<DoctorAppointmentResponse> getTodaysAppointments(String email) {
        User doctor = getUser(email);
        return appointmentRepository
                .findByDoctorIdAndDate(doctor.getId(), LocalDate.now())
                .stream().map(this::toApptResponse).collect(Collectors.toList());
    }

    public List<DoctorAppointmentResponse> getAllAppointments(String email) {
        User doctor = getUser(email);
        return appointmentRepository
                .findByDoctorIdOrderByDateTimeAsc(doctor.getId())
                .stream().map(this::toApptResponse).collect(Collectors.toList());
    }

    @Transactional
    public DoctorAppointmentResponse completeAppointment(String doctorEmail, UUID appointmentId) {
        User doctor = getUser(doctorEmail);
        AppAppointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (appt.getDoctorId() == null || !appt.getDoctorId().equals(doctor.getId()))
            throw new IllegalArgumentException("Access denied");
        appt.setStatus("COMPLETED");
        return toApptResponse(appointmentRepository.save(appt));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Transactional
    DoctorProfile getOrCreateProfile(UUID userId) {
        profileRepository.insertIfAbsent(userId);
        return profileRepository.findByUserId(userId).orElseThrow();
    }

    private DoctorProfileResponse toProfileResponse(User user, DoctorProfile p) {
        return DoctorProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .lastName(user.getLastName()   != null ? user.getLastName()  : "")
                .role(user.getRole().name())
                .profileId(p != null ? p.getId() : null)
                .specialization(p != null ? p.getSpecialization() : null)
                .licenseNumber(p != null ? p.getLicenseNumber() : null)
                .bio(p != null ? p.getBio() : null)
                .yearsExperience(p != null ? p.getYearsExperience() : null)
                .consultationFee(p != null ? p.getConsultationFee() : null)
                .profileImageUrl(p != null ? p.getProfileImageUrl() : null)
                .isAvailable(p != null ? p.isAvailable() : null)
                .build();
    }

    private DoctorAppointmentResponse toApptResponse(AppAppointment a) {
        String patientName = "", patientEmail = "";
        try {
            User patient = userRepository.findById(a.getPatientId()).orElse(null);
            if (patient != null) {
                patientName  = (patient.getFirstName() + " " + patient.getLastName()).trim();
                patientEmail = patient.getEmail();
            }
        } catch (Exception ignored) {}

        return DoctorAppointmentResponse.builder()
                .id(a.getId())
                .patientName(patientName.isEmpty() ? patientEmail : patientName)
                .patientEmail(patientEmail)
                .appointmentDate(a.getAppointmentDate().format(DATE_FMT))
                .startTime(a.getStartTime().format(TIME_FMT))
                .consultationType(a.getConsultationType())
                .status(a.getStatus())
                .reason(a.getReason())
                .canJoin(a.isCanJoin())
                .build();
    }
}
