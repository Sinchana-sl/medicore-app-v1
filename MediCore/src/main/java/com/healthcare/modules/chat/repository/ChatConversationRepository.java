package com.healthcare.modules.chat.repository;

import com.healthcare.modules.chat.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {
    List<ChatConversation> findByPatientIdOrderByUpdatedAtDesc(UUID patientId);
    List<ChatConversation> findByDoctorIdOrderByUpdatedAtDesc(UUID doctorId);
    Optional<ChatConversation> findByPatientIdAndDoctorId(UUID patientId, UUID doctorId);
}
