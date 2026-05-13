package com.healthcare.modules.report.repository;

import com.healthcare.modules.report.entity.AppMedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<AppMedicalRecord, UUID> {
    List<AppMedicalRecord> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
}
