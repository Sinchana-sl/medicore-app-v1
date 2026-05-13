package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class DoctorProfileResponse {
    // from auth_users
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    // from app_doctor_profiles (null if not set up yet)
    private UUID profileId;
    private String specialization;
    private String licenseNumber;
    private String bio;
    private Integer yearsExperience;
    private BigDecimal consultationFee;
    private String profileImageUrl;
    private Boolean isAvailable;
}
