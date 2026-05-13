package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class SlotResponse {
    private UUID id;
    private UUID doctorId;
    private UUID clinicId;
    private String clinicName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
}
