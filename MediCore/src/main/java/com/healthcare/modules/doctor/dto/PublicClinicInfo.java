package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PublicClinicInfo {
    private UUID id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String phone;
    private boolean isPrimary;
    private Double distanceKm;
    private List<ConsultationTypeEntry> consultationTypes;
}
