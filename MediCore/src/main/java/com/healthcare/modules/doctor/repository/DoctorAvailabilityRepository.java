package com.healthcare.modules.doctor.repository;

import com.healthcare.modules.doctor.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(UUID doctorId);
    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndIsActiveTrue(UUID doctorId, int dayOfWeek);
    Optional<DoctorAvailability> findByIdAndDoctorId(UUID id, UUID doctorId);
    Optional<DoctorAvailability> findByDoctorIdAndDayOfWeekAndStartTime(UUID doctorId, int dayOfWeek, LocalTime startTime);
    Optional<DoctorAvailability> findByDoctorIdAndClinicIdAndDayOfWeekAndStartTime(UUID doctorId, UUID clinicId, int dayOfWeek, LocalTime startTime);

    /**
     * Returns all rules for this doctor on the given day whose time range overlaps [startTime, endTime),
     * excluding the rule identified by excludeId (pass null when creating a new rule).
     * Two ranges overlap when: existingStart < newEnd AND existingEnd > newStart.
     */
    @Query("SELECT r FROM DoctorAvailability r " +
           "WHERE r.doctorId = :doctorId " +
           "AND r.dayOfWeek = :day " +
           "AND (:excludeId IS NULL OR r.id <> :excludeId) " +
           "AND r.startTime < :endTime " +
           "AND r.endTime > :startTime")
    List<DoctorAvailability> findOverlapping(
            @Param("doctorId")  UUID      doctorId,
            @Param("day")       int       day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime")   LocalTime endTime,
            @Param("excludeId") UUID      excludeId);
}
