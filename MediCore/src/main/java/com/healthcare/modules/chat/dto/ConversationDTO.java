package com.healthcare.modules.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class ConversationDTO {
    private UUID id;
    private UUID otherUserId;
    private String otherUserName;
    private String otherUserRole;
    private UUID doctorProfileId;
    private String lastMessage;
    private OffsetDateTime lastMessageAt;
    private long unreadCount;
    private OffsetDateTime createdAt;
}
