package com.healthcare.modules.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EligibleDoctorDTO {
    private UUID profileId;
    private String firstName;
    private String lastName;
    private String specialization;
}
