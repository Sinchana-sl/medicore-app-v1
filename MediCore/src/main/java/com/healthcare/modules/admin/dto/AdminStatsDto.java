package com.healthcare.modules.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDto {
    private long totalUsers;
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long pendingAppointments;
    private long completedAppointments;
    private long totalRevenueRupees;
    private long capturedPayments;
    private long pendingPayments;
}
