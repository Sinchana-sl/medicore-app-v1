package com.healthcare.modules.doctor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
public class AvailabilityRequest {
    private UUID clinicId;

    /** 0 = Sunday, 1 = Monday … 6 = Saturday */
    @NotNull @Min(0) @Max(6)
    private Integer dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @Min(10)
    private int slotDurationMinutes = 30;
}
