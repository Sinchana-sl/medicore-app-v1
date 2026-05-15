package com.healthcare.modules.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AdminAppointmentDto {
    private UUID id;
    private UUID patientId;
    private String patientEmail;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String clinicName;
    private String appointmentDate;
    private String startTime;
    private String consultationType;
    private String status;
    private String paymentStatus;
    private Long amountRupees;
    private String reason;
    private String createdAt;
}
