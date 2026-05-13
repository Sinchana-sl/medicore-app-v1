package com.healthcare.modules.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "app_clinic_consultation_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClinicConsultationType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "consultation_type", nullable = false, length = 20)
    private String consultationType;   // IN_PERSON | AUDIO | VIDEO

    @Column(name = "fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal fee;
}
