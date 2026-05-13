package com.healthcare.modules.doctor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorProfileRequest {
    private String firstName;
    private String lastName;
    private String specialization;
    private String licenseNumber;
    private String bio;

    @Min(0)
    private Integer yearsExperience;

    @DecimalMin("0.0")
    private BigDecimal consultationFee;

    private String profileImageUrl;
    private Boolean isAvailable;
}
