package com.healthcare.modules.doctor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class GenerateSlotsRequest {
    @NotNull
    private LocalDate fromDate;

    @NotNull
    private LocalDate toDate;

    /** Optional: restrict generation to a specific clinic */
    private UUID clinicId;
}
