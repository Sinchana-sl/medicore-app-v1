package com.healthcare.modules.doctor.repository;

import com.healthcare.modules.doctor.entity.ClinicConsultationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClinicConsultationTypeRepository extends JpaRepository<ClinicConsultationType, UUID> {
    List<ClinicConsultationType> findByClinicId(UUID clinicId);

    // Bulk DELETE — forces the DELETE to be sent to the DB immediately and clears
    // the persistence context so subsequent inserts don't collide with cached state.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ClinicConsultationType c WHERE c.clinicId = :clinicId")
    void deleteByClinicId(@Param("clinicId") UUID clinicId);
}
