package com.healthcare.modules.auth.service;

import com.healthcare.modules.auth.dto.AuthResponse;
import com.healthcare.modules.auth.dto.LoginRequest;
import com.healthcare.modules.auth.dto.RefreshRequest;
import com.healthcare.modules.auth.dto.RegisterRequest;
import com.healthcare.modules.auth.dto.ResetPasswordRequest;
import com.healthcare.modules.auth.dto.SendOtpRequest;
import com.healthcare.modules.auth.dto.VerifyOtpRequest;
import com.healthcare.modules.auth.entity.OtpToken;
import com.healthcare.modules.auth.entity.RefreshToken;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.enums.Role;
import com.healthcare.modules.auth.repository.OtpRepository;
import com.healthcare.modules.auth.repository.RefreshTokenRepository;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.doctor.entity.DoctorProfile;
import com.healthcare.modules.doctor.repository.DoctorProfileRepository;
import com.healthcare.modules.notifications.EmailService;
import com.healthcare.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpRepository otpRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PURPOSE_LOGIN = "LOGIN";
    private static final String PURPOSE_RESET = "PASSWORD_RESET";

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN_ROLE) {
            throw new IllegalArgumentException("Cannot register as ADMIN");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName()  != null) user.setLastName(request.getLastName());
        userRepository.saveAndFlush(user);

        if (request.getRole() == Role.DOCTOR_ROLE) {
            doctorProfileRepository.insertIfAbsent(user.getId());
            DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId()).orElseThrow();
            if (request.getLicenseNumber()  != null) profile.setLicenseNumber(request.getLicenseNumber());
            if (request.getSpecialization() != null) profile.setSpecialization(request.getSpecialization());
            doctorProfileRepository.save(profile);
        }

        emailService.sendWelcomeEmail(user.getEmail(), user.getRole().name());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        // Check if user exists first
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("User not found: {}", request.getEmail());
                    return new IllegalArgumentException("User not found");
                });
        
        log.info("User found: {}, Active: {}, Role: {}", user.getEmail(), user.isActive(), user.getRole());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            log.info("Authentication successful for: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Authentication failed for: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }

        // revoke all existing refresh tokens on new login
        refreshTokenRepository.revokeAllByUser(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.isValid(token) || !jwtUtil.isRefreshToken(token)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (stored.isRevoked()) {
            // possible token reuse attack — revoke all tokens for this user
            refreshTokenRepository.revokeAllByUser(stored.getUser());
            throw new IllegalArgumentException("Refresh token already used");
        }

        if (stored.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired");
        }

        // rotate: revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken())
                .ifPresent(t -> {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                });
    }

    @Transactional
    public void sendOtp(SendOtpRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for this email"));

        otpRepository.invalidateAllForEmail(request.getEmail(), PURPOSE_LOGIN);
        otpRepository.save(buildOtp(request.getEmail(), PURPOSE_LOGIN));
        emailService.sendOtpEmail(request.getEmail(), peekLastCode(request.getEmail(), PURPOSE_LOGIN));
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpToken otp = findValidOtp(request.getEmail(), request.getCode(), PURPOSE_LOGIN);
        otp.setUsed(true);
        otpRepository.save(otp);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return issueTokens(user);
    }

    @Transactional
    public void sendPasswordResetOtp(SendOtpRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for this email"));

        otpRepository.invalidateAllForEmail(request.getEmail(), PURPOSE_RESET);
        otpRepository.save(buildOtp(request.getEmail(), PURPOSE_RESET));
        emailService.sendPasswordResetOtpEmail(request.getEmail(), peekLastCode(request.getEmail(), PURPOSE_RESET));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        OtpToken otp = findValidOtp(request.getEmail(), request.getCode(), PURPOSE_RESET);
        otp.setUsed(true);
        otpRepository.save(otp);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);
    }

    private OtpToken buildOtp(String email, String purpose) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        return OtpToken.builder()
                .email(email)
                .code(code)
                .purpose(purpose)
                .expiresAt(OffsetDateTime.now().plusMinutes(10))
                .used(false)
                .build();
    }

    private String peekLastCode(String email, String purpose) {
        return otpRepository.findLatestUnused(email, purpose)
                .orElseThrow(() -> new IllegalStateException("OTP save failed"))
                .getCode();
    }

    private OtpToken findValidOtp(String email, String code, String purpose) {
        OtpToken otp = otpRepository.findLatestUnused(email, purpose)
                .orElseThrow(() -> new IllegalArgumentException("No valid OTP found. Please request a new one."));
        if (otp.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Please request a new one.");
        }
        if (!otp.getCode().equals(code)) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }
        return otp;
    }

    private AuthResponse issueTokens(User user) {
        String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getRole().name());

        RefreshToken entity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000))
                .build();

        refreshTokenRepository.save(entity);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtil.getExpirationMs())
                .build();
    }
}
