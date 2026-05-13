package com.healthcare.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "chat_conversations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatConversation {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false) private UUID patientId;
    @Column(name = "doctor_id",  nullable = false) private UUID doctorId;
    @Column(name = "doctor_profile_id")            private UUID doctorProfileId;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at") private OffsetDateTime updatedAt;

    @Column(name = "last_message") private String lastMessage;
    @Column(name = "last_message_at") private OffsetDateTime lastMessageAt;
}
