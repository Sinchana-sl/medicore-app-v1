package com.healthcare.modules.chat.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class StartConversationRequest {
    private UUID doctorProfileId;
}
