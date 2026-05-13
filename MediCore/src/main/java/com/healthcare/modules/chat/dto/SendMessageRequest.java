package com.healthcare.modules.chat.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SendMessageRequest {
    private UUID conversationId;
    private String content;
}
