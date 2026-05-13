package com.healthcare.modules.doctor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ClinicRequest {
    @NotBlank
    private String name;

    @NotBlank(message = "Street address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;
    private String pincode;
    private String phone;
    private Double latitude;
    private Double longitude;
    private boolean isPrimary = false;

    @NotEmpty(message = "At least one consultation type with fee is required")
    @Valid
    private List<ConsultationTypeEntry> consultationTypes;
}
