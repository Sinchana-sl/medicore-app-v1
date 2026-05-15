package com.healthcare.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class AdminDoctorDto {
    private UUID profileId;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private Integer yearsExperience;
    private BigDecimal consultationFee;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    @JsonProperty("isActive")
    private boolean isActive;
    private int clinicCount;
    private String createdAt;
}
