package com.healthcare.modules.admin.service;

import com.healthcare.modules.admin.dto.*;
import com.healthcare.modules.appointment.entity.AppAppointment;
import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.enums.Role;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.doctor.entity.DoctorClinic;
import com.healthcare.modules.doctor.entity.DoctorProfile;
import com.healthcare.modules.doctor.repository.DoctorClinicRepository;
import com.healthcare.modules.doctor.repository.DoctorProfileRepository;
import com.healthcare.modules.payment.entity.Payment;
import com.healthcare.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorClinicRepository doctorClinicRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    // ── Stats ─────────────────────────────────────────────────────────────────

    public AdminStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPatients = userRepository.countByRole(Role.PATIENT_ROLE);
        long totalDoctors = userRepository.countByRole(Role.DOCTOR_ROLE);
        long totalAppointments = appointmentRepository.count();
        long pendingAppointments = appointmentRepository.countByStatus("PENDING") +
                appointmentRepository.countByStatus("CONFIRMED");
        long completedAppointments = appointmentRepository.countByStatus("COMPLETED");
        Long totalRevenuePaise = paymentRepository.sumCapturedAmountPaise();
        long capturedPayments = paymentRepository.countByStatus("captured");
        long pendingPayments = paymentRepository.countByStatus("created");

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .pendingAppointments(pendingAppointments)
                .completedAppointments(completedAppointments)
                .totalRevenueRupees(totalRevenuePaise != null ? totalRevenuePaise / 100 : 0)
                .capturedPayments(capturedPayments)
                .pendingPayments(pendingPayments)
                .build();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public List<AdminUserDto> getUsers(String roleStr, String search) {
        Role role = null;
        if (roleStr != null && !roleStr.isBlank()) {
            try { role = Role.valueOf(roleStr); } catch (IllegalArgumentException ignored) {}
        }
        boolean hasSearch = search != null && !search.isBlank();

        List<User> users;
        if (role != null && hasSearch) {
            users = userRepository.searchByRoleAndText(role, search);
        } else if (role != null) {
            users = userRepository.findByRoleOrderByCreatedAtDesc(role);
        } else if (hasSearch) {
            users = userRepository.searchByText(search);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }
        return users.stream().map(this::toUserDto).collect(Collectors.toList());
    }

    public AdminUserDto toggleUserStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN_ROLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate the admin account");
        }
        user.setActive(!user.isActive());
        return toUserDto(userRepository.save(user));
    }

    public AdminUserDto updateUserRole(UUID userId, String roleStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Role newRole = Role.valueOf(roleStr);
        if (newRole == Role.ADMIN_ROLE) {
            boolean adminExists = userRepository.countByRole(Role.ADMIN_ROLE) > 0;
            if (adminExists && !user.getRole().equals(Role.ADMIN_ROLE)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Only one admin account is allowed");
            }
        }
        user.setRole(newRole);
        return toUserDto(userRepository.save(user));
    }

    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN_ROLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete the admin account");
        }
        userRepository.deleteById(userId);
    }

    // ── Doctors ───────────────────────────────────────────────────────────────

    public List<AdminDoctorDto> getAllDoctors() {
        List<DoctorProfile> profiles = doctorProfileRepository.findAll();
        List<UUID> userIds = profiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Count clinics per doctor
        List<UUID> doctorProfileIds = profiles.stream().map(DoctorProfile::getId).collect(Collectors.toList());
        Map<UUID, Long> clinicCounts = doctorClinicRepository
                .findAll().stream()
                .filter(c -> doctorProfileIds.contains(c.getDoctorId()))
                .collect(Collectors.groupingBy(DoctorClinic::getDoctorId, Collectors.counting()));

        return profiles.stream()
                .map(p -> {
                    User u = userMap.get(p.getUserId());
                    return AdminDoctorDto.builder()
                            .profileId(p.getId())
                            .userId(p.getUserId())
                            .email(u != null ? u.getEmail() : "")
                            .firstName(u != null ? u.getFirstName() : "")
                            .lastName(u != null ? u.getLastName() : "")
                            .phone(u != null ? u.getPhone() : null)
                            .specialization(p.getSpecialization())
                            .licenseNumber(p.getLicenseNumber())
                            .yearsExperience(p.getYearsExperience())
                            .consultationFee(p.getConsultationFee())
                            .isAvailable(p.isAvailable())
                            .isActive(u != null && u.isActive())
                            .clinicCount(clinicCounts.getOrDefault(p.getId(), 0L).intValue())
                            .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(FMT) : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    public AdminDoctorDto toggleDoctorAvailability(UUID profileId) {
        DoctorProfile profile = doctorProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        profile.setAvailable(!profile.isAvailable());
        doctorProfileRepository.save(profile);

        User u = userRepository.findById(profile.getUserId()).orElse(null);
        long clinicCount = doctorClinicRepository.findByDoctorIdOrderByIsPrimaryDescNameAsc(profileId).size();

        return AdminDoctorDto.builder()
                .profileId(profile.getId())
                .userId(profile.getUserId())
                .email(u != null ? u.getEmail() : "")
                .firstName(u != null ? u.getFirstName() : "")
                .lastName(u != null ? u.getLastName() : "")
                .phone(u != null ? u.getPhone() : null)
                .specialization(profile.getSpecialization())
                .licenseNumber(profile.getLicenseNumber())
                .yearsExperience(profile.getYearsExperience())
                .consultationFee(profile.getConsultationFee())
                .isAvailable(profile.isAvailable())
                .isActive(u != null && u.isActive())
                .clinicCount((int) clinicCount)
                .createdAt(profile.getCreatedAt() != null ? profile.getCreatedAt().format(FMT) : "")
                .build();
    }

    // ── Clinics ───────────────────────────────────────────────────────────────

    public List<AdminClinicDto> getAllClinics() {
        List<DoctorClinic> clinics = doctorClinicRepository.findAll();
        List<UUID> doctorIds = clinics.stream().map(DoctorClinic::getDoctorId).distinct().collect(Collectors.toList());

        Map<UUID, DoctorProfile> profileMap = doctorProfileRepository.findAllById(doctorIds).stream()
                .collect(Collectors.toMap(DoctorProfile::getId, p -> p));
        Map<UUID, User> userByProfileId = new HashMap<>();
        profileMap.forEach((id, p) -> userRepository.findById(p.getUserId()).ifPresent(u -> userByProfileId.put(id, u)));

        return clinics.stream().map(c -> {
            DoctorProfile p = profileMap.get(c.getDoctorId());
            User u = p != null ? userByProfileId.get(p.getId()) : null;
            return AdminClinicDto.builder()
                    .id(c.getId())
                    .doctorId(c.getDoctorId())
                    .doctorName(u != null ? u.getFirstName() + " " + u.getLastName() : "")
                    .doctorEmail(u != null ? u.getEmail() : "")
                    .specialization(p != null ? p.getSpecialization() : "")
                    .name(c.getName())
                    .address(c.getAddress())
                    .city(c.getCity())
                    .state(c.getState())
                    .pincode(c.getPincode())
                    .phone(c.getPhone())
                    .isPrimary(c.isPrimary())
                    .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().format(FMT) : "")
                    .build();
        }).collect(Collectors.toList());
    }

    public void deleteClinic(UUID clinicId) {
        if (!doctorClinicRepository.existsById(clinicId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found");
        }
        doctorClinicRepository.deleteById(clinicId);
    }

    // ── Appointments ──────────────────────────────────────────────────────────

    public List<AdminAppointmentDto> getAllAppointments(String status) {
        List<AppAppointment> appointments = (status != null && !status.isBlank())
                ? appointmentRepository.findByStatusOrderByCreatedAtDesc(status)
                : appointmentRepository.findAllByOrderByCreatedAtDesc();

        List<UUID> patientIds = appointments.stream().map(AppAppointment::getPatientId).distinct().collect(Collectors.toList());
        Map<UUID, User> patientMap = userRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return appointments.stream().map(a -> {
            User patient = patientMap.get(a.getPatientId());
            return AdminAppointmentDto.builder()
                    .id(a.getId())
                    .patientId(a.getPatientId())
                    .patientEmail(patient != null ? patient.getEmail() : "")
                    .patientName(a.getPatientName() != null ? a.getPatientName()
                            : (patient != null ? patient.getFirstName() + " " + patient.getLastName() : ""))
                    .doctorId(a.getDoctorId())
                    .doctorName(a.getDoctorName())
                    .doctorSpecialty(a.getDoctorSpecialty())
                    .clinicName(a.getClinicName())
                    .appointmentDate(a.getAppointmentDate() != null ? a.getAppointmentDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "")
                    .startTime(a.getStartTime() != null ? a.getStartTime().format(TIME_FMT) : "")
                    .consultationType(a.getConsultationType())
                    .status(a.getStatus())
                    .paymentStatus(a.getPaymentStatus())
                    .amountRupees(a.getAmountPaise() != null ? a.getAmountPaise() / 100 : null)
                    .reason(a.getReason())
                    .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().format(FMT) : "")
                    .build();
        }).collect(Collectors.toList());
    }

    public AdminAppointmentDto updateAppointmentStatus(UUID appointmentId, String status) {
        AppAppointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        appt.setStatus(status);
        appointmentRepository.save(appt);
        User patient = userRepository.findById(appt.getPatientId()).orElse(null);
        return AdminAppointmentDto.builder()
                .id(appt.getId())
                .patientId(appt.getPatientId())
                .patientEmail(patient != null ? patient.getEmail() : "")
                .patientName(appt.getPatientName() != null ? appt.getPatientName()
                        : (patient != null ? patient.getFirstName() + " " + patient.getLastName() : ""))
                .doctorId(appt.getDoctorId())
                .doctorName(appt.getDoctorName())
                .doctorSpecialty(appt.getDoctorSpecialty())
                .clinicName(appt.getClinicName())
                .appointmentDate(appt.getAppointmentDate() != null ? appt.getAppointmentDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "")
                .startTime(appt.getStartTime() != null ? appt.getStartTime().format(TIME_FMT) : "")
                .consultationType(appt.getConsultationType())
                .status(appt.getStatus())
                .paymentStatus(appt.getPaymentStatus())
                .amountRupees(appt.getAmountPaise() != null ? appt.getAmountPaise() / 100 : null)
                .reason(appt.getReason())
                .createdAt(appt.getCreatedAt() != null ? appt.getCreatedAt().format(FMT) : "")
                .build();
    }

    // ── Payments ──────────────────────────────────────────────────────────────

    public List<PaymentSummaryDto> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toPaymentDto)
                .collect(Collectors.toList());
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private AdminUserDto toUserDto(User u) {
        return AdminUserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole().name())
                .phone(u.getPhone())
                .isActive(u.isActive())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : "")
                .build();
    }

    private PaymentSummaryDto toPaymentDto(Payment p) {
        return PaymentSummaryDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .amountRupees(p.getAmountPaise() / 100)
                .currency(p.getCurrency())
                .status(p.getStatus())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(FMT) : "")
                .build();
    }
}
