package com.healthcare.modules.appointment.service;

import com.healthcare.modules.appointment.dto.AppointmentResponse;
import com.healthcare.modules.appointment.dto.BookAppointmentRequest;
import com.healthcare.modules.appointment.entity.AppAppointment;
import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.doctor.entity.DoctorSlot;
import com.healthcare.modules.doctor.repository.DoctorProfileRepository;
import com.healthcare.modules.doctor.repository.DoctorSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorSlotRepository doctorSlotRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    public List<AppointmentResponse> getPatientAppointments(String email) {
        User user = getUser(email);
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateAscStartTimeAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse bookAppointment(String email, BookAppointmentRequest request) {
        User user = getUser(email);
        boolean isFree = request.getAmountPaise() == null || request.getAmountPaise() == 0;

        // Resolve the doctor's auth_users.id from their profile id so doctors can query their appointments
        UUID doctorUserId = null;
        if (request.getDoctorProfileId() != null) {
            doctorUserId = doctorProfileRepository.findById(request.getDoctorProfileId())
                    .map(p -> p.getUserId())
                    .orElse(null);
        }

        AppAppointment appt = AppAppointment.builder()
                .patientId(user.getId())
                .doctorId(doctorUserId)
                .doctorName(request.getDoctorName())
                .doctorSpecialty(request.getDoctorSpecialty())
                .clinicName(request.getClinicName())
                .doctorImageUrl(request.getDoctorImageUrl())
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .consultationType(request.getConsultationType() != null ? request.getConsultationType() : "IN_PERSON")
                .status(isFree ? "CONFIRMED" : "PAYMENT_PENDING")
                .paymentStatus(isFree ? "PAID" : "PENDING")
                .amountPaise(request.getAmountPaise())
                .doctorProfileId(request.getDoctorProfileId())
                .reason(request.getReason())
                .isForSelf(request.isForSelf())
                .patientName(request.isForSelf() ? user.getFirstName() + " " + user.getLastName() : request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .whatsappUpdates(request.isWhatsappUpdates())
                .canJoin(false)
                .build();

        AppAppointment saved = appointmentRepository.save(appt);

        // Mark the booked slot as BOOKED so it disappears from the public availability view
        markSlotBooked(request, saved.getId());

        return toResponse(saved);
    }

    /** Finds the corresponding DoctorSlot (by explicit slotId or by doctor+date+time) and marks it BOOKED. */
    void markSlotBooked(BookAppointmentRequest request, UUID appointmentId) {
        if (request.getDoctorProfileId() == null
                || request.getAppointmentDate() == null
                || request.getStartTime() == null) return;

        Optional<DoctorSlot> slotOpt = Optional.empty();

        // Prefer explicit slotId passed from frontend
        if (request.getSlotId() != null) {
            slotOpt = doctorSlotRepository.findById(request.getSlotId());
        }

        // Fallback: find by doctor profile + date + startTime (handles virtual-slot case)
        if (slotOpt.isEmpty()) {
            slotOpt = doctorSlotRepository.findByDoctorIdAndSlotDateAndStartTime(
                    request.getDoctorProfileId(),
                    request.getAppointmentDate(),
                    request.getStartTime());
        }

        slotOpt.filter(s -> "AVAILABLE".equals(s.getStatus())).ifPresent(s -> {
            s.setStatus("BOOKED");
            s.setAppointmentId(appointmentId);
            doctorSlotRepository.save(s);
        });
    }

    @Transactional
    public AppointmentResponse cancelAppointment(String email, UUID appointmentId) {
        User user = getUser(email);
        AppAppointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));
        if (!appt.getPatientId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized to cancel this appointment");
        }
        appt.setStatus("CANCELLED");
        return toResponse(appointmentRepository.save(appt));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private AppointmentResponse toResponse(AppAppointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .doctorName(a.getDoctorName())
                .doctorSpecialty(a.getDoctorSpecialty())
                .clinicName(a.getClinicName())
                .doctorImageUrl(a.getDoctorImageUrl())
                .appointmentDate(a.getAppointmentDate().format(DATE_FMT))
                .startTime(a.getStartTime().format(TIME_FMT))
                .consultationType(a.getConsultationType())
                .status(a.getStatus())
                .reason(a.getReason())
                .isForSelf(a.isForSelf())
                .patientName(a.getPatientName())
                .whatsappUpdates(a.isWhatsappUpdates())
                .canJoin(a.isCanJoin())
                .patientPhone(a.getPatientPhone())
                .paymentStatus(a.getPaymentStatus())
                .amountPaise(a.getAmountPaise())
                .doctorProfileId(a.getDoctorProfileId())
                .razorpayOrderId(a.getRazorpayOrderId())
                .build();
    }
}
