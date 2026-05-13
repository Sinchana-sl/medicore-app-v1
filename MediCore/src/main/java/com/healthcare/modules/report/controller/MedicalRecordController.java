package com.healthcare.modules.report.controller;

import com.healthcare.modules.report.dto.CreateMedicalRecordRequest;
import com.healthcare.modules.report.dto.MedicalRecordResponse;
import com.healthcare.modules.report.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponse>> getRecords(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(medicalRecordService.getPatientRecords(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<MedicalRecordResponse> createRecord(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateMedicalRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalRecordService.createRecord(userDetails.getUsername(), request));
    }
}
