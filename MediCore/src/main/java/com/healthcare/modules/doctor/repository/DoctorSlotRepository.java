package com.healthcare.modules.doctor.repository;

import com.healthcare.modules.doctor.entity.DoctorSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, UUID> {
    List<DoctorSlot> findByDoctorIdAndSlotDateOrderByStartTimeAsc(UUID doctorId, LocalDate date);
    List<DoctorSlot> findByDoctorIdAndSlotDateAndStatusOrderByStartTimeAsc(UUID doctorId, LocalDate date, String status);
    List<DoctorSlot> findByDoctorIdAndClinicIdAndSlotDateAndStatusOrderByStartTimeAsc(UUID doctorId, UUID clinicId, LocalDate date, String status);
    boolean existsByDoctorIdAndSlotDateAndStartTime(UUID doctorId, LocalDate date, LocalTime startTime);
    Optional<DoctorSlot> findByIdAndDoctorId(UUID id, UUID doctorId);

    Optional<DoctorSlot> findByDoctorIdAndSlotDateAndStartTime(UUID doctorId, LocalDate slotDate, LocalTime startTime);
}
