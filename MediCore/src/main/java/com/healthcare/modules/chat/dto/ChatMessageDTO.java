package com.healthcare.modules.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class ChatMessageDTO {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderRole;
    private String content;
    private boolean isRead;
    private OffsetDateTime createdAt;
}
