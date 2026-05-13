import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { ChatMessageDTO } from '../services/chatService';

interface UseStompChatOptions {
  conversationId: string | null;
  onMessage: (msg: ChatMessageDTO) => void;
}

export function useStompChat({ conversationId, onMessage }: UseStompChatOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected || !conversationId) return;
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content }),
    });
  }, [conversationId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !conversationId) return;

    const client = new Client({
      // Native WebSocket — no SockJS, no `global` polyfill needed
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${conversationId}`, (frame) => {
          try {
            const msg: ChatMessageDTO = JSON.parse(frame.body);
            onMessageRef.current(msg);
          } catch { /* ignore malformed frame */ }
        });
      },
      onStompError: (frame) => console.warn('STOMP error', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); clientRef.current = null; };
  }, [conversationId]);

  return { sendMessage };
}
