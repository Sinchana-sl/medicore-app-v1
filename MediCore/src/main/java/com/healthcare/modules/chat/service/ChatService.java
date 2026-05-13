package com.healthcare.modules.chat.service;

import com.healthcare.modules.appointment.repository.AppointmentRepository;
import com.healthcare.modules.auth.entity.User;
import com.healthcare.modules.auth.repository.UserRepository;
import com.healthcare.modules.chat.dto.*;
import com.healthcare.modules.chat.entity.ChatConversation;
import com.healthcare.modules.chat.entity.ChatMessage;
import com.healthcare.modules.chat.repository.ChatConversationRepository;
import com.healthcare.modules.chat.repository.ChatMessageRepository;
import com.healthcare.modules.doctor.entity.DoctorProfile;
import com.healthcare.modules.doctor.repository.DoctorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatConversationRepository convRepo;
    private final ChatMessageRepository msgRepo;
    private final UserRepository userRepo;
    private final DoctorProfileRepository doctorProfileRepo;
    private final AppointmentRepository appointmentRepo;

    public List<ConversationDTO> getConversations(String email) {
        User me = getUser(email);
        boolean isDoctor = me.getRole().name().equals("DOCTOR_ROLE");
        List<ChatConversation> convs = isDoctor
                ? convRepo.findByDoctorIdOrderByUpdatedAtDesc(me.getId())
                : convRepo.findByPatientIdOrderByUpdatedAtDesc(me.getId());

        return convs.stream().map(c -> {
            UUID otherId = isDoctor ? c.getPatientId() : c.getDoctorId();
            User other = userRepo.findById(otherId).orElse(null);
            String name = other != null
                    ? (other.getFirstName() + " " + other.getLastName()).trim()
                    : "Unknown";
            if (name.isBlank()) name = other != null ? other.getEmail() : "Unknown";
            long unread = msgRepo.countUnread(c.getId(), me.getId());
            return ConversationDTO.builder()
                    .id(c.getId())
                    .otherUserId(otherId)
                    .otherUserName(isDoctor ? name : "Dr. " + name)
                    .otherUserRole(isDoctor ? "PATIENT_ROLE" : "DOCTOR_ROLE")
                    .doctorProfileId(c.getDoctorProfileId())
                    .lastMessage(c.getLastMessage())
                    .lastMessageAt(c.getLastMessageAt())
                    .unreadCount(unread)
                    .createdAt(c.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<ChatMessageDTO> getMessages(String email, UUID convId) {
        User me = getUser(email);
        ChatConversation conv = convRepo.findById(convId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        assertAccess(me, conv);
        msgRepo.markAsRead(convId, me.getId());
        return msgRepo.findByConversationIdOrderByCreatedAtAsc(convId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EligibleDoctorDTO> getEligibleDoctors(String patientEmail) {
        User patient = getUser(patientEmail);
        List<UUID> profileIds = appointmentRepo.findInPersonDoctorProfileIds(patient.getId());
        return profileIds.stream()
                .map(doctorProfileRepo::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(p -> {
                    User doc = userRepo.findById(p.getUserId()).orElse(null);
                    String firstName = doc != null ? doc.getFirstName() : "";
                    String lastName = doc != null ? doc.getLastName() : "";
                    return EligibleDoctorDTO.builder()
                            .profileId(p.getId())
                            .firstName(firstName)
                            .lastName(lastName)
                            .specialization(p.getSpecialization())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDTO startConversation(String patientEmail, StartConversationRequest req) {
        User patient = getUser(patientEmail);
        boolean eligible = appointmentRepo.existsByPatientIdAndDoctorProfileIdAndConsultationTypeAndStatus(
                patient.getId(), req.getDoctorProfileId(), "IN_PERSON", "COMPLETED");
        if (!eligible)
            throw new IllegalArgumentException("You can only chat with doctors you've had a completed in-person appointment with.");
        DoctorProfile profile = doctorProfileRepo.findById(req.getDoctorProfileId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
        User doctor = userRepo.findById(profile.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor user not found"));

        ChatConversation conv = convRepo.findByPatientIdAndDoctorId(patient.getId(), doctor.getId())
                .orElseGet(() -> convRepo.save(ChatConversation.builder()
                        .patientId(patient.getId())
                        .doctorId(doctor.getId())
                        .doctorProfileId(profile.getId())
                        .build()));

        String doctorName = ("Dr. " + doctor.getFirstName() + " " + doctor.getLastName()).trim();
        return ConversationDTO.builder()
                .id(conv.getId())
                .otherUserId(doctor.getId())
                .otherUserName(doctorName)
                .otherUserRole("DOCTOR_ROLE")
                .doctorProfileId(conv.getDoctorProfileId())
                .lastMessage(conv.getLastMessage())
                .lastMessageAt(conv.getLastMessageAt())
                .unreadCount(0)
                .createdAt(conv.getCreatedAt())
                .build();
    }

    @Transactional
    public ChatMessageDTO saveMessage(UUID senderId, SendMessageRequest req) {
        ChatConversation conv = convRepo.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        assertAccessById(sender.getId(), conv);

        ChatMessage msg = ChatMessage.builder()
                .conversationId(conv.getId())
                .senderId(sender.getId())
                .senderRole(sender.getRole().name())
                .content(req.getContent().trim())
                .isRead(false)
                .build();
        msg = msgRepo.save(msg);

        conv.setLastMessage(req.getContent().length() > 80 ? req.getContent().substring(0, 80) + "\u2026" : req.getContent());
        conv.setLastMessageAt(OffsetDateTime.now());
        convRepo.save(conv);

        return toDTO(msg);
    }

    @Transactional
    public void markRead(String email, UUID convId) {
        User me = getUser(email);
        msgRepo.markAsRead(convId, me.getId());
    }

    private void assertAccess(User user, ChatConversation conv) {
        if (!conv.getPatientId().equals(user.getId()) && !conv.getDoctorId().equals(user.getId()))
            throw new IllegalArgumentException("Access denied");
    }

    private void assertAccessById(UUID userId, ChatConversation conv) {
        if (!conv.getPatientId().equals(userId) && !conv.getDoctorId().equals(userId))
            throw new IllegalArgumentException("Access denied");
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        return ChatMessageDTO.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .senderRole(m.getSenderRole())
                .content(m.getContent())
                .isRead(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
