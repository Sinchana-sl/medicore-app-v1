package com.healthcare.modules.auth.repository;

import com.healthcare.modules.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<OtpToken, UUID> {

    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.purpose = :purpose AND o.used = false ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpToken> findLatestUnused(String email, String purpose);

    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email AND o.purpose = :purpose AND o.used = false")
    void invalidateAllForEmail(String email, String purpose);
}
