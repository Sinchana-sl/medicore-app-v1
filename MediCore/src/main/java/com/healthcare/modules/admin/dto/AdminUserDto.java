package com.healthcare.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AdminUserDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String phone;
    @JsonProperty("isActive")
    private boolean isActive;
    private String createdAt;
}
