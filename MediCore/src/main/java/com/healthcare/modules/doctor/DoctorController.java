package com.healthcare.modules.doctor;

import com.healthcare.modules.doctor.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('DOCTOR_ROLE')")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService availabilityService;

    // ── Profile ────────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<DoctorProfileResponse> getProfile(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(doctorService.getProfile(u.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorProfileResponse> upsertProfile(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody DoctorProfileRequest req) {
        return ResponseEntity.ok(doctorService.upsertProfile(u.getUsername(), req));
    }

    // ── Appointments ───────────────────────────────────────────────────────────

    @GetMapping("/appointments/today")
    public ResponseEntity<List<DoctorAppointmentResponse>> getTodaysAppointments(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(doctorService.getTodaysAppointments(u.getUsername()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<DoctorAppointmentResponse>> getAllAppointments(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(doctorService.getAllAppointments(u.getUsername()));
    }

    @PatchMapping("/appointments/{id}/complete")
    public ResponseEntity<DoctorAppointmentResponse> completeAppointment(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.completeAppointment(u.getUsername(), id));
    }

    // ── Clinics ────────────────────────────────────────────────────────────────

    @PostMapping("/clinics")
    public ResponseEntity<ClinicResponse> addClinic(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody ClinicRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(availabilityService.addClinic(u.getUsername(), req));
    }

    @GetMapping("/clinics")
    public ResponseEntity<List<ClinicResponse>> getClinics(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(availabilityService.getClinics(u.getUsername()));
    }

    @PutMapping("/clinics/{id}")
    public ResponseEntity<ClinicResponse> updateClinic(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id,
            @Valid @RequestBody ClinicRequest req) {
        return ResponseEntity.ok(availabilityService.updateClinic(u.getUsername(), id, req));
    }

    @DeleteMapping("/clinics/{id}")
    public ResponseEntity<Void> deleteClinic(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id) {
        availabilityService.deleteClinic(u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Availability ───────────────────────────────────────────────────────────

    @PostMapping("/availability")
    public ResponseEntity<AvailabilityResponse> addAvailability(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody AvailabilityRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(availabilityService.addAvailability(u.getUsername(), req));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilityResponse>> getAvailability(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(availabilityService.getAvailability(u.getUsername()));
    }

    @PutMapping("/availability/{id}")
    public ResponseEntity<AvailabilityResponse> updateAvailability(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id,
            @Valid @RequestBody AvailabilityRequest req) {
        return ResponseEntity.ok(availabilityService.updateAvailability(u.getUsername(), id, req));
    }

    @DeleteMapping("/availability/{id}")
    public ResponseEntity<Void> deleteAvailability(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id) {
        availabilityService.deleteAvailability(u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Slots ──────────────────────────────────────────────────────────────────

    @PostMapping("/slots/generate")
    public ResponseEntity<List<SlotResponse>> generateSlots(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody GenerateSlotsRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(availabilityService.generateSlots(u.getUsername(), req));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotResponse>> getSlots(
            @AuthenticationPrincipal UserDetails u,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(availabilityService.getSlots(u.getUsername(), date));
    }

    @PatchMapping("/slots/{id}/block")
    public ResponseEntity<SlotResponse> blockSlot(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable UUID id) {
        return ResponseEntity.ok(availabilityService.blockSlot(u.getUsername(), id));
    }
}
