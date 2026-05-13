package com.healthcare.modules.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_appointments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id")
    private UUID doctorId;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "doctor_specialty")
    private String doctorSpecialty;

    @Column(name = "clinic_name")
    private String clinicName;

    @Column(name = "doctor_image_url")
    private String doctorImageUrl;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "consultation_type", nullable = false)
    private String consultationType;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "reason")
    private String reason;

    @Column(name = "notes")
    private String notes;

    @Column(name = "is_for_self", nullable = false)
    private boolean isForSelf = true;

    @Column(name = "patient_name", length = 200)
    private String patientName;

    @Column(name = "patient_phone", length = 20)
    private String patientPhone;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_gender", length = 20)
    private String patientGender;

    @Column(name = "whatsapp_updates", nullable = false)
    private boolean whatsappUpdates = false;

    @Column(name = "can_join", nullable = false)
    private boolean canJoin;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "PENDING";

    @Column(name = "amount_paise")
    private Long amountPaise;

    @Column(name = "doctor_profile_id")
    private UUID doctorProfileId;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "reminder_sent", nullable = false)
    private boolean reminderSent = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
