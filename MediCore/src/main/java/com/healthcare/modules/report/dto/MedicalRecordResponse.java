package com.healthcare.modules.report.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class MedicalRecordResponse {
    private UUID id;
    private String title;
    private String subtitle;
    private String recordType;
    private String status;
    private String fileUrl;
    private String recordedAt;
}
