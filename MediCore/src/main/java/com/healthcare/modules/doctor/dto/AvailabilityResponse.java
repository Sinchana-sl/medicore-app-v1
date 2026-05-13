package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class AvailabilityResponse {
    private UUID id;
    private UUID doctorId;
    private UUID clinicId;
    private String clinicName;
    private int dayOfWeek;
    private String dayName;
    private LocalTime startTime;
    private LocalTime endTime;
    private int slotDurationMinutes;
    private boolean isActive;
}
