package com.healthcare.modules.doctor.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DoctorAppointmentResponse {
    private UUID id;
    private String patientName;
    private String patientEmail;
    private String appointmentDate;
    private String startTime;
    private String consultationType;
    private String status;
    private String reason;
    private boolean canJoin;
}
