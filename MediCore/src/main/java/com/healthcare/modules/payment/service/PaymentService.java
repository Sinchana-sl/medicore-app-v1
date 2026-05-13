package com.healthcare.modules.payment.service;

import com.healthcare.modules.appointment.entity.AppAppointment;
import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.doctor.entity.DoctorSlot;
import com.healthcare.modules.doctor.repository.DoctorSlotRepository;
import com.healthcare.modules.notifications.EmailService;
import com.healthcare.modules.payment.dto.*;
import com.healthcare.modules.payment.entity.Payment;
import com.healthcare.modules.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ReceiptPdfService receiptPdfService;
    private final DoctorSlotRepository doctorSlotRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Transactional
    public PaymentOrderResponse createOrder(String email, CreateOrderRequest request) {
        User user = getUser(email);
        AppAppointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatientId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new IllegalStateException("Appointment has been cancelled");
        }

        long amountPaise = appointment.getAmountPaise() != null ? appointment.getAmountPaise() : 0L;
        if (amountPaise <= 0) {
            throw new IllegalStateException("Invalid appointment amount");
        }

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject orderReq = new JSONObject();
            orderReq.put("amount", amountPaise);
            orderReq.put("currency", "INR");
            orderReq.put("receipt", "appt_" + appointment.getId().toString().replace("-", "").substring(0, 16));
            orderReq.put("payment_capture", 1);

            Order razorpayOrder = client.orders.create(orderReq);
            String orderId = razorpayOrder.get("id");

            appointment.setRazorpayOrderId(orderId);
            appointmentRepository.save(appointment);

            Payment payment = Payment.builder()
                    .appointmentId(appointment.getId())
                    .patientId(user.getId())
                    .razorpayOrderId(orderId)
                    .amountPaise(amountPaise)
                    .currency("INR")
                    .status("CREATED")
                    .build();
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .orderId(orderId)
                    .amountPaise(amountPaise)
                    .currency("INR")
                    .keyId(keyId)
                    .appointmentId(appointment.getId().toString())
                    .patientName(user.getFirstName() + " " + user.getLastName())
                    .patientEmail(user.getEmail())
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment gateway error: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentResponse verifyAndConfirm(String email, VerifyPaymentRequest request) {
        User user = getUser(email);

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        AppAppointment appointment = appointmentRepository.findById(payment.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatientId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }

        boolean valid = verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
        if (!valid) {
            payment.setStatus("FAILED");
            payment.setErrorDescription("Signature verification failed");
            paymentRepository.save(payment);
            throw new SecurityException("Payment signature verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        appointment.setPaymentStatus("PAID");
        appointment.setStatus("CONFIRMED");
        appointmentRepository.save(appointment);

        markSlotBooked(appointment);
        sendReceiptAsync(user, appointment, payment);

        return toResponse(payment);
    }

    public PaymentResponse getPaymentByAppointment(String email, UUID appointmentId) {
        User user = getUser(email);
        AppAppointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getPatientId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        Payment payment = paymentRepository.findTopByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("No payment for this appointment"));
        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse simulateSuccess(String email, SimulatePaymentRequest request) {
        if (!keyId.startsWith("rzp_test_")) {
            throw new IllegalStateException("Simulate endpoint is only available in test mode");
        }
        User user = getUser(email);
        AppAppointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getPatientId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new IllegalStateException("Appointment has been cancelled");
        }

        String fakeOrderId  = "order_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        String fakePaymentId = "pay_test_"  + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        Payment payment = Payment.builder()
                .appointmentId(appointment.getId())
                .patientId(user.getId())
                .razorpayOrderId(fakeOrderId)
                .razorpayPaymentId(fakePaymentId)
                .razorpaySignature("simulated")
                .amountPaise(appointment.getAmountPaise() != null ? appointment.getAmountPaise() : 0L)
                .currency("INR")
                .status("PAID")
                .build();
        paymentRepository.save(payment);

        appointment.setPaymentStatus("PAID");
        appointment.setStatus("CONFIRMED");
        appointment.setRazorpayOrderId(fakeOrderId);
        appointmentRepository.save(appointment);

        markSlotBooked(appointment);
        sendReceiptAsync(user, appointment, payment);

        return toResponse(payment);
    }

    private void markSlotBooked(AppAppointment appointment) {
        if (appointment.getDoctorProfileId() == null
                || appointment.getAppointmentDate() == null
                || appointment.getStartTime() == null) return;
        doctorSlotRepository
                .findByDoctorIdAndSlotDateAndStartTime(
                        appointment.getDoctorProfileId(),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime())
                .filter(s -> "AVAILABLE".equals(s.getStatus()))
                .ifPresent(s -> {
                    s.setStatus("BOOKED");
                    s.setAppointmentId(appointment.getId());
                    doctorSlotRepository.save(s);
                });
    }

    private void sendReceiptAsync(User user, AppAppointment appointment, Payment payment) {
        try {
            String patientName = user.getFirstName() + " " + user.getLastName();
            String receiptNumber = "RCP-" + payment.getId().toString().replace("-", "").substring(0, 10).toUpperCase();
            String paymentDate = payment.getCreatedAt() != null
                    ? payment.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                    : java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
            long paise = payment.getAmountPaise() != null ? payment.getAmountPaise() : 0L;
            String amountFormatted = "₹" + String.format("%,.2f", paise / 100.0);

            ReceiptData receiptData = ReceiptData.builder()
                    .receiptNumber(receiptNumber)
                    .paymentDate(paymentDate)
                    .patientName(patientName)
                    .patientEmail(user.getEmail())
                    .doctorName(appointment.getDoctorName())
                    .specialty(appointment.getDoctorSpecialty())
                    .clinicName(appointment.getClinicName())
                    .appointmentDate(appointment.getAppointmentDate() != null
                            ? appointment.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "")
                    .appointmentTime(appointment.getStartTime() != null
                            ? appointment.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a")) : "")
                    .consultationType(appointment.getConsultationType())
                    .amountFormatted(amountFormatted)
                    .currency(payment.getCurrency())
                    .paymentMethod("Razorpay")
                    .appointmentId(appointment.getId().toString())
                    .build();

            byte[] pdf = receiptPdfService.generate(receiptData);
            emailService.sendPaymentReceiptEmail(user.getEmail(), patientName, pdf);
        } catch (Exception e) {
            log.error("Receipt email failed (non-fatal): {}", e.getMessage(), e);
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .amountPaise(p.getAmountPaise())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .appointmentId(p.getAppointmentId())
                .build();
    }
}
