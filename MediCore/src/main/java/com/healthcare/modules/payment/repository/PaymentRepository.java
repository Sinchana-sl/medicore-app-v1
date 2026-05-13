package com.healthcare.modules.payment.repository;

import com.healthcare.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findTopByAppointmentIdOrderByCreatedAtDesc(UUID appointmentId);
}
