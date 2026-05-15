package com.healthcare.modules.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PaymentSummaryDto {
    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private String patientEmail;
    private long amountRupees;
    private String currency;
    private String status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String createdAt;
}
