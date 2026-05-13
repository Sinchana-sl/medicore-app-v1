package com.healthcare.modules.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Long amountPaise;
    private String currency;
    private String status;
    private UUID appointmentId;
}
