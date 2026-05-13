package com.healthcare.modules.chat.controller;

import com.healthcare.modules.chat.dto.*;
import com.healthcare.modules.chat.service.ChatService;
import com.healthcare.security.JwtUtil;
import com.healthcare.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messaging;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/eligible-doctors")
    public ResponseEntity<List<EligibleDoctorDTO>> getEligibleDoctors(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.getEligibleDoctors(ud.getUsername()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.getConversations(ud.getUsername()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable UUID id) {
        return ResponseEntity.ok(chatService.getMessages(ud.getUsername(), id));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> start(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody StartConversationRequest req) {
        return ResponseEntity.ok(chatService.startConversation(ud.getUsername(), req));
    }

    @PatchMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable UUID id) {
        chatService.markRead(ud.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // STOMP: client sends to /app/chat.send
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest req, SimpMessageHeaderAccessor headerAccessor) {
        String token = (String) headerAccessor.getSessionAttributes().get("token");
        if (token == null) return;
        String email = jwtUtil.extractEmail(token);
        UUID senderId = userRepository.findByEmail(email)
                .orElseThrow().getId();
        ChatMessageDTO msg = chatService.saveMessage(senderId, req);
        // Broadcast to all subscribers of this conversation
        messaging.convertAndSend("/topic/chat/" + req.getConversationId(), msg);
    }
}
