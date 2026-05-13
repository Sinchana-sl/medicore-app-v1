package com.healthcare.modules.doctor.repository;

import com.healthcare.modules.doctor.entity.DoctorClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorClinicRepository extends JpaRepository<DoctorClinic, UUID> {
    List<DoctorClinic> findByDoctorIdOrderByIsPrimaryDescNameAsc(UUID doctorId);
    Optional<DoctorClinic> findByIdAndDoctorId(UUID id, UUID doctorId);

    List<DoctorClinic> findByDoctorIdIn(List<UUID> doctorIds);

    @Query("SELECT c FROM DoctorClinic c WHERE " +
           "LOWER(c.city)    LIKE LOWER(CONCAT('%', :loc, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :loc, '%')) OR " +
           "LOWER(c.state)   LIKE LOWER(CONCAT('%', :loc, '%'))")
    List<DoctorClinic> findByLocation(@Param("loc") String loc);

    @Query("SELECT DISTINCT c.doctorId FROM DoctorClinic c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<UUID> findDoctorIdsByClinicNameKeyword(@Param("keyword") String keyword);

    @Modifying
    @Query("UPDATE DoctorClinic c SET c.isPrimary = false WHERE c.doctorId = :doctorId")
    void clearPrimary(@Param("doctorId") UUID doctorId);
}
