package com.healthcare.modules.appointment.service;

import com.healthcare.modules.appointment.entity.AppAppointment;
import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.notifications.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    // Runs every minute; sends email for appointments starting in 25–35 min from now
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void sendReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime windowStart = now.plusMinutes(25);
        LocalTime windowEnd   = now.plusMinutes(35);

        List<AppAppointment> due = appointmentRepository
                .findAppointmentsNeedingReminder(today, windowStart, windowEnd);

        for (AppAppointment appt : due) {
            try {
                Optional<User> userOpt = userRepository.findById(appt.getPatientId());
                if (userOpt.isEmpty()) continue;

                User user = userOpt.get();
                String displayName = (user.getFirstName() != null ? user.getFirstName() : user.getEmail());
                emailService.sendReminderEmail(
                        user.getEmail(),
                        displayName,
                        appt.getDoctorName(),
                        appt.getAppointmentDate().format(DATE_FMT),
                        appt.getStartTime().format(TIME_FMT),
                        appt.getClinicName()
                );
                appt.setReminderSent(true);
                appointmentRepository.save(appt);
                log.info("Reminder sent for appointment {} to {}", appt.getId(), user.getEmail());
            } catch (Exception e) {
                log.error("Failed to process reminder for appointment {}: {}", appt.getId(), e.getMessage());
            }
        }
    }
}
