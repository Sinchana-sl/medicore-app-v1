package com.healthcare.modules.clinic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NearbyClinicResponse {
    private Long osmId;
    private String name;
    private String type;         // "hospital" | "clinic"
    private String address;
    private String phone;
    private String website;
    private String openingHours;
    private Double lat;
    private Double lon;
    private Double distanceKm;
}
