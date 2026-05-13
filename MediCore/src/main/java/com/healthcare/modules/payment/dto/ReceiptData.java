package com.healthcare.modules.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReceiptData {
    private String receiptNumber;
    private String paymentDate;

    // Patient
    private String patientName;
    private String patientEmail;

    // Appointment
    private String doctorName;
    private String specialty;
    private String clinicName;
    private String appointmentDate;
    private String appointmentTime;
    private String consultationType;

    // Payment
    private String amountFormatted;
    private String currency;
    private String paymentMethod;
    private String appointmentId;
}
