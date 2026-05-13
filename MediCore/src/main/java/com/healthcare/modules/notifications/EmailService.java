package com.healthcare.modules.notifications;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendWelcomeEmail(String toEmail, String role) {
        String roleFriendly = role.replace("_ROLE", "").charAt(0)
                + role.replace("_ROLE", "").substring(1).toLowerCase();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to MediCore!");
            helper.setText(buildWelcomeHtml(toEmail, roleFriendly), true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to {}", toEmail);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your MediCore login code");
            helper.setText(buildOtpHtml(otp), true);

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Could not send OTP email. Please try again.");
        }
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset your MediCore password");
            helper.setText(buildPasswordResetOtpHtml(otp), true);

            mailSender.send(message);
            log.info("Password reset OTP sent to {}", toEmail);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send password reset OTP to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Could not send reset code. Please try again.");
        }
    }

    public void sendReminderEmail(String toEmail, String patientName, String doctorName, String date, String time, String clinicName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("MediCore – Appointment reminder in 30 minutes");
            helper.setText(buildReminderHtml(patientName, doctorName, date, time, clinicName), true);
            mailSender.send(message);
            log.info("Reminder email sent to {}", toEmail);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send reminder email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPaymentReceiptEmail(String toEmail, String patientName, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("MediCore – Payment Receipt & Appointment Confirmed");
            helper.setText(buildReceiptHtml(patientName), true);
            helper.addAttachment("MediCore_Receipt.pdf", new ByteArrayResource(pdfBytes), "application/pdf");
            mailSender.send(message);
            log.info("Receipt email sent to {}", toEmail);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send receipt email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildReminderHtml(String patientName, String doctorName, String date, String time, String clinicName) {
        String clinic = (clinicName != null && !clinicName.isBlank()) ? clinicName : "your clinic";
        return """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px">
                  <div style="background:linear-gradient(135deg,#0061a5,#0891b2);padding:24px 28px;border-radius:8px 8px 0 0;margin:-32px -32px 24px">
                    <h1 style="color:#fff;margin:0;font-size:22px">MediCore</h1>
                    <p style="color:rgba(200,230,255,0.9);margin:4px 0 0;font-size:13px">Your appointment is in 30 minutes</p>
                  </div>
                  <p style="color:#374151;font-size:15px">Hi <strong>%s</strong>,</p>
                  <p style="color:#374151;font-size:15px">This is a reminder that your appointment is starting soon.</p>
                  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
                    <table style="width:100%%;border-collapse:collapse">
                      <tr><td style="color:#64748b;font-size:13px;padding:4px 0;width:110px">Doctor</td><td style="color:#0f172a;font-weight:700;font-size:14px">%s</td></tr>
                      <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Date</td><td style="color:#0f172a;font-weight:600;font-size:14px">%s</td></tr>
                      <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Time</td><td style="color:#0061a5;font-weight:800;font-size:16px">%s</td></tr>
                      <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Clinic</td><td style="color:#0f172a;font-size:14px">%s</td></tr>
                    </table>
                  </div>
                  <a href="%s/appointments"
                     style="display:inline-block;margin-top:8px;padding:12px 24px;background:#0061a5;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600">
                    View My Appointments
                  </a>
                  <p style="color:#9CA3AF;font-size:12px;margin-top:28px">MediCore Healthcare Pvt. Ltd.</p>
                </div>
                """.formatted(patientName, doctorName, date, time, clinic, frontendUrl);
    }

    private String buildReceiptHtml(String patientName) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px">
                  <div style="background:linear-gradient(135deg,#0061a5,#0891b2);padding:24px 28px;border-radius:8px 8px 0 0;margin:-32px -32px 24px">
                    <h1 style="color:#fff;margin:0;font-size:22px">MediCore</h1>
                    <p style="color:rgba(200,230,255,0.9);margin:4px 0 0;font-size:13px">Healthcare at your fingertips</p>
                  </div>
                  <p style="color:#374151;font-size:15px">Hi <strong>%s</strong>,</p>
                  <p style="color:#374151;font-size:15px">
                    Your payment was successful and your appointment is now <strong style="color:#16a34a">confirmed</strong>!
                    Please find your payment receipt attached to this email.
                  </p>
                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
                    <span style="font-size:28px">✔</span>
                    <p style="color:#15803d;font-weight:700;margin:4px 0 0;font-size:15px">Payment Confirmed</p>
                  </div>
                  <p style="color:#6b7280;font-size:13px;margin-top:24px">
                    If you have any queries, please contact <a href="mailto:support@medicore.health" style="color:#0061a5">support@medicore.health</a>
                  </p>
                  <p style="color:#9CA3AF;font-size:11px;margin-top:16px">MediCore Healthcare Pvt. Ltd.</p>
                </div>
                """.formatted(patientName);
    }

    private String buildPasswordResetOtpHtml(String otp) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px">
                  <h2 style="color:#1565C0;margin-bottom:8px">Reset Your Password</h2>
                  <p style="color:#374151;font-size:15px">Use the code below to reset your MediCore password. It expires in <strong>10 minutes</strong>.</p>
                  <div style="margin:24px 0;text-align:center">
                    <span style="display:inline-block;letter-spacing:10px;font-size:36px;font-weight:700;color:#002045;background:#e8f0fe;padding:16px 24px;border-radius:8px">%s</span>
                  </div>
                  <p style="color:#9CA3AF;font-size:12px">If you did not request a password reset, you can safely ignore this email.</p>
                </div>
                """.formatted(otp);
    }

    private String buildOtpHtml(String otp) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px">
                  <h2 style="color:#1565C0;margin-bottom:8px">Your MediCore Login Code</h2>
                  <p style="color:#374151;font-size:15px">Use the code below to sign in. It expires in <strong>10 minutes</strong>.</p>
                  <div style="margin:24px 0;text-align:center">
                    <span style="display:inline-block;letter-spacing:10px;font-size:36px;font-weight:700;color:#002045;background:#e8f0fe;padding:16px 24px;border-radius:8px">%s</span>
                  </div>
                  <p style="color:#9CA3AF;font-size:12px">If you did not request this code, you can safely ignore this email.</p>
                </div>
                """.formatted(otp);
    }

    private String buildWelcomeHtml(String email, String role) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px">
                  <h1 style="color:#1565C0;margin-bottom:8px">Welcome to MediCore!</h1>
                  <p style="color:#374151;font-size:15px">Hi <strong>%s</strong>,</p>
                  <p style="color:#374151;font-size:15px">
                    Your account has been created successfully as a <strong>%s</strong>.
                    You can now log in and start using MediCore.
                  </p>
                  <a href="%s/login"
                     style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1565C0;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">
                    Go to MediCore
                  </a>
                  <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
                    If you did not create this account, please ignore this email.
                  </p>
                </div>
                """.formatted(email, role, frontendUrl);
    }
}
