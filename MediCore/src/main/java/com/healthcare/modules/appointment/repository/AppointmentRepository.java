package com.healthcare.modules.appointment.repository;

import com.healthcare.modules.appointment.entity.AppAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppAppointment, UUID> {
    List<AppAppointment> findByPatientIdOrderByAppointmentDateAscStartTimeAsc(UUID patientId);

    @Query("SELECT a FROM AppAppointment a WHERE a.doctorId = :doctorId ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<AppAppointment> findByDoctorIdOrderByDateTimeAsc(@Param("doctorId") UUID doctorId);

    @Query("SELECT a FROM AppAppointment a WHERE a.doctorId = :doctorId AND a.appointmentDate = :date ORDER BY a.startTime ASC")
    List<AppAppointment> findByDoctorIdAndDate(@Param("doctorId") UUID doctorId, @Param("date") LocalDate date);

    @Query("SELECT DISTINCT a.doctorProfileId FROM AppAppointment a " +
           "WHERE a.patientId = :patientId " +
           "AND a.consultationType = 'IN_PERSON' " +
           "AND a.status = 'COMPLETED' " +
           "AND a.doctorProfileId IS NOT NULL")
    List<UUID> findInPersonDoctorProfileIds(@Param("patientId") UUID patientId);

    boolean existsByPatientIdAndDoctorProfileIdAndConsultationTypeAndStatus(
            UUID patientId, UUID doctorProfileId, String consultationType, String status);

    @Query("SELECT a FROM AppAppointment a WHERE a.appointmentDate = :today " +
           "AND a.status = 'CONFIRMED' " +
           "AND a.reminderSent = false " +
           "AND a.startTime >= :from AND a.startTime <= :to")
    List<AppAppointment> findAppointmentsNeedingReminder(
            @Param("today") LocalDate today,
            @Param("from") LocalTime from,
            @Param("to") LocalTime to);
}
