package com.healthcare.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AuthResponse {
    private UUID userId;
    private String email;
    private String role;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
}
