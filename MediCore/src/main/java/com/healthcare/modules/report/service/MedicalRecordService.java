package com.healthcare.modules.report.service;

import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.report.dto.CreateMedicalRecordRequest;
import com.healthcare.modules.report.dto.MedicalRecordResponse;
import com.healthcare.modules.report.entity.AppMedicalRecord;
import com.healthcare.modules.report.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public List<MedicalRecordResponse> getPatientRecords(String email) {
        User user = getUser(email);
        return recordRepository.findByPatientIdOrderByRecordedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalRecordResponse createRecord(String email, CreateMedicalRecordRequest request) {
        User user = getUser(email);
        LocalDate recordedAt = request.getRecordedAt() != null
                ? LocalDate.parse(request.getRecordedAt())
                : LocalDate.now();

        AppMedicalRecord record = AppMedicalRecord.builder()
                .patientId(user.getId())
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .recordType(request.getRecordType() != null ? request.getRecordType() : "LAB_RESULT")
                .status("PENDING")
                .fileUrl(request.getFileUrl())
                .fileSizeKb(request.getFileSizeKb())
                .recordedAt(recordedAt)
                .build();

        return toResponse(recordRepository.save(record));
    }

    @Transactional
    public void deleteRecord(String email, UUID recordId) {
        User user = getUser(email);
        AppMedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Record not found"));
        if (!record.getPatientId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        recordRepository.delete(record);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private MedicalRecordResponse toResponse(AppMedicalRecord r) {
        return MedicalRecordResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .subtitle(r.getSubtitle())
                .recordType(r.getRecordType())
                .status(r.getStatus())
                .fileUrl(r.getFileUrl())
                .recordedAt(r.getRecordedAt() != null ? r.getRecordedAt().format(DATE_FMT) : null)
                .build();
    }
}
