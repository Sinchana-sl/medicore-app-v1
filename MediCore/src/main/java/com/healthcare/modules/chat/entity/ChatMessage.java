package com.healthcare.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "conversation_id", nullable = false) private UUID conversationId;
    @Column(name = "sender_id",       nullable = false) private UUID senderId;
    @Column(name = "sender_role",     nullable = false) private String senderRole;
    @Column(name = "content",         nullable = false) private String content;
    @Column(name = "is_read",         nullable = false) private boolean isRead;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
}
