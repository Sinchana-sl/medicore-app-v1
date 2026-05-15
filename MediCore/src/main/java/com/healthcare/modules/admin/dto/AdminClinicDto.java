package com.healthcare.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AdminClinicDto {
    private UUID id;
    private UUID doctorId;
    private String doctorName;
    private String doctorEmail;
    private String specialization;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    @JsonProperty("isPrimary")
    private boolean isPrimary;
    private String createdAt;
}
