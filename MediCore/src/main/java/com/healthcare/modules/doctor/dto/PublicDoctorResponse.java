package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PublicDoctorResponse {
    private UUID profileId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String bio;
    private Integer yearsExperience;
    private BigDecimal consultationFee;
    private Boolean isAvailable;
    // Primary clinic fields kept for backward compat
    private String clinicName;
    private String clinicCity;
    private Double distanceKm;
    // Full list of all clinics with consultation types and distances
    private List<PublicClinicInfo> clinics;
}
