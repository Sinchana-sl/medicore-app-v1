package com.healthcare.modules.payment.repository;

import com.healthcare.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findTopByAppointmentIdOrderByCreatedAtDesc(UUID appointmentId);
    List<Payment> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(p.amountPaise), 0) FROM Payment p WHERE p.status = 'captured'")
    Long sumCapturedAmountPaise();
}
