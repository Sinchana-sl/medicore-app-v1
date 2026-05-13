package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClinicResponse {
    private UUID id;
    private UUID doctorId;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private Double latitude;
    private Double longitude;
    private boolean isPrimary;
    private List<ConsultationTypeEntry> consultationTypes;
}
