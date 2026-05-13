package com.healthcare.modules.doctor.repository;

import com.healthcare.modules.doctor.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUserId(UUID userId);

    List<DoctorProfile> findBySpecializationIgnoreCase(String specialization);

    List<DoctorProfile> findByIsAvailableTrue();

    // Atomic insert — does nothing if a row for this user already exists.
    // Eliminates the check-then-insert race that causes duplicate-key errors
    // when multiple requests arrive before any profile row is committed.
    @Modifying
    @Query(value = """
            INSERT INTO app_doctor_profiles
                (id, user_id, years_experience, is_available, created_at, updated_at)
            VALUES
                (gen_random_uuid(), :userId, 0, true, NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING
            """, nativeQuery = true)
    void insertIfAbsent(@Param("userId") UUID userId);
}
