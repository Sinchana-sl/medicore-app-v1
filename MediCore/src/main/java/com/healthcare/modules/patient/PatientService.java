package com.healthcare.modules.patient;

import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.patient.dto.PatientProfileResponse;
import com.healthcare.modules.patient.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;

    public PatientProfileResponse getProfile(String email) {
        return toResponse(getUser(email));
    }

    @Transactional
    public PatientProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);
        if (request.getFirstName() != null)  user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)   user.setLastName(request.getLastName());
        if (request.getPhone() != null)      user.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)     user.setGender(request.getGender());
        if (request.getBloodType() != null)  user.setBloodType(request.getBloodType());
        userRepository.save(user);
        return toResponse(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private static final DateTimeFormatter MEMBER_FMT = DateTimeFormatter.ofPattern("MMMM yyyy");

    private PatientProfileResponse toResponse(User user) {
        String memberSince = user.getCreatedAt() != null
                ? user.getCreatedAt().format(MEMBER_FMT)
                : null;
        return PatientProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .lastName(user.getLastName() != null ? user.getLastName() : "")
                .role(user.getRole().name())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .bloodType(user.getBloodType())
                .memberSince(memberSince)
                .build();
    }
}
