package com.healthcare.modules.clinic;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET /public/nearby-clinics?location=Bangalore&radius=5000
 *
 * Query params:
 *   location  (required) — city / area name entered by the user
 *   radius    (optional, default 5000) — search radius in metres (max sensible: 20000)
 *
 * Internally calls:
 *   1. Nominatim  → geocodes location string to lat/lon
 *   2. Overpass   → finds hospitals + clinics within radius
 *
 * Returns up to 20 results sorted by distance (closest first).
 */
@RestController
@RequestMapping("/public/nearby-clinics")
@RequiredArgsConstructor
public class NearbyClinicController {

    private final NearbyClinicService nearbyClinicService;

    @GetMapping
    public ResponseEntity<List<NearbyClinicResponse>> findNearby(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "5000") int radius,
            @RequestParam(required = false) String specialization) {

        int safeRadius = Math.min(Math.max(radius, 500), 20_000);

        if (lat != null && lon != null) {
            return ResponseEntity.ok(nearbyClinicService.findNearbyByCoords(lat, lon, safeRadius, specialization));
        }
        if (location != null && !location.isBlank()) {
            return ResponseEntity.ok(nearbyClinicService.findNearby(location, safeRadius, specialization));
        }
        return ResponseEntity.badRequest().build();
    }
}
