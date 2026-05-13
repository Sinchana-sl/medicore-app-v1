package com.healthcare.modules.appointment.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AppointmentResponse {
    private UUID id;
    private String doctorName;
    private String doctorSpecialty;
    private String clinicName;
    private String doctorImageUrl;
    private String appointmentDate;
    private String startTime;
    private String consultationType;
    private String status;
    private String reason;
    private boolean isForSelf;
    private String patientName;
    private boolean whatsappUpdates;
    private boolean canJoin;
    private String patientPhone;
    private String paymentStatus;
    private Long amountPaise;
    private UUID doctorProfileId;
    private String razorpayOrderId;
}
