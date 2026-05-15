package com.healthcare.modules.admin.controller;

import com.healthcare.modules.admin.dto.*;
import com.healthcare.modules.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN_ROLE')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── Stats ──────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ── Users ──────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getUsers(role, search));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserDto> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> updateRole(@PathVariable UUID id,
                                                    @RequestBody UpdateRoleRequest req) {
        return ResponseEntity.ok(adminService.updateUserRole(id, req.getRole()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ── Doctors ────────────────────────────────────────────────────────────
    @GetMapping("/doctors")
    public ResponseEntity<List<AdminDoctorDto>> getDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    @PatchMapping("/doctors/{id}/availability")
    public ResponseEntity<AdminDoctorDto> toggleDoctorAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.toggleDoctorAvailability(id));
    }

    // ── Clinics ────────────────────────────────────────────────────────────
    @GetMapping("/clinics")
    public ResponseEntity<List<AdminClinicDto>> getClinics() {
        return ResponseEntity.ok(adminService.getAllClinics());
    }

    @DeleteMapping("/clinics/{id}")
    public ResponseEntity<Void> deleteClinic(@PathVariable UUID id) {
        adminService.deleteClinic(id);
        return ResponseEntity.noContent().build();
    }

    // ── Appointments ───────────────────────────────────────────────────────
    @GetMapping("/appointments")
    public ResponseEntity<List<AdminAppointmentDto>> getAppointments(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllAppointments(status));
    }

    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<AdminAppointmentDto> updateAppointmentStatus(
            @PathVariable UUID id, @RequestBody UpdateStatusRequest req) {
        return ResponseEntity.ok(adminService.updateAppointmentStatus(id, req.getStatus()));
    }

    // ── Payments ───────────────────────────────────────────────────────────
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentSummaryDto>> getPayments() {
        return ResponseEntity.ok(adminService.getAllPayments());
    }
}
