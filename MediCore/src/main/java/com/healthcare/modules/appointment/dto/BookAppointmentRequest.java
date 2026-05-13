package com.healthcare.modules.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {

    @NotBlank
    private String doctorName;

    private String doctorSpecialty;
    private String clinicName;
    private String doctorImageUrl;

    @NotNull
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime startTime;

    private String consultationType;
    private String reason;

    private boolean isForSelf = true;
    private String patientName;
    private String patientPhone;
    private Integer patientAge;
    private String patientGender;
    private boolean whatsappUpdates = false;

    private java.util.UUID doctorProfileId;
    private Long amountPaise;
    private java.util.UUID slotId;
}
