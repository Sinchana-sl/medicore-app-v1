package com.healthcare.modules.doctor;

import com.healthcare.modules.doctor.dto.*;
import com.healthcare.modules.doctor.entity.DoctorAvailability;
import com.healthcare.modules.doctor.entity.DoctorClinic;
import com.healthcare.modules.doctor.entity.DoctorProfile;
import com.healthcare.modules.doctor.entity.DoctorSlot;
import com.healthcare.modules.doctor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorService doctorService;
    private final DoctorProfileRepository profileRepository;
    private final DoctorClinicRepository clinicRepository;
    private final ClinicConsultationTypeRepository consultationTypeRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorSlotRepository slotRepository;

    // ── Clinics ────────────────────────────────────────────────────────────────

    @Transactional
    public ClinicResponse addClinic(String email, ClinicRequest req) {
        DoctorProfile profile = getProfile(email);
        if (req.isPrimary()) clinicRepository.clearPrimary(profile.getId());

        DoctorClinic clinic = DoctorClinic.builder()
                .doctorId(profile.getId())
                .name(req.getName())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .phone(req.getPhone())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .isPrimary(req.isPrimary())
                .build();
        DoctorClinic saved = clinicRepository.save(clinic);
        saveConsultationTypes(saved.getId(), req);
        return toClinicResponse(saved);
    }

    public List<ClinicResponse> getClinics(String email) {
        DoctorProfile profile = getProfile(email);
        return clinicRepository.findByDoctorIdOrderByIsPrimaryDescNameAsc(profile.getId())
                .stream().map(this::toClinicResponse).collect(Collectors.toList());
    }

    @Transactional
    public ClinicResponse updateClinic(String email, UUID clinicId, ClinicRequest req) {
        DoctorProfile profile = getProfile(email);
        DoctorClinic clinic = clinicRepository.findByIdAndDoctorId(clinicId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Clinic not found: " + clinicId));

        if (req.isPrimary()) clinicRepository.clearPrimary(profile.getId());
        if (req.getName()      != null) clinic.setName(req.getName());
        if (req.getAddress()   != null) clinic.setAddress(req.getAddress());
        if (req.getCity()      != null) clinic.setCity(req.getCity());
        if (req.getState()     != null) clinic.setState(req.getState());
        if (req.getPincode()   != null) clinic.setPincode(req.getPincode());
        if (req.getPhone()     != null) clinic.setPhone(req.getPhone());
        if (req.getLatitude()  != null) clinic.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) clinic.setLongitude(req.getLongitude());
        clinic.setPrimary(req.isPrimary());

        DoctorClinic saved = clinicRepository.save(clinic);
        if (req.getConsultationTypes() != null) {
            consultationTypeRepository.deleteByClinicId(saved.getId());
            saveConsultationTypes(saved.getId(), req);
        }
        return toClinicResponse(saved);
    }

    @Transactional
    public void deleteClinic(String email, UUID clinicId) {
        DoctorProfile profile = getProfile(email);
        DoctorClinic clinic = clinicRepository.findByIdAndDoctorId(clinicId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Clinic not found: " + clinicId));
        clinicRepository.delete(clinic);
    }

    // ── Availability ───────────────────────────────────────────────────────────

    @Transactional
    public AvailabilityResponse addAvailability(String email, AvailabilityRequest req) {
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new IllegalArgumentException("end_time must be after start_time");
        }
        DoctorProfile profile = getProfile(email);

        // Upsert: only treat as an update when the SAME clinic already has a rule at this
        // (doctor, clinic, day, startTime). A different clinic at the same time is a conflict,
        // not an update target — so clinicId is part of the lookup key.
        Optional<DoctorAvailability> existing = availabilityRepository
                .findByDoctorIdAndClinicIdAndDayOfWeekAndStartTime(
                        profile.getId(), req.getClinicId(), req.getDayOfWeek(), req.getStartTime());
        UUID excludeId = existing.map(DoctorAvailability::getId).orElse(null);

        // Conflict detection: reject if any OTHER rule on the same day overlaps the requested window
        List<DoctorAvailability> conflicts = availabilityRepository.findOverlapping(
                profile.getId(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), excludeId);

        if (!conflicts.isEmpty()) {
            DoctorAvailability conflict = conflicts.get(0);
            String where = conflict.getClinicId() != null
                    ? clinicRepository.findById(conflict.getClinicId())
                            .map(c -> "\"" + c.getName() + "\"")
                            .orElse("another clinic")
                    : "another schedule";
            String dayName = DayOfWeek.of(req.getDayOfWeek() == 0 ? 7 : req.getDayOfWeek())
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            throw new IllegalStateException(String.format(
                    "Schedule conflict on %s: %s–%s overlaps with an existing block at %s (%s–%s). "
                    + "Please choose a different time.",
                    dayName,
                    req.getStartTime(), req.getEndTime(),
                    where,
                    conflict.getStartTime(), conflict.getEndTime()));
        }

        DoctorAvailability rule = existing.orElseGet(() -> DoctorAvailability.builder()
                .doctorId(profile.getId())
                .clinicId(req.getClinicId())
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .build());

        rule.setClinicId(req.getClinicId());
        rule.setEndTime(req.getEndTime());
        rule.setSlotDurationMinutes(req.getSlotDurationMinutes());
        rule.setActive(true);
        return toAvailabilityResponse(availabilityRepository.save(rule));
    }

    public List<AvailabilityResponse> getAvailability(String email) {
        DoctorProfile profile = getProfile(email);
        return availabilityRepository
                .findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(profile.getId())
                .stream().map(this::toAvailabilityResponse).collect(Collectors.toList());
    }

    @Transactional
    public AvailabilityResponse updateAvailability(String email, UUID ruleId, AvailabilityRequest req) {
        DoctorProfile profile = getProfile(email);
        DoctorAvailability rule = availabilityRepository.findByIdAndDoctorId(ruleId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Availability rule not found: " + ruleId));

        if (req.getDayOfWeek()          != null) rule.setDayOfWeek(req.getDayOfWeek());
        if (req.getStartTime()          != null) rule.setStartTime(req.getStartTime());
        if (req.getEndTime()            != null) rule.setEndTime(req.getEndTime());
        if (req.getSlotDurationMinutes() > 0)    rule.setSlotDurationMinutes(req.getSlotDurationMinutes());
        if (req.getClinicId()           != null) rule.setClinicId(req.getClinicId());

        if (!rule.getEndTime().isAfter(rule.getStartTime())) {
            throw new IllegalArgumentException("end_time must be after start_time");
        }
        return toAvailabilityResponse(availabilityRepository.save(rule));
    }

    @Transactional
    public void deleteAvailability(String email, UUID ruleId) {
        DoctorProfile profile = getProfile(email);
        DoctorAvailability rule = availabilityRepository.findByIdAndDoctorId(ruleId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Availability rule not found: " + ruleId));
        availabilityRepository.delete(rule);
    }

    // ── Slot Generation ────────────────────────────────────────────────────────

    @Transactional
    public List<SlotResponse> generateSlots(String email, GenerateSlotsRequest req) {
        if (req.getToDate().isBefore(req.getFromDate())) {
            throw new IllegalArgumentException("to_date must not be before from_date");
        }
        DoctorProfile profile = getProfile(email);

        List<DoctorSlot> created = new ArrayList<>();
        LocalDate cursor = req.getFromDate();

        while (!cursor.isAfter(req.getToDate())) {
            int dow = cursor.getDayOfWeek().getValue() % 7; // Java: Mon=1…Sun=7 → convert Sun=0,Mon=1…Sat=6
            List<DoctorAvailability> rules =
                    availabilityRepository.findByDoctorIdAndDayOfWeekAndIsActiveTrue(profile.getId(), dow);

            for (DoctorAvailability rule : rules) {
                if (req.getClinicId() != null && !req.getClinicId().equals(rule.getClinicId())) continue;

                LocalTime slot = rule.getStartTime();
                while (slot.plusMinutes(rule.getSlotDurationMinutes()).compareTo(rule.getEndTime()) <= 0) {
                    LocalTime slotEnd = slot.plusMinutes(rule.getSlotDurationMinutes());
                    if (!slotRepository.existsByDoctorIdAndSlotDateAndStartTime(profile.getId(), cursor, slot)) {
                        DoctorSlot newSlot = DoctorSlot.builder()
                                .doctorId(profile.getId())
                                .clinicId(rule.getClinicId())
                                .availabilityId(rule.getId())
                                .slotDate(cursor)
                                .startTime(slot)
                                .endTime(slotEnd)
                                .status("AVAILABLE")
                                .build();
                        created.add(slotRepository.save(newSlot));
                    }
                    slot = slotEnd;
                }
            }
            cursor = cursor.plusDays(1);
        }

        return created.stream().map(s -> toSlotResponse(s, null)).collect(Collectors.toList());
    }

    public List<SlotResponse> getSlots(String email, LocalDate date) {
        DoctorProfile profile = getProfile(email);
        Map<UUID, String> clinicNames = buildClinicNameMap(profile.getId());
        return slotRepository.findByDoctorIdAndSlotDateOrderByStartTimeAsc(profile.getId(), date)
                .stream().map(s -> toSlotResponse(s, clinicNames.get(s.getClinicId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public SlotResponse blockSlot(String email, UUID slotId) {
        DoctorProfile profile = getProfile(email);
        DoctorSlot slot = slotRepository.findByIdAndDoctorId(slotId, profile.getId())
                .orElseThrow(() -> new IllegalArgumentException("Slot not found: " + slotId));
        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new IllegalStateException("Only AVAILABLE slots can be blocked");
        }
        slot.setStatus("BLOCKED");
        slotRepository.save(slot);
        return toSlotResponse(slot, null);
    }

    // ── Public ─────────────────────────────────────────────────────────────────

    public List<SlotResponse> getPublicAvailableSlots(UUID doctorProfileId, LocalDate date, UUID clinicId) {
        Map<UUID, String> clinicNames = buildClinicNameMap(doctorProfileId);

        // Use pre-generated persisted slots when available
        List<DoctorSlot> persisted = clinicId != null
                ? slotRepository.findByDoctorIdAndClinicIdAndSlotDateAndStatusOrderByStartTimeAsc(doctorProfileId, clinicId, date, "AVAILABLE")
                : slotRepository.findByDoctorIdAndSlotDateAndStatusOrderByStartTimeAsc(doctorProfileId, date, "AVAILABLE");

        if (!persisted.isEmpty()) {
            return persisted.stream()
                    .map(s -> toSlotResponse(s, clinicNames.get(s.getClinicId())))
                    .collect(Collectors.toList());
        }

        // No persisted slots: derive them on-the-fly from the weekly availability rules.
        // Java DayOfWeek: Mon=1…Sun=7; our scheme: Sun=0, Mon=1…Sat=6
        int dow = date.getDayOfWeek().getValue() % 7;
        List<DoctorAvailability> rules =
                availabilityRepository.findByDoctorIdAndDayOfWeekAndIsActiveTrue(doctorProfileId, dow);

        List<SlotResponse> virtual = new ArrayList<>();
        for (DoctorAvailability rule : rules) {
            if (clinicId != null && !clinicId.equals(rule.getClinicId())) continue;
            LocalTime cursor = rule.getStartTime();
            while (cursor.plusMinutes(rule.getSlotDurationMinutes())
                         .compareTo(rule.getEndTime()) <= 0) {
                LocalTime slotEnd = cursor.plusMinutes(rule.getSlotDurationMinutes());
                virtual.add(SlotResponse.builder()
                        .id(UUID.randomUUID())      // transient id — not stored in DB
                        .doctorId(doctorProfileId)
                        .clinicId(rule.getClinicId())
                        .clinicName(clinicNames.get(rule.getClinicId()))
                        .slotDate(date)
                        .startTime(cursor)
                        .endTime(slotEnd)
                        .status("AVAILABLE")
                        .build());
                cursor = slotEnd;
            }
        }
        return virtual;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private DoctorProfile getProfile(String email) {
        var user = doctorService.getUser(email);
        return doctorService.getOrCreateProfile(user.getId());
    }

    private Map<UUID, String> buildClinicNameMap(UUID doctorProfileId) {
        return clinicRepository.findByDoctorIdOrderByIsPrimaryDescNameAsc(doctorProfileId)
                .stream().collect(Collectors.toMap(DoctorClinic::getId, DoctorClinic::getName));
    }

    private ClinicResponse toClinicResponse(DoctorClinic c) {
        List<ConsultationTypeEntry> types = consultationTypeRepository.findByClinicId(c.getId())
                .stream().map(t -> {
                    ConsultationTypeEntry e = new ConsultationTypeEntry();
                    e.setType(t.getConsultationType());
                    e.setFee(t.getFee());
                    return e;
                }).collect(Collectors.toList());

        return ClinicResponse.builder()
                .id(c.getId()).doctorId(c.getDoctorId())
                .name(c.getName()).address(c.getAddress()).city(c.getCity())
                .state(c.getState()).pincode(c.getPincode()).phone(c.getPhone())
                .latitude(c.getLatitude()).longitude(c.getLongitude())
                .isPrimary(c.isPrimary())
                .consultationTypes(types)
                .build();
    }

    private void saveConsultationTypes(UUID clinicId, ClinicRequest req) {
        if (req.getConsultationTypes() == null) return;
        req.getConsultationTypes().forEach(entry ->
                consultationTypeRepository.save(
                        com.healthcare.modules.doctor.entity.ClinicConsultationType.builder()
                                .clinicId(clinicId)
                                .consultationType(entry.getType())
                                .fee(entry.getFee())
                                .build()));
    }

    private AvailabilityResponse toAvailabilityResponse(DoctorAvailability r) {
        String clinicName = r.getClinicId() != null
                ? clinicRepository.findById(r.getClinicId()).map(DoctorClinic::getName).orElse(null)
                : null;
        String dayName = DayOfWeek.of(r.getDayOfWeek() == 0 ? 7 : r.getDayOfWeek())
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return AvailabilityResponse.builder()
                .id(r.getId()).doctorId(r.getDoctorId()).clinicId(r.getClinicId())
                .clinicName(clinicName).dayOfWeek(r.getDayOfWeek()).dayName(dayName)
                .startTime(r.getStartTime()).endTime(r.getEndTime())
                .slotDurationMinutes(r.getSlotDurationMinutes()).isActive(r.isActive())
                .build();
    }

    private SlotResponse toSlotResponse(DoctorSlot s, String clinicName) {
        return SlotResponse.builder()
                .id(s.getId()).doctorId(s.getDoctorId()).clinicId(s.getClinicId())
                .clinicName(clinicName).slotDate(s.getSlotDate())
                .startTime(s.getStartTime()).endTime(s.getEndTime())
                .status(s.getStatus()).build();
    }
}
