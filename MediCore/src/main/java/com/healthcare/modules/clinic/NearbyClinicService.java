package com.healthcare.modules.clinic;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class NearbyClinicService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT       = "MediCore/1.0 (healthcare-booking-app)";

    // Maps DB specialization values to OSM healthcare:speciality tag values + name keywords.
    // Multiple aliases per specialty because OSM tagging is inconsistent.
    private static final Map<String, List<String>> SPEC_KEYWORDS = Map.ofEntries(
        Map.entry("Cardiology",       List.of("cardiology", "cardiac", "heart")),
        Map.entry("Dermatology",      List.of("dermatology", "dermatolog", "skin")),
        Map.entry("General Practice", List.of("general", "family", "gp", "primary care")),
        Map.entry("Neurology",        List.of("neurology", "neuroscience", "neuro")),
        Map.entry("Oncology",         List.of("oncology", "cancer")),
        Map.entry("Orthopedics",      List.of("orthopedic", "orthopaedic", "bone", "joint")),
        Map.entry("Pediatrics",       List.of("pediatric", "paediatric", "children", "child")),
        Map.entry("Psychiatry",       List.of("psychiatry", "psychiatric", "mental health", "mental")),
        Map.entry("Radiology",        List.of("radiology", "radiolog", "imaging", "diagnostic")),
        Map.entry("Surgery",          List.of("surgery", "surgical", "surgeon"))
    );

    private static final String[] OVERPASS_MIRRORS = {
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass-api.de/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    };

    /**
     * 1. Geocode `location` (city name) → lat/lon via Nominatim.
     * 2. Query Overpass API for hospitals + clinics within `radiusMeters`.
     * 3. Filter by `specialization` (null = return all).
     * 4. Return results sorted by distance, capped at 20.
     */
    public List<NearbyClinicResponse> findNearby(String location, int radiusMeters, String specialization) {
        try {
            double[] coords = geocode(location);
            if (coords == null) return List.of();
            return findNearbyByCoords(coords[0], coords[1], radiusMeters, specialization);
        } catch (Exception e) {
            log.warn("NearbyClinicService error for location={}: {}", location, e.getMessage());
            return List.of();
        }
    }

    /** Backward-compat overload (no specialization filter). */
    public List<NearbyClinicResponse> findNearby(String location, int radiusMeters) {
        return findNearby(location, radiusMeters, null);
    }

    /**
     * Skip geocoding — query Overpass directly with known coordinates.
     * When `specialization` is non-null, only facilities whose name or
     * healthcare:speciality tag match the specialization are returned.
     * Hospitals (amenity=hospital) are always included as they cover all specialties.
     */
    public List<NearbyClinicResponse> findNearbyByCoords(double lat, double lon, int radiusMeters, String specialization) {
        try {
            String query = overpassQuery(lat, lon, radiusMeters);
            return callOverpass(query, lat, lon, specialization);
        } catch (Exception e) {
            log.warn("NearbyClinicService error for coords={},{}: {}", lat, lon, e.getMessage());
            return List.of();
        }
    }

    /** Backward-compat overload (no specialization filter). */
    public List<NearbyClinicResponse> findNearbyByCoords(double lat, double lon, int radiusMeters) {
        return findNearbyByCoords(lat, lon, radiusMeters, null);
    }

    // ── Nominatim geocoding ────────────────────────────────────────────────────

    private double[] geocode(String location) throws Exception {
        String url = NOMINATIM_SEARCH
                + "?q=" + URLEncoder.encode(location, StandardCharsets.UTF_8)
                + "&format=json&limit=1";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", USER_AGENT);
        headers.set("Accept-Language", "en");

        ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

        JsonNode arr = objectMapper.readTree(resp.getBody());
        if (arr == null || arr.isEmpty()) return null;

        JsonNode first = arr.get(0);
        return new double[]{ first.get("lat").asDouble(), first.get("lon").asDouble() };
    }

    // ── Overpass QL query ──────────────────────────────────────────────────────

    private String overpassQuery(double lat, double lon, int radius) {
        return String.format(Locale.US,
                "[out:json][timeout:25];\n" +
                "(\n" +
                "  node[\"amenity\"=\"hospital\"](around:%d,%.6f,%.6f);\n" +
                "  way[\"amenity\"=\"hospital\"](around:%d,%.6f,%.6f);\n" +
                "  node[\"amenity\"=\"clinic\"](around:%d,%.6f,%.6f);\n" +
                "  way[\"amenity\"=\"clinic\"](around:%d,%.6f,%.6f);\n" +
                "  node[\"healthcare\"=\"doctor\"](around:%d,%.6f,%.6f);\n" +
                "  way[\"healthcare\"=\"doctor\"](around:%d,%.6f,%.6f);\n" +
                ");\n" +
                "out center tags;",
                radius, lat, lon,
                radius, lat, lon,
                radius, lat, lon,
                radius, lat, lon,
                radius, lat, lon,
                radius, lat, lon
        );
    }

    // ── Call Overpass with mirror fallback ─────────────────────────────────────

    private List<NearbyClinicResponse> callOverpass(String query, double refLat, double refLon, String specialization) throws Exception {
        String body = "data=" + URLEncoder.encode(query, StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("User-Agent", USER_AGENT);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        Exception lastEx = null;
        for (String mirror : OVERPASS_MIRRORS) {
            try {
                ResponseEntity<String> resp = restTemplate.postForEntity(mirror, entity, String.class);
                return parseElements(objectMapper.readTree(resp.getBody()), refLat, refLon, specialization);
            } catch (Exception e) {
                log.warn("Overpass mirror {} failed: {}", mirror, e.getMessage());
                lastEx = e;
            }
        }
        throw lastEx != null ? lastEx : new RuntimeException("All Overpass mirrors failed");
    }

    private List<NearbyClinicResponse> parseElements(JsonNode root, double refLat, double refLon, String specialization) {
        JsonNode elements = root.path("elements");
        List<NearbyClinicResponse> results = new ArrayList<>();

        // Pre-compute lower-cased keyword list for the requested specialization (null = no filter)
        List<String> keywords = specialization != null
                ? SPEC_KEYWORDS.getOrDefault(specialization,
                        List.of(specialization.toLowerCase(Locale.ENGLISH)))
                : null;

        for (JsonNode el : elements) {
            JsonNode tags = el.path("tags");
            String name = tags.path("name").asText(null);
            if (name == null || name.isBlank()) continue;

            double eLat, eLon;
            if ("way".equals(el.path("type").asText()) && el.has("center")) {
                eLat = el.path("center").path("lat").asDouble(Double.NaN);
                eLon = el.path("center").path("lon").asDouble(Double.NaN);
            } else {
                eLat = el.path("lat").asDouble(Double.NaN);
                eLon = el.path("lon").asDouble(Double.NaN);
            }
            if (Double.isNaN(eLat) || Double.isNaN(eLon)) continue;

            String amenity = tags.path("amenity").asText(null);
            String healthcare = tags.path("healthcare").asText(null);
            String osmSpeciality = tags.path("healthcare:speciality").asText(null);
            String address = buildAddress(tags);
            String type = amenity != null ? amenity : (healthcare != null ? healthcare : "clinic");

            // ── Specialization filter ──
            // Hospitals always match (they cover all specialties).
            // For clinics/doctor offices: match if name or OSM speciality tag contains a keyword.
            if (keywords != null && !"hospital".equalsIgnoreCase(amenity)) {
                String searchTarget = Stream.of(name, osmSpeciality)
                        .filter(Objects::nonNull)
                        .map(s -> s.toLowerCase(Locale.ENGLISH))
                        .collect(java.util.stream.Collectors.joining(" "));
                boolean matches = keywords.stream().anyMatch(searchTarget::contains);
                if (!matches) continue;
            }

            results.add(NearbyClinicResponse.builder()
                    .osmId(el.path("id").asLong())
                    .name(name)
                    .type(type)
                    .address(address.isBlank() ? null : address)
                    .phone(tags.path("phone").asText(null))
                    .website(tags.path("website").asText(null))
                    .openingHours(tags.path("opening_hours").asText(null))
                    .lat(eLat)
                    .lon(eLon)
                    .distanceKm(haversineKm(refLat, refLon, eLat, eLon))
                    .build());
        }

        results.sort(Comparator.comparingDouble(NearbyClinicResponse::getDistanceKm));
        return results.stream().limit(20).toList();
    }

    private String buildAddress(JsonNode tags) {
        List<String> parts = new ArrayList<>();
        if (tags.has("addr:street"))      parts.add(tags.get("addr:street").asText());
        if (tags.has("addr:housenumber")) parts.add(0, tags.get("addr:housenumber").asText());
        if (tags.has("addr:city"))        parts.add(tags.get("addr:city").asText());
        if (tags.has("addr:state"))       parts.add(tags.get("addr:state").asText());
        return String.join(", ", parts);
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
