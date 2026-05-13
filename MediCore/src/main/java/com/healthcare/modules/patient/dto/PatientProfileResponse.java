package com.healthcare.modules.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class PatientProfileResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String memberSince;
}
