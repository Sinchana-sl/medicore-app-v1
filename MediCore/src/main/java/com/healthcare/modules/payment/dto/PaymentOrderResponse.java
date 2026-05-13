package com.healthcare.modules.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentOrderResponse {
    private String orderId;
    private Long amountPaise;
    private String currency;
    private String keyId;
    private String appointmentId;
    private String patientName;
    private String patientEmail;
}
