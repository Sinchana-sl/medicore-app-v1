package com.healthcare.modules.doctor;

import com.healthcare.modules.clinic.NearbyClinicService;
import com.healthcare.modules.doctor.dto.PublicDoctorResponse;
import com.healthcare.modules.doctor.dto.SlotResponse;
import com.healthcare.modules.doctor.dto.UnifiedSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/public/doctors")
@RequiredArgsConstructor
public class PublicDoctorController {

    private final DoctorAvailabilityService availabilityService;
    private final DoctorService doctorService;
    private final NearbyClinicService nearbyClinicService;

    private static final int SEARCH_RADIUS_METERS = 1000; // 1 km

    /**
     * GET /public/doctors/search?specialization=Cardiology&lat=12.97&lon=77.59&location=Koramangala
     *
     * Unified endpoint: runs the DB doctor search and the real-time Overpass clinic search
     * concurrently and returns both sets of results in one response.
     *
     * When lat+lon are provided (from Nominatim autocomplete), geocoding is skipped.
     * Falls back to text-based location matching when only `location` text is given.
     */
    @GetMapping("/search")
    public ResponseEntity<UnifiedSearchResponse> unifiedSearch(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {

        // Run both searches concurrently
        CompletableFuture<List<PublicDoctorResponse>> doctorsFuture = CompletableFuture.supplyAsync(
                () -> doctorService.searchPublicDoctors(specialization, location, lat, lon));

        final String spec = specialization; // effectively final for lambda capture
        CompletableFuture<List<com.healthcare.modules.clinic.NearbyClinicResponse>> clinicsFuture;
        if (lat != null && lon != null) {
            // Coordinates available — skip Nominatim geocoding
            clinicsFuture = CompletableFuture.supplyAsync(
                    () -> nearbyClinicService.findNearbyByCoords(lat, lon, SEARCH_RADIUS_METERS, spec));
        } else if (location != null && !location.isBlank()) {
            clinicsFuture = CompletableFuture.supplyAsync(
                    () -> nearbyClinicService.findNearby(location, SEARCH_RADIUS_METERS, spec));
        } else {
            clinicsFuture = CompletableFuture.completedFuture(List.of());
        }

        CompletableFuture.allOf(doctorsFuture, clinicsFuture).join();

        return ResponseEntity.ok(UnifiedSearchResponse.builder()
                .registeredDoctors(doctorsFuture.join())
                .nearbyFacilities(clinicsFuture.join())
                .build());
    }

    /**
     * GET /public/doctors?specialization=Cardiology&lat=12.97&lon=77.59
     * Returns only DB-registered doctors. Kept for backward compatibility.
     */
    @GetMapping
    public ResponseEntity<List<PublicDoctorResponse>> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        return ResponseEntity.ok(doctorService.searchPublicDoctors(specialization, location, lat, lon));
    }

    /**
     * GET /public/doctors/{doctorProfileId}/slots?date=2025-05-01
     * Returns all AVAILABLE slots for a specific doctor on a given date.
     */
    @GetMapping("/{doctorProfileId}/slots")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(
            @PathVariable UUID doctorProfileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID clinicId) {
        return ResponseEntity.ok(availabilityService.getPublicAvailableSlots(doctorProfileId, date, clinicId));
    }
}
