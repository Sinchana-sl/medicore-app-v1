package com.healthcare.modules.payment.controller;

import com.healthcare.modules.payment.dto.*;
import com.healthcare.modules.payment.dto.SimulatePaymentRequest;
import com.healthcare.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(user.getUsername(), request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verify(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyAndConfirm(user.getUsername(), request));
    }

    @PostMapping("/simulate")
    public ResponseEntity<PaymentResponse> simulate(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody SimulatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.simulateSuccess(user.getUsername(), request));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<PaymentResponse> getByAppointment(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointment(user.getUsername(), appointmentId));
    }
}
