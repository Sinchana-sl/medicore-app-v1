package com.healthcare.modules.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMedicalRecordRequest {

    @NotBlank
    private String title;

    private String subtitle;
    private String recordType;
    private String fileUrl;
    private Integer fileSizeKb;
    private String recordedAt;
}
