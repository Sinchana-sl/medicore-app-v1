package com.healthcare.modules.chat.repository;

import com.healthcare.modules.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversationId = :convId AND m.senderId <> :readerId AND m.isRead = false")
    void markAsRead(@Param("convId") UUID convId, @Param("readerId") UUID readerId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversationId = :convId AND m.senderId <> :userId AND m.isRead = false")
    long countUnread(@Param("convId") UUID convId, @Param("userId") UUID userId);
}
